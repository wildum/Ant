var ANT_RADIUS = 5;
var ANT_COLOR = 0xFF0000;
var ANT_SPEED = 4;

var PHEROMONE_STRENGTH = 1;
var PHEROMONE_DECAY_RATE = 2e-4;

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

    weightedChoice(cumulative) {
        var x = Math.random();
        for (var i = 0; i < cumulative.length; ++i) {
            if (x < cumulative[i]) {
                return i;
            }
        }
    }

    selectNextTarget() {
        var links = Object.values(this.target.linkTo);

        if (links.length === 0) {
            return;
        } else if (links.length > 1) {
            links = links.filter(l => l !== this.getPreviousLink());
        }

        var weights = [];
        var sum = 0;
        for (var link of links) {
            var w = 1 + link.getTotalPheromones();
            weights.push(w);
            sum += w;
        }
        weights = weights.map(w => w / sum);
        var cumulative = weights.reduce((sum, v) => sum.concat(v + (sum[sum.length - 1] || 0)), []);
        var idx = this.weightedChoice(cumulative);
        this.targetLink = links[idx];
        this.target = this.targetLink.getOther(this.target);
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
            this.targetLink = best;
            this.path.splice(minIndex);
        } else {
            //This ant lost the way home!
            this.dead = true;
            this.graphics.tint = 0x0;
        }

    }

    placePheromone() {
        this.targetLink.placePheromone(PHEROMONE_STRENGTH);
    }

}
