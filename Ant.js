const ANT_RADIUS = 5;
const ANT_COLOR = 0xFF0000;
const ANT_SPEED = 4;

function getAntGraphics(r) {
    var g = new PIXI.Graphics();
    g.beginFill(0xFFFFFF);
    g.drawCircle(r, r, r);
    g.endFill();

    var sprite = new PIXI.Sprite(app.renderer.generateTexture(g));

    antLayer.addChild(sprite);

    sprite.tint = ANT_COLOR;
    sprite.anchor.set(0.5);
    return sprite;
}

class Ant {
    constructor(start) {
        this.start = start;
        this.radius = ANT_RADIUS;
        this.graphics = getAntGraphics(this.radius);
        this.x = start.graphics.x;
        this.y = start.graphics.y;

        this.target = start;
        this.targetLink = null;
        this.path = [];
        this.wayBack = false;
    }

    set x(v) { this.graphics.x = v; }
    get x() { return this.graphics.x; }
    set y(v) { this.graphics.y = v; }
    get y() { return this.graphics.y; }

    isAtTarget() {
        return this.x == this.target.graphics.x && this.y == this.target.graphics.y;
    }

    move() {
        if (!this.target) {
            throw "Exception: /!\\ not supposed to happen (design flaw?)";
        }

        if (Vector.squareDist(this, this.target) <= ANT_SPEED) {
            this.x = this.target.x;
            this.y = this.target.y;
        } else {
            var vx = this.target.x - this.x;
            var vy = this.target.y - this.y;

            var speed = new Vector(vx, vy).normalize().multiplyScalar(ANT_SPEED);
            this.x += speed.x;
            this.y += speed.y;
        }
    }

    getPreviousLink() {
        return this.path[this.path.length - 1];
    }

    updatePath() {
        if (this.targetLink) {
            this.path.push(this.targetLink);
        }
    }

    selectNextTarget() {
        var neighbors = this.target.neighbors;

        if (neighbors.length > 1) {
            neighbors = neighbors.filter(n => this.target.linkTo[n.id] !== this.getPreviousLink());
        }

        var n = Math.floor(Math.random() * neighbors.length);
        var next = neighbors[n];
        this.targetLink = this.target.linkTo[next.id];
        this.target = next;

    }

    selectReturnTarget() {
        var best = null;
        var minIndex = -1;
        
        for (var nodeId in this.target.linkTo) {
            var link = this.target.linkTo[nodeId];
            var idx = this.path.indexOf(link);
            if (idx > -1 && (best === null || idx < minIndex)) {
                minIndex = idx;
                best = link;
            }
        }
        if (best !== null) {
            this.target = best.getOther(this.target);
            this.path.splice(minIndex);
        } else {
            //This ant lost the way home!
        }

    }

}
