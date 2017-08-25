var NODE_RADIUS = 15;
var LINK_WIDTH = 2;

class Node {
    constructor(id, x, y, text) {
        this.id = id;
        this.radius = NODE_RADIUS;
        this.graphics = getNodeGraphics(this.radius, text || '');
        this.graphics.x = x;
        this.graphics.y = y;
        this.neighbors = [];
        this.linkTo = {};
    }


    set x(v) { this.graphics.x = v; }
    get x() { return this.graphics.x; }
    set y(v) { this.graphics.y = v; }
    get y() { return this.graphics.y; }
}

function getNodeGraphics(r, text) {
    var c = new PIXI.Container();
    var g = new PIXI.Graphics();
    g.beginFill(0x000000);
    g.drawCircle(0, 0, r);
    g.endFill();
    c.addChild(g);
    if (text !== '') {
        var label = new PIXI.Text(text, { fontFamily: 'Arial', fontSize: 12, fill: 0xFFFFFF, align: 'center' });
        label.anchor.x = label.anchor.y = 0.5;
        c.addChild(label);
    }
    nodeLayer.addChild(c);
    return c;
}

function getLinkGraphics(x1, y1, x2, y2) {
    var g = new PIXI.Graphics();
    g.lineStyle(2, 0x0);
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);

    linkLayer.addChild(g);

    return g;
}

function lerpColor(start, end, amount) {
    var from = {
        r: (start & 0xFF0000) >> 16,
        g: (start & 0x00FF00) >> 8,
        b: (start & 0x0000FF)
    };
    var to = {
        r: (end & 0xFF0000) >> 16,
        g: (end & 0x00FF00) >> 8,
        b: (end & 0x0000FF)
    };
    var result = {
        r: lerp(from.r, to.r, amount) << 16,
        g: lerp(from.g, to.g, amount) << 8,
        b: lerp(from.b, to.b, amount)
    };
    return result.r | result.g | result.b;
}
/**
 * Gets the number from [a;b] at percentage u
 */
function lerp(a, b, u) {
    if (a <= b) {
        return a + (b - a) * u;
    } else {
        return b + (a - b) * (1 - u);
    }
}

class Link {
    constructor(nodeA, nodeB) {
        this.nodeA = nodeA;
        this.nodeB = nodeB;
        this.graphics = getLinkGraphics(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
        this.pheromones = 0;
    }

    getOther(node) {
        if (node === this.nodeA)
            return this.nodeB;
        if (node === this.nodeB)
            return this.nodeA;

        throw "Exception: The given node isn't attached to this link";
    }

    placePheromone(strength) {
        this.pheromones += strength;
        this.pheromones = Math.min(1, this.pheromones);
    }

    decayPheromone() {
        this.pheromones = this.pheromones * (1 - PHEROMONE_DECAY_RATE);
        var g = this.graphics;
        g.clear();
        g.lineStyle(LINK_WIDTH, lerpColor(0x0, 0xFFFFFF, this.pheromones));
        g.moveTo(this.nodeA.x, this.nodeA.y);
        g.lineTo(this.nodeB.x, this.nodeB.y);
    }
}

class World {
    constructor() {
        var nodes = [];
        this.links = [];

        //add nodes
        nodes.push(new Node(0, 30, 224, 'S'));
        nodes.push(new Node(1, 100, 300, ''));
        nodes.push(new Node(2, 200, 356, ''));
        nodes.push(new Node(3, 222, 169, ''));
        nodes.push(new Node(4, 398, 178, ''));
        nodes.push(new Node(5, 400, 300, ''));
        nodes.push(new Node(6, 567, 178, ''));
        nodes.push(new Node(7, 700, 250, ''));
        nodes.push(new Node(8, 867, 178, ''));
        nodes.push(new Node(9, 948, 224, 'E'));

        // //link nodes
        this.linkNode(nodes[0], nodes[1]);
        this.linkNode(nodes[0], nodes[3]);
        this.linkNode(nodes[1], nodes[3]);
        this.linkNode(nodes[1], nodes[2]);
        this.linkNode(nodes[2], nodes[3]);
        this.linkNode(nodes[3], nodes[4]);
        this.linkNode(nodes[2], nodes[5]);
        this.linkNode(nodes[3], nodes[5]);
        this.linkNode(nodes[4], nodes[5]);
        this.linkNode(nodes[4], nodes[6]);
        this.linkNode(nodes[5], nodes[6]);
        this.linkNode(nodes[6], nodes[7]);
        this.linkNode(nodes[5], nodes[7]);
        this.linkNode(nodes[6], nodes[8]);
        this.linkNode(nodes[7], nodes[8]);
        this.linkNode(nodes[7], nodes[9]);
        this.linkNode(nodes[8], nodes[9]);

        // nodes.push(new Node(0, 30, 224, 'S'));
        // nodes.push(new Node(1, 180, 227, 1));
        // nodes.push(new Node(2, 284, 135, 2));
        // nodes.push(new Node(3, 420, 138, 3));
        // nodes.push(new Node(4, 500, 233, 4));
        // nodes.push(new Node(5, 534, 532, 5));
        // nodes.push(new Node(6, 73, 531, 6));
        // nodes.push(new Node(7, 728, 234, 'E'));
        

        // this.linkNode(nodes[0], nodes[1]);
        // this.linkNode(nodes[1], nodes[6]);
        // this.linkNode(nodes[6], nodes[5]);
        // this.linkNode(nodes[5], nodes[4]);
        // this.linkNode(nodes[1], nodes[4]);
        // this.linkNode(nodes[4], nodes[7]);

        this.nodes = nodes;
    }

    removeNode(node) {
        //Disconnect
        var isNotNode = (o=>o!==node);
        for (var n of node.neighbors) {
            n.neighbors = n.neighbors.filter(isNotNode);
            delete n.linkTo[node.id];
        }

        //Remove links
        for (var link of Object.values(node.linkTo)) {
            this.removeLink(link);
        }

        //Stop rendering
        nodeLayer.removeChild(node.graphics);

        //Remove from array
        this.nodes.splice(this.nodes.indexOf(node), 1);
    }

    removeLink(link) {
        //Stop rendering
        linkLayer.removeChild(link.graphics);

        //Remove from array
        this.links.splice(this.links.indexOf(link), 1);
    }

    linkNode(nodeA, nodeB) {
        var link = new Link(nodeA, nodeB);

        nodeA.neighbors.push(nodeB);
        nodeB.neighbors.push(nodeA);
        nodeB.linkTo[nodeA.id] = nodeA.linkTo[nodeB.id] = link;
        this.links.push(link);
    }
}
