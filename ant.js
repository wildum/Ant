var app = new PIXI.Application({
    width: 974,
    height: 548,
    transparent: false,
    resolution: 2,
    backgroundColor: 0x2233FF
});

var nodeLayer = new PIXI.Container();
var antLayer = new PIXI.Container();
var linkLayer = new PIXI.Container();

app.stage.removeChildren();
app.stage.addChild(nodeLayer);
app.stage.addChild(antLayer);
app.stage.addChild(linkLayer);

function getNodeGraphics(r, text) {
    var c = new PIXI.Container();
    var g = new PIXI.Graphics();
    g.beginFill(0x000000);
    g.drawCircle(0, 0, r);
    g.endFill();
    c.addChild(g);
    if(text != '') {
        var label = new PIXI.Text(text, { fontFamily: 'Arial', fontSize: 12, fill: 0xFFFFFF, align: 'center' });
        label.anchor.x = label.anchor.y = 0.5;
        c.addChild(label);
    }
    nodeLayer.addChild(c);
    return c; 
}

function getAntGraphics(r) {
    var g = new PIXI.Graphics();
    g.beginFill(0xFF0000);
    g.drawCircle(0, 0, r);
    g.endFill();
    antLayer.addChild(g);
    return g;
}

function getLinkGraphics(x1, y1, x2, y2) {
    var g = new PIXI.Graphics();
    g.lineStyle(2,0);
    g.moveTo(x1, y1);
    g.lineTo(x2, y2)
    linkLayer.addChild(g);
    return g;
}

function Node(id, x, y, text) {
    this.id = id;
    this.radius = 15;
    this.graphics = getNodeGraphics(this.radius, text);
    this.graphics.x = x;
    this.graphics.y = y;
    this.neighbors = [];
}

function Ant(start) {
    this.radius = 5;
    this.graphics = getAntGraphics(this.radius);
    this.graphics.x = start.graphics.x;
    this.graphics.y = start.graphics.y;
    this.target = null;
    this.path = [start];
    this.wayBack = false;
    this.update = function() {
        var tx = this.target.graphics.x;
        var ty = this.target.graphics.y;
        if (this.graphics.x > tx - 1 &&
            this.graphics.x < tx + 1 &&
            this.graphics.y > ty - 1 &&
            this.graphics.y < ty + 1) {
            return true;
        }
        var vx = tx - this.graphics.x;
        var vy = ty - this.graphics.y;
        this.graphics.x += vx/(Math.abs(vx) + Math.abs(vy));
        this.graphics.y += vy/(Math.abs(vx) + Math.abs(vy));
        return false;
    };
}

function linkNode(nodeA, nodeB) {
    nodeA.neighbors.push(nodeB);
    nodeB.neighbors.push(nodeA);
    getLinkGraphics(nodeA.graphics.x, nodeA.graphics.y, nodeB.graphics.x, nodeB.graphics.y);
}

function defineTarget(ant) {
    var s = 0;
    do {
        var n = Math.floor(Math.random() * ant.target.neighbors.length);
        var target = ant.target.neighbors[n];
        s++;
    } while(ant.target.id >= target.id && s < 50);
    ant.target = target;
    ant.path.push(target);
}

var nodes = [];
var ants = [];

app.stage.hitArea = new PIXI.Rectangle(0, 0, app.screen.width, app.screen.height);
app.stage.interactive = true;
app.stage.mousedown = function (e) {
    var p = e.data.getLocalPosition(this);
    var n = new Node(nodes.length,p.x, p.y, '');
    nodes.push(n);
};

//add nodes
nodes.push(new Node(0,30,224, 'S'));
nodes.push(new Node(1,100,300, ''));
nodes.push(new Node(2,200,356, ''));
nodes.push(new Node(3,222,169, ''));
nodes.push(new Node(4,398,178, ''));
nodes.push(new Node(5,400,300, ''));
nodes.push(new Node(6,567,178, ''));
nodes.push(new Node(7,700,250, ''));
nodes.push(new Node(8,867,178, ''));
nodes.push(new Node(9,948,224, 'E'));

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

var start = nodes[0];
var end = nodes[nodes.length - 1];
var d = new Date();
var timer = d.getTime();

ants.push(new Ant(start));
ants[0].target = start;
window.setInterval(function createAnt() {
        var a = new Ant(start);
        a.target = start;
        ants.push(a);
    }, 2000);
    
function updateEnvironment() {
    ants.forEach(function(ant) {
        var changeTarget = ant.update();
        if(ant.wayBack && changeTarget) {
            if(ant.path.length > 0) {
                ant.target = ant.path.pop();
            }
            else {
                ant.wayBack = false;
            }
        }
        if(changeTarget && ant.target.id != end.id && !ant.wayBack) {
            defineTarget(ant);
        }
        else if(changeTarget && ant.target.id == end.id) {
            ant.wayBack = true;
        }
    });
}

function animate() {
    updateEnvironment();
    app.render();
    requestAnimationFrame(animate);
}

document.getElementById("canvasZone").appendChild(app.view);