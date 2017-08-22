const ANT_RADIUS = 5;
const ANT_COLOR = 0xFF0000;

function getAntGraphics(r) {
    var g = new PIXI.Graphics();
    g.beginFill(ANT_COLOR);
    g.drawCircle(0, 0, r);
    g.endFill();
    antLayer.addChild(g);
    return g;
}

class Ant {
    constructor(start) {
        this.start = start;
        this.radius = ANT_RADIUS;
        this.graphics = getAntGraphics(this.radius);
        this.x = start.graphics.x;
        this.y = start.graphics.y;

        //TODO: refactor these into a "State" object
        this.target = start;
        this.path = [start];
        this.wayBack = false;
    }

    set x(v) { this.graphics.x = v; }
    get x() { return this.graphics.x; }
    set y(v) { this.graphics.y = v; }
    get y() { return this.graphics.y; }

    update() {
        if (Vector.squareDist(this, this.target.graphics) <= 1) {
            this.x = this.target.graphics.x;
            this.y = this.target.graphics.y;
            //TODO: Refactor this. "update" methods should not return information
            return true;
        }

        var vx = this.target.graphics.x - this.x;
        var vy = this.target.graphics.y - this.y;

        var speed = new Vector(vx, vy).normalize();
        this.x += speed.x;
        this.y += speed.y;
        return false;
    }
}