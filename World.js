var NODE_RADIUS = 15;
var LINK_WIDTH = 2;
var nextNodeId = 0;

class Node {
    constructor(x, y, text) {
        this.id = nextNodeId++;
        this.radius = NODE_RADIUS;
        this.graphics = getNodeGraphics(this.radius, text || this.id.toString());
        this.text = text;
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
    var container = new PIXI.Container();
    var s = new PIXI.Sprite(discTexture);
    s.scale.set((2 * r) / discTexture.width);
    s.anchor.set(0.5);
    s.tint = 0x0;
    container.addChild(s);
    if (text !== '') {
        var label = new PIXI.Text(text, { fontFamily: 'Arial', fontSize: 12, fill: 0xFFFFFF, align: 'center' });
        label.anchor.x = label.anchor.y = 0.5;
        container.addChild(label);
    }
    nodeLayer.addChild(container);
    return container;
}

function getLinkGraphics(x1, y1, x2, y2) {
    var g = new PIXI.Graphics();
    var c = new PIXI.Container();

    g.lineStyle(2, 0x0);
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);

    var label = new PIXI.Text('', { fontFamily: 'Arial', fontSize: 12, fill: 0xFFFFFF, align: 'center' });
    label.anchor.x = label.anchor.y = 0.5;
    label.x = (x1 + x2) / 2;
    label.y = (y1 + y2) / 2;

    c.label = label;

    c.addChild(g);
    c.addChild(label);
    linkLayer.addChild(c);

    return c;
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
        this.pheromones = [];
        this.label = this.graphics.label;
    }

    getOther(node) {
        if (node === this.nodeA)
            return this.nodeB;
        if (node === this.nodeB)
            return this.nodeA;

        throw "Exception: The given node isn't attached to this link";
    }

    getTotalPheromones() {
        var total = 0;
        var i = this.pheromones.length;
        while (i--) {
            if (this.pheromones[i] <= 0) {
                this.pheromones.splice(i, 1);
            }
            else {
                total += this.pheromones[i];
            }
        }
        return total;
    }

    placePheromone(strength) {
        this.pheromones.push(strength);
    }

    decayPheromone() {
        this.pheromones = this.pheromones.map(p => p - PHEROMONE_DECAY_RATE);
        this.label.text = Math.floor(this.getTotalPheromones()).toString();

        // var g = this.graphics;
        // g.clear();
        // g.lineStyle(LINK_WIDTH, lerpColor(0x0, 0xFFFFFF, this.pheromones));
        // g.moveTo(this.nodeA.x, this.nodeA.y);
        // g.lineTo(this.nodeB.x, this.nodeB.y);
    }
}

class World {
    constructor() {
        this.nodes = [];
        this.links = [];

        if (localStorage.world) {
            this.parse(localStorage.world);
        } else {
            var nodes = this.nodes;

            //CHANGE THE SIMULATION IF YOU CHANGE THE MAP

            //add nodes
            nodes.push(new Node(150, 224, 'S'));
            nodes.push(new Node(500, 224, ''));
            nodes.push(new Node(250, 400, ''));
            nodes.push(new Node(700, 50, ''));
            nodes.push(new Node(700, 354, ''));
            nodes.push(new Node(200, 35, ''));
            nodes.push(new Node(900, 224, 'E'));

            //link nodes
            this.linkNode(nodes[0], nodes[1]);
            this.linkNode(nodes[0], nodes[2]);
            this.linkNode(nodes[1], nodes[6]);
            this.linkNode(nodes[2], nodes[4]);
            this.linkNode(nodes[3], nodes[5]);
            this.linkNode(nodes[3], nodes[6]);
            this.linkNode(nodes[1], nodes[5]);
            this.linkNode(nodes[1], nodes[4]);
        }

    }

    parse(world) {
        var data = JSON.parse(world);
        for (var i = 0; i < data.nodes.length; ++i) {
            var n = data.nodes[i];
            var label = null;
            if (i === 0) {
                label = 'S';
            }
            if (i === data.nodes.length - 1) {
                label = 'E';
            }

            this.nodes.push(new Node(n.x, n.y, label));
        }
        for (var link of data.links) {
            if (this.nodes[link.a] && this.nodes[link.b]) {
                this.linkNode(this.nodes[link.a], this.nodes[link.b]);
            }
        }
    }

    removeNode(node) {
        //Disconnect
        var isNotNode = (o => o !== node);
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

    getBestSolution() {
        var p = 1;
        var node = this.nodes[0];
        var path = [node.id];
        var previousLink = null;
        var increment = 0;
        while (node.text !== 'E') {
            var links = Object.values(node.linkTo);

            if (links.length === 0) {
                console.log("No solution found");
                return;
            } else if (links.length > 1) {
                links = links.filter(l => l !== previousLink);
            }

            var weights = [];
            var sum = 0;
            var bestLink;
            var maxPheromones = 0;
            for (var link of links) {
                var w = 1 + link.getTotalPheromones();
                sum += w;
                if (w > maxPheromones) {
                    bestLink = link;
                    maxPheromones = w;
                }
            }
            p *= maxPheromones / sum;
            previousLink = bestLink;
            node = bestLink.getOther(node);
            path.push(node.id);
            increment++;
            if (increment > 2000) {
                // spammy
                // console.log("No solution found");
                path = [];
                p = 0;
                break;
            }
        }
        p *= 100;
        var results = { p, path, SPAWN_FREQUENCE, PHEROMONE_STRENGTH, PHEROMONE_DECAY_RATE };
        return results;
    }

    toString() {
        var nodes = this.nodes.filter(n => n !== end).map(n => ({ x: n.x, y: n.y }));
        nodes.push({ x: end.x, y: end.y });
        return JSON.stringify({
            nodes: nodes,
            links: this.links.map(l => ({ a: this.nodes.indexOf(l.nodeA), b: this.nodes.indexOf(l.nodeB) })).filter(v => v.a != -1 && v.b != -1)
        });
    }
}
