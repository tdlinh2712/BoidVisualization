import p5 from 'p5';
import Circle from './Circle.ts';
import { Point } from './types.ts';

class Rectangle {
    /* x, y are the center points of the rectangle for simplicity */
    x: number;
    y: number;
    w: number;
    h: number;
    halfW: number;
    halfH : number;
    leftX : number;
    rightX : number;
    topY : number;
    bottomY : number;
    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.halfW = w / 2;
        this.halfH = h / 2;
        this.leftX = x - this.halfW;
        this.rightX = x + this.halfW;
        this.topY = y - this.halfH;
        this.bottomY = y + this.halfH;
    }
    contains(points : Point | p5.Vector) {
        return (points.x >= this.x - this.halfW) && (points.y >= this.y - this.halfH) 
        && (points.x <= this.x + this.halfW ) && (points.y <= this.y + this.halfH);
    }
    intersects(range: Rectangle | Circle): boolean {
        if (range instanceof Rectangle) {
            return !(this.leftX > range.rightX || 
                    this.rightX < range.leftX || 
                    this.topY > range.bottomY || 
                    this.bottomY < range.topY);
        } else {
            const circle = range as Circle;
            const closestX = Math.max(this.leftX, Math.min(circle.x, this.rightX));
            const closestY = Math.max(this.topY, Math.min(circle.y, this.bottomY));
            const distanceX = circle.x - closestX;
            const distanceY = circle.y - closestY;
            return (distanceX * distanceX + distanceY * distanceY) <= (circle.radius * circle.radius);
        }
    }
}

export default Rectangle;