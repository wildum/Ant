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
            throw new Exception("/!\\ not supposed to happen (design flaw?)");
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

    getPreviousNode() {
        return this.path[this.path.length - 1];
    }

    selectNextTarget() {
        var next = this.target.neighbors;

        if (next.length > 1) {
            next = next.filter(n => n !== this.getPreviousNode());
        }

        var n = Math.floor(Math.random() * next.length);
        var target = next[n];
        this.path.push(this.target);
        this.target = target;
        
    }

    selectReturnTarget() {
        this.target = this.path.pop();
    }

}
