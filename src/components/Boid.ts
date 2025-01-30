import p5 from 'p5';
import { BehaviourParams, Color, FlockingWeights } from './types.ts'


class Boid {
    position: p5.Vector;
    velocity: p5.Vector;
    acceleration: p5.Vector;
    p: p5;
    color: Color;
    flock_id: number;
    is_predator: bool
    constructor(p: p5, x: number, y: number, flock_id: number, color: Color, is_predator: boolean = false) {
        this.p = p;
        this.position = p.createVector(x, y);
        this.velocity = p5.Vector.random2D().setMag(p.random(0.5, 2));
        this.acceleration = p.createVector();
        this.color = color;
        this.flock_id = flock_id;
        this.is_predator = is_predator;
    }
    checkbound() {
        if (this.position.x < 0) {
            this.position.x = this.p.width;
        }
        else if (this.position.x > this.p.width) {
            this.position.x = 0;
        }
        if (this.position.y < 0) {
            this.position.y = this.p.height;
        }
        else if (this.position.y > this.p.height) {
            this.position.y = 0;
        }
    }

    alignment(neighbors: Boid[], behaviourParams: BehaviourParams): p5.Vector {
        const avg = this.p.createVector();
        let count = 0;
        for (const boid of neighbors) {
            // only apply alignment to same flock
            if (!this.shouldAddAlignment(boid)) {
                continue;
            }
            count++;
            avg.add(boid.velocity);
        }
        if (count > 0) {
            avg.div(count);
            avg.setMag(behaviourParams.maxSpeed);
            avg.sub(this.velocity);
            avg.limit(behaviourParams.maxForce);
        }
        return avg;

    }

    cohesion(neighbors: Boid[], behaviourParams: BehaviourParams) {
        const avg = this.p.createVector();
        let count = 0;
        for (const boid of neighbors) {
            // only apply cohesion to same flock
            if (!this.shouldAddCohesion(boid)) {
                continue;
            }
            count++;
            avg.add(boid.position);
            // const distance = p5.Vector.dist(this.position, boid.position);
            // if (distance > 0 && distance <= behaviourParams.maxDistance) {
            //     avg.add(boid.position);
            //     count++;
            // }
        }
        if (count > 0) {
            // get avg location
            avg.div(count);
            // make the direction vector by subtracing my location
            avg.sub(this.position);
            avg.setMag(behaviourParams.maxSpeed);
            avg.sub(this.velocity);
            avg.limit(behaviourParams.maxForce);
        }
        return avg;
    }

    separation(neighbors: Boid[], behaviourParams: BehaviourParams) {
        const avg = this.p.createVector();
        let count = 0;
        for (const boid of neighbors) {
            if (!this.shouldAddSeparation(boid)) {
                continue;
            }
            const distance = p5.Vector.dist(this.position, boid.position);
            if (distance === 0) {
                continue;
            }
            // make a ve\ctor that's pointing to the other direction and divid by distance 
            // so that bigger distance -> smaller vector
            const diff = p5.Vector.sub(this.position, boid.position);
            diff.div(distance);
            avg.add(diff);
            count++;
        }
        if (count > 0) {
            // get avg location
            avg.div(count);
            avg.setMag(behaviourParams.maxSpeed);
            avg.sub(this.velocity);
            avg.limit(behaviourParams.maxForce);
        }
        return avg;
    }

    separationFromPredator(neighbors: Boid[], behaviourParams: BehaviourParams) {
        const avg = this.p.createVector();
        let count = 0;
        for (const boid of neighbors) {
            if (!boid.is_predator) {
                continue;
            }
            const distance = p5.Vector.dist(this.position, boid.position);
            if (distance === 0) {
                continue;
            }
            // make a ve\ctor that's pointing to the other direction and divid by distance 
            // so that bigger distance -> smaller vector
            const diff = p5.Vector.sub(this.position, boid.position);
            diff.div(distance);
            avg.add(diff);
            count++;
        }
        if (count > 0) {
            // get avg location
            avg.div(count);
            avg.setMag(behaviourParams.maxSpeed * behaviourParams.maxSpeedFromPredatorMult);
            avg.sub(this.velocity);
            avg.limit(behaviourParams.maxForce);
        }
        return avg;
    }

    avoid_edges(behaviourParams: BehaviourParams) {
        const avg = this.p.createVector();
        const position: p5.Vector = this.position;
        const margin = behaviourParams.maxEdgeDistance;

        if (position.x <= margin) {
            avg.add(this.p.createVector(margin - position.x, 0)); // Push right
        }
        if (position.y <= margin) {
            avg.add(this.p.createVector(0, margin - position.y)); // Push down
        }
        if ((this.p.width - position.x) <= margin) {
            avg.add(this.p.createVector(-(position.x - (this.p.width - margin)), 0)); // Push left
        }
        if ((this.p.height - position.y) <= margin) {
            avg.add(this.p.createVector(0, -(position.y - (this.p.height - margin)))); // Push up
        }

        if (avg.mag() > 0) {
            avg.setMag(behaviourParams.maxSpeed);
            avg.sub(this.velocity);
            avg.limit(behaviourParams.maxForce * 0.75);
        }
        return avg;
    }

    flock(neighbors: Boid[], weight: FlockingWeights, behaviourParams: BehaviourParams) {
        this.acceleration = this.acceleration.mult(0);
        if (weight.alignment > 0) {
            const alignment = this.alignment(neighbors, behaviourParams).mult(weight.alignment);
            this.acceleration.add(alignment);
        }
        if (weight.cohesion > 0) {
            const cohesion = this.cohesion(neighbors, behaviourParams).mult(weight.cohesion);
            this.acceleration.add(cohesion);
        }
        if (weight.separation > 0) {
            const separation = this.separation(neighbors, behaviourParams).mult(weight.separation);
            if (!this.is_predator) {
                const separationFromPredator = this.separationFromPredator(neighbors, behaviourParams).mult(weight.separation);
                this.acceleration.add(separationFromPredator);
            }
            this.acceleration.add(separation);
        }
        const avg_weight = (weight.alignment + weight.cohesion + weight.separation)/3;
        const edge_avoidance = this.avoid_edges(behaviourParams).mult(avg_weight);
        this.acceleration.add(edge_avoidance).mult();
    }

    static filterBoidsWithinPerception(mainBoid: Boid, neighbors: Boid[], behaviourParams: BehaviourParams) {
        for (let i = neighbors.length - 1; i >= 0; i--) {
            const boid = neighbors[i];
            // only apply alignment to same flock
            const distance = p5.Vector.dist(mainBoid.position, boid.position);
            const angleToBoid = p5.Vector.sub(boid.position, mainBoid.position).heading();
            const angleDifference = p5.Vector.angleBetween(mainBoid.velocity, p5.Vector.fromAngle(angleToBoid));

            // Check if the boid is within the perception distance and angle
            if (distance <= 0 ||
                distance > behaviourParams.maxDistance ||
                angleDifference > behaviourParams.perceptionAngle / 2 ||
                angleDifference > Math.PI / 2) { // Filter out boids behind
                neighbors.splice(i, 1);
            }
        }
    }

    update(behaviourParams: BehaviourParams) {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(behaviourParams.maxSpeed);
    }

    shouldAddAlignment(other: Boid) {

        if (this.is_predator) {
            // predator always align with other predator flocks but not its own flock
            return !other.is_predator;
        } else {
            return this.isSameFlock(other.flock_id);
        }
    }

    shouldAddCohesion(other: Boid) {

        if (this.is_predator) {
            // predator always cohesion with other predator flocks but not its own flock
            return !other.is_predator;
        } else {
            return this.isSameFlock(other.flock_id);
        }
    }

    shouldAddSeparation(other: Boid) {

        if (this.isSameFlock(other.flock_id)) {
            return true; // always have some space with other birds in the same flock
        }
        if (this.is_predator) {
            return other.is_predator; // separate from other predator flocks
        } else {
            return true; // prey always separate
        }
    }


    isSameFlock(flock_id: number) {
        return this.flock_id === flock_id;
    }
}

export default Boid;