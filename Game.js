var SPAWN_FREQUENCE = 2000;

var app = new PIXI.Application({
    width: 974,
    height: 548,
    transparent: false,
    resolution: 2,
    backgroundColor: 0x2233FF
});

var gameLayer = new PIXI.Container();
var chromoseStatsLayer = new PIXI.Container();
var generationStatsLayer = new PIXI.Container();
var hudLayer = new PIXI.Container();

app.stage.addChild(gameLayer);
app.stage.addChild(hudLayer);
app.stage.addChild(chromoseStatsLayer);
app.stage.addChild(generationStatsLayer);

var nodeLayer = new PIXI.Container();
var antLayer = new PIXI.Container();
var linkLayer = new PIXI.Container();
var statsLayer = new PIXI.Container();
var bestOfPreviousGenerationLayer = new PIXI.Container();

gameLayer.addChild(linkLayer);
gameLayer.addChild(nodeLayer);
gameLayer.addChild(antLayer);
chromoseStatsLayer.addChild(statsLayer);
generationStatsLayer.addChild(bestOfPreviousGenerationLayer);

var discTexture;
function initTextures() {
    var g = new PIXI.Graphics();
    g.beginFill(0xFFFFFF);
    g.drawCircle(0, 0, 20);
    g.endFill();
    discTexture = g.generateCanvasTexture();
}
initTextures();

var ants = [];

var graph = new World();
var nodes = graph.nodes;
var start = nodes[0];
var end = nodes[nodes.length - 1];

for (var i = 0; i < 20; ++i) {
    ants.push(new Ant(start));
}

setInterval(() => { for (var i = 0; i < 50; ++i) { updateEnvironment(); } }, 0);

var spawningAntInterval = window.setInterval(function createAnt() {
    if (ants.length < 5000) {
        var a = new Ant(start);
        ants.push(a);
    }
}, SPAWN_FREQUENCE);

var showStatsInterval = window.setInterval(function statsUpdate() {
    showStats();
}, 1000);

function updateEnvironment() {
    ants.forEach(function (ant) {
        if (ant.dead)
            return;
        ant.move();
        if (ant.isAtTarget()) {
            // Define direction
            if (ant.wayBack) {
                ant.placePheromone();
                // if (!ant.path.length) {
                if (ant.target === start) {
                    ant.wayBack = false;
                    ant.graphics.tint = ANT_COLOR;
                    ant.path = [];
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
    app.render();
    requestAnimationFrame(animate);
}

function reset(spawnFrequence, pheromoneStrength, pheromoneDecayRate) {
    nodeLayer = new PIXI.Container();
    antLayer = new PIXI.Container();
    linkLayer = new PIXI.Container();
    
    gameLayer.children.forEach(c=>c.destroy(true));
    initTextures();    
    gameLayer.removeChildren();
    gameLayer.addChild(linkLayer);
    gameLayer.addChild(nodeLayer);
    gameLayer.addChild(antLayer);
    
    ants = [];
    nextNodeId = 0;
    graph = new World();
    nodes = graph.nodes;
    start = nodes[0];
    end = nodes[nodes.length - 1];
    
    for (var i = 0; i < 20; ++i) {
        ants.push(new Ant(start));
    }
    SPAWN_FREQUENCE = spawnFrequence;
    PHEROMONE_STRENGTH = pheromoneStrength;
    PHEROMONE_DECAY_RATE = pheromoneDecayRate;
    clearInterval(spawningAntInterval);
    spawningAntInterval = window.setInterval(function createAnt() {
        if (ants.length < 5000) {
            var a = new Ant(start);
            ants.push(a);
        }
    }, SPAWN_FREQUENCE);

}

document.getElementById("canvasZone").appendChild(app.view);