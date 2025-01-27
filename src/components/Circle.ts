import p5 from 'p5';
import { Point } from './types';

class Circle {
    /* x, y are the center points of the rectangle for simplicity */
    x: number;
    y: number;
    radius: number;

    constructor(x: number, y: number, r: number) {
        this.x = x;
        this.y = y;
        this.radius = r;
    }

    contains(point: Point | p5.Vector) {
        const distance = Math.sqrt( Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2))
        return distance <= this.radius;
    }
    // intersects(range: Rectangle) {
    //     return !(this.leftX > range.rightX || 
    //              this.rightX < range.leftX || 
    //              this.topY > range.bottomY || 
    //              this.bottomY < range.topY);
    // }
}

export default Circle;