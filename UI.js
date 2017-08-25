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
        node = new Node(nodes.length, p.x, p.y, nodes.length.toString());
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
};