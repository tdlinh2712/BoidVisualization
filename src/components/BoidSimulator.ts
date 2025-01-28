import p5 from 'p5';
import Boid from './Boid';
import { BehaviourParams, Color, FlockingWeights } from './types';
import QuadTree from './QuadTree';
import Rectangle from './Rectangle';
import Circle from './Circle';

export class BoidSimulator {
    private boids: Boid[];
    private quadTree: QuadTree;
    private shouldShowQuadTree: boolean = false;
    private shouldShowRadius: boolean = false;
    private lastClicked: number = 0;

    constructor(p: p5, boundary: Rectangle) {
        this.boids = [];
        this.quadTree = new QuadTree(boundary, 4);
    }

    public addBoid(boid: Boid) {
        this.boids.push(boid);
    }

    public getBoids(): Boid[] {
        return this.boids;
    }

    public setShowQuadTree(show: boolean) {
        this.shouldShowQuadTree = show;
    }

    public setShowRadius(show: boolean) {
        this.shouldShowRadius = show;
    }

    private checkFlock(curBoid: Boid, other: Boid): boolean {
        return curBoid.isSameFlock(other);
    }

    public simulate(p: p5, displayBoidFunc: (position: p5.Vector, velocity: p5.Vector, color: Color) => void, 
                   weight: FlockingWeights, behaviourParams: BehaviourParams) {
        // Reset quadtree
        this.quadTree.clear();
        
        // Insert all boids into quadtree
        for (const boid of this.boids) {
            this.quadTree.insert(boid);
        }

        // Update boid behaviors
        for (const boid of this.boids) {
            const range = new Circle(boid.position.x, boid.position.y, behaviourParams.maxDistance);
            const neighbors = this.quadTree.query(range, (other) => this.checkFlock(boid, other));
            boid.flock(neighbors, weight, behaviourParams);
        }

        // Update positions and display
        for (const boid of this.boids) {
            boid.update(behaviourParams);
            boid.checkbound();
            displayBoidFunc(boid.position, boid.velocity, boid.color);
        }

        // Show perception radius if enabled
        if (this.shouldShowRadius && this.boids.length > 0) {
            this.displayPerceptionRadius(p, displayBoidFunc, behaviourParams);
        }

        // Show quadtree if enabled
        if (this.shouldShowQuadTree) {
            this.quadTree.display(p);
        }
    }

    private displayPerceptionRadius(p: p5, displayBoidFunc: (position: p5.Vector, velocity: p5.Vector, color: Color) => void, 
                                  behaviourParams: BehaviourParams) {
        const displayedBoid = this.boids[0];
        const range = new Circle(displayedBoid.position.x, displayedBoid.position.y, behaviourParams.maxDistance);
        const neighbors = this.quadTree.query(range);
        
        p.strokeWeight(3);
        p.noFill();
        p.stroke(displayedBoid.color.r, displayedBoid.color.g, displayedBoid.color.b);
        p.circle(displayedBoid.position.x, displayedBoid.position.y, behaviourParams.maxDistance * 2);
        
        for (const neighbor of neighbors) {
            if (neighbor === displayedBoid || !neighbor.isSameFlock(displayedBoid)) {
                continue;
            }
            displayBoidFunc(neighbor.position, neighbor.velocity, { r: 255, g: 0, b: 0 });
        }
    }
} 