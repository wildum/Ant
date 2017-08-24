class Node {
    constructor(id, x, y, text) {
        this.id = id;
        this.radius = 15;
        this.graphics = getNodeGraphics(this.radius, text);
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
    g.lineStyle(2, 0);
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    linkLayer.addChild(g);
    return g;
}

function linkNode(nodeA, nodeB) {
    nodeA.neighbors.push(nodeB);
    nodeB.neighbors.push(nodeA);
    nodeB.linkTo[nodeA.id] = nodeA.linkTo[nodeB.id] = new Link(nodeA, nodeB);
}

class Link {
    constructor(nodeA, nodeB) {
        this.nodeA = nodeA;
        this.nodeB = nodeB;
        this.graphics = getLinkGraphics(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
    }

    getOther(node) {
        if (node === this.nodeA)
            return this.nodeB;
        if (node === this.nodeB)
            return this.nodeA;
        
        throw "Exception: The given node isn't attached to this link";
    }
}

class World {
    constructor() {
        var nodes = [];
        var links = [];

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

        //link nodes
        linkNode(nodes[0], nodes[1]);
        linkNode(nodes[0], nodes[3]);
        linkNode(nodes[1], nodes[3]);
        linkNode(nodes[1], nodes[2]);
        linkNode(nodes[2], nodes[3]);
        linkNode(nodes[3], nodes[4]);
        linkNode(nodes[2], nodes[5]);
        linkNode(nodes[3], nodes[5]);
        linkNode(nodes[4], nodes[5]);
        linkNode(nodes[4], nodes[6]);
        linkNode(nodes[5], nodes[6]);
        linkNode(nodes[6], nodes[7]);
        linkNode(nodes[5], nodes[7]);
        linkNode(nodes[6], nodes[8]);
        linkNode(nodes[7], nodes[8]);
        linkNode(nodes[7], nodes[9]);
        linkNode(nodes[8], nodes[9]);

        this.nodes = nodes;
    }
}
