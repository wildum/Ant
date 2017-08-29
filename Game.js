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
var hudLayer = new PIXI.Container();


app.stage.removeChildren();
app.stage.addChild(linkLayer);
app.stage.addChild(nodeLayer);
app.stage.addChild(antLayer);
app.stage.addChild(hudLayer);

var ants = [];

var graph = new World();
var nodes = graph.nodes;
var start = nodes[0];
var end = nodes[nodes.length - 1];
var d = new Date();
var timer = d.getTime();

for (var i = 0; i < 20; ++i) {
    ants.push(new Ant(start));
}


var interval = window.setInterval(function createAnt() {
    var a = new Ant(start);
    ants.push(a);
    if (ants.length > 10000) {
        clearInterval(interval);
    }
}, 2000);

function updateEnvironment() {
    ants.forEach(function (ant) {
        if (ant.dead)
            return;
        ant.move();
        if (ant.isAtTarget()) {
            // Define direction
            if (ant.wayBack) {
                ant.placePheromone();
                if (!ant.path.length) {
                    ant.wayBack = false;
                    ant.graphics.tint = ANT_COLOR;
                }
            } else if (!ant.wayBack) {
                ant.updatePath();
                if (ant.target.id == end.id) {
                    ant.wayBack = true;
                    ant.graphics.tint = 0xFFFF00;
                }
            }
            // Define new target
            if (ant.wayBack) {
                ant.selectReturnTarget(ant);
            } else {
                ant.selectNextTarget(ant);
            }
        }
    });
    graph.links.forEach(link => link.decayPheromone());
}

function animate() {
    updateEnvironment();
    app.render();
    requestAnimationFrame(animate);
}

function reset() {
    nodeLayer = new PIXI.Container();
    antLayer = new PIXI.Container();
    linkLayer = new PIXI.Container();
    app.stage.removeChildren();
    app.stage.addChild(linkLayer);
    app.stage.addChild(nodeLayer);
    app.stage.addChild(antLayer);
    app.stage.addChild(hudLayer);
    ants = [];
    nextNodeId = 0;
    graph = new World();
    nodes = graph.nodes;
    start = nodes[0];
    end = nodes[nodes.length - 1];
    d = new Date();
    timer = d.getTime();
    for (var i = 0; i < 20; ++i) {
        ants.push(new Ant(start));
    }
}

document.getElementById("canvasZone").appendChild(app.view);