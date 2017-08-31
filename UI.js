app.view.addEventListener('contextmenu', (e) => { e.preventDefault(); });

var draggingFrom = null;
var drag = new PIXI.Graphics();
hudLayer.addChild(drag);

app.stage.hitArea = new PIXI.Rectangle(0, 0, app.screen.width, app.screen.height);
app.stage.interactive = true;

app.stage.rightdown = function (e) {
    var p = e.data.getLocalPosition(this);
    var node = draggingFrom;
    if (!node) {
        for (var n of graph.nodes) {
            if (Vector.squareDist(n, p) <= NODE_RADIUS * NODE_RADIUS) {
                node = n;
            }
        }
    }
    if (node) {
        graph.removeNode(node);
        draggingFrom = null;
    }
    save();
};

app.stage.mousedown = function (e) {
    var p = e.data.getLocalPosition(this);
    var node;
    for (var n of graph.nodes) {
        if (Vector.squareDist(n, p) <= NODE_RADIUS * NODE_RADIUS) {
            node = n;
        }
    }
    if (!node) {
        node = new Node(p.x, p.y, nodes.length.toString());
        graph.nodes.push(node);
    }
    draggingFrom = node;
};

app.stage.mousemove = function (e) {
    if (draggingFrom) {
        var p = e.data.getLocalPosition(this);
        drag.clear();
        drag.lineStyle(LINK_WIDTH, 0xFA00FF, 1);
        drag.moveTo(draggingFrom.x, draggingFrom.y);
        drag.lineTo(p.x, p.y);
    }
};

app.stage.mouseup = app.stage.mouseupoutside = function (e) {
    if (draggingFrom) {
        var p = e.data.getLocalPosition(this);
        var node;
        for (var n of graph.nodes) {
            if (Vector.squareDist(n, p) <= NODE_RADIUS * NODE_RADIUS) {
                node = n;
            }
        }

        if (node) {
            graph.linkNode(draggingFrom, node);
        }

        draggingFrom = null;
        drag.clear();
    }
    save();
};

function save() {
    localStorage.world = graph.toString();
}

function showStats() {
    var c = new PIXI.Container();
    var stats = graph.getBestSolution();
    var pheromoneStrengthLabel = new PIXI.Text('Pheromone strength: ' + stats.PHEROMONE_STRENGTH, { fontFamily: 'Arial', fontSize: 14, fill: 0xFFFFFF, align: 'center' });
    pheromoneStrengthLabel.x = 650;
    pheromoneStrengthLabel.y = 380;
    var pheromoneDecayRateLabel = new PIXI.Text('Pheromone decay rate: ' + stats.PHEROMONE_DECAY_RATE, { fontFamily: 'Arial', fontSize: 14, fill: 0xFFFFFF, align: 'center' });
    pheromoneDecayRateLabel.x = 650;
    pheromoneDecayRateLabel.y = 400;
    var spawnFrequenceLabel = new PIXI.Text('Spawn frequence: ' + stats.SPAWN_FREQUENCE, { fontFamily: 'Arial', fontSize: 14, fill: 0xFFFFFF, align: 'center' });
    spawnFrequenceLabel.x = 650;
    spawnFrequenceLabel.y = 420;
    var probabilityLabel = new PIXI.Text('Probability: ' + stats.p, { fontFamily: 'Arial', fontSize: 14, fill: 0xFFFFFF, align: 'center' });
    probabilityLabel.x = 650;
    probabilityLabel.y = 440;
    var pathLabel = new PIXI.Text('Best path: ' + stats.path, { fontFamily: 'Arial', fontSize: 14, fill: 0xFFFFFF, align: 'center' });
    pathLabel.x = 650;
    pathLabel.y = 460;
    c.addChild(pheromoneStrengthLabel);
    c.addChild(pheromoneDecayRateLabel);
    c.addChild(spawnFrequenceLabel);
    c.addChild(probabilityLabel);
    c.addChild(pathLabel);
    statsLayer.removeChildren();
    statsLayer.addChild(c);
    return c;
}