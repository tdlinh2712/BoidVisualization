import Rectangle from './Rectangle.ts';
import Circle from './Circle.ts';
import p5 from 'p5';
import Boid from './Boid.ts';

class QuadTree {
    boundary: Rectangle;
    capacity: number;
    points: Boid[];
    subTrees: QuadTree[] = [];
    constructor(boundary: Rectangle, capacity: number) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
    }
    clear() {
        this.points = [];
        this.subTrees = [];
    }
    insert(boid: Boid) {
        const point = boid.position;
        if (!this.boundary.contains(point)) {
            return false;
        }
        if (this.points.length < this.capacity) {
            this.points.push(boid);
            return true;
        }
        if (!this.divided()) {
            this.subdivide();
        }
        for (const subTree of this.subTrees) {
            if (subTree.insert(boid)) {
                return true;
            }
        }
        return false;
    }
    subdivide() {
        console.assert(this.subTrees.length === 0);
        // top left
        const { boundary } = this;
        for (let i = -1; i <= 1; i += 2) {
            for (let j = -1; j <= 1; j += 2) {
                const subBoundary = new Rectangle(boundary.x + boundary.w / 4 * i, boundary.y + boundary.h / 4 * j, boundary.w / 2, boundary.h / 2);
                this.subTrees.push(new QuadTree(subBoundary, this.capacity));
            }
        }
        console.assert(this.subTrees.length === 4);
    }
    divided() {
        return this.subTrees.length !== 0;
    }

    query(range : Rectangle | Circle) : Boid[] {
        let found : Boid[] = [];
        if (!this.boundary.intersects(range)) {
            return found;
        } else {
            for (const point of this.points) {
                if (range.contains(point.position))
                {
                    found.push(point);
                }
            }
            for (const subTree of this.subTrees) {
                found = found.concat(subTree.query(range));
            }
        }
        return found;
    }

    display(p: p5) {
        p.stroke(150, 200, 255, 150); // Changed to a light blue with lower opacity for an accent
        p.strokeWeight(1);
        p.noFill();
        const { boundary, subTrees } = this;
        p.rectMode(p.CENTER);
        p.rect(boundary.x, boundary.y, boundary.w, boundary.h);
        for (const subTree of subTrees) {
            subTree.display(p);
        }
    }

}

export default QuadTree;