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
app.stage.addChild(linkLayer);
app.stage.addChild(nodeLayer);
app.stage.addChild(antLayer);

//TODO: should be in Ant class
function defineTarget(ant) {
    var n = Math.floor(Math.random() * ant.target.neighbors.length);
    var target = ant.target.neighbors[n];

    ant.target = target;
    ant.path.push(target);
}

var ants = [];

app.stage.hitArea = new PIXI.Rectangle(0, 0, app.screen.width, app.screen.height);
app.stage.interactive = true;
app.stage.mousedown = function (e) {
    var p = e.data.getLocalPosition(this);
    var n = new Node(nodes.length, p.x, p.y, '');
    nodes.push(n);
};

var graph = new World();
var nodes = graph.nodes;
var start = nodes[0];
var end = nodes[nodes.length - 1];
var d = new Date();
var timer = d.getTime();

ants.push(new Ant(start));
window.setInterval(function createAnt() {
    var a = new Ant(start);
    ants.push(a);
}, 2000);

function updateEnvironment() {
    ants.forEach(function (ant) {
        ant.move();
        if (ant.isAtTarget()) {
            // Define direction
            if (ant.wayBack && !ant.path.length) {
                ant.wayBack = false;
            } else if (!ant.wayBack && ant.target.id == end.id) {
                ant.wayBack = true;
            }

            // Define new target
            if (ant.wayBack) {
                ant.target = ant.path.pop();
            } else {
                defineTarget(ant);
            }
        }
    });
}

function animate() {
    updateEnvironment();
    app.render();
    requestAnimationFrame(animate);
}

document.getElementById("canvasZone").appendChild(app.view);