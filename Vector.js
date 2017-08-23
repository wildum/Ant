class Vector {
    static squareDist(a, b) {
        return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
    }

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    divideScalar(scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
        } else {
            this.x = 0;
            this.y = 0;
        }
    }

    length() {
       return Math.sqrt(this.lengthSq());
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y;
    }

    normalize() {
        var length = this.length();

        if (length === 0) {
            this.x = 1;
            this.y = 0;
        } else {
            this.divideScalar(length);
        }
        return this;
    }

    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
}