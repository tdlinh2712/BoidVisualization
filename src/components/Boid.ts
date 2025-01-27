import p5 from 'p5';
import { BehaviourParams, Color, FlockingWeights } from './types.ts'


class Boid {
    position: p5.Vector;
    velocity: p5.Vector;
    acceleration: p5.Vector;
    p: p5;
    color: Color;
    constructor(p: p5, x: number, y: number, color? : Color) {
        this.p = p;
        this.position = p.createVector(x, y);
        this.velocity = p5.Vector.random2D().setMag(p.random(0.5, 2));
        this.acceleration = p.createVector();
        this.color = color ? color : {
            r: Math.random() * 255,
            g: Math.random() * 255,
            b: Math.random() * 255,
        };
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

    alignment(neighbors : Boid[], behaviourParams : BehaviourParams) : p5.Vector {
        const avg = this.p.createVector();
        let count = 0;
        for (const boid of neighbors)
        {
            const distance = p5.Vector.dist(this.position, boid.position);
            if (distance <= behaviourParams.maxDistance)
            {
                avg.add(boid.velocity);
                count++;
            }
        }
        if (count > 0)
        {
            avg.div(count);
            avg.setMag(behaviourParams.maxSpeed);
            avg.sub(this.velocity);
            avg.limit(behaviourParams.maxForce);
        }
        return avg;

    }

    cohesion(neighbors : Boid[], behaviourParams : BehaviourParams) {
        const avg = this.p.createVector();
        let count = 0;
        for (const boid of neighbors)
        {
            const distance = p5.Vector.dist(this.position, boid.position);
            if (boid !== this && distance <= behaviourParams.maxDistance)
            {
                avg.add(boid.position);
                count++;
            }
        }
        if (count > 0)
        {
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

    separation(neighbors : Boid[], behaviourParams : BehaviourParams) {
        const avg = this.p.createVector();
        let count = 0;
        for (const boid of neighbors)
        {
            const distance = p5.Vector.dist(this.position, boid.position);
            if (distance !== 0 && distance <= behaviourParams.maxDistance)
            {
                // make a ve\ctor that's pointing to the other direction and divid by distance 
                // so that bigger distance -> smaller vector
                const diff = p5.Vector.sub(this.position, boid.position);
                diff.div(distance);
                avg.add(diff);
                count++;
            }
        }
        if (count > 0)
        {
            // get avg location
            avg.div(count); 
            avg.setMag(behaviourParams.maxSpeed);
            avg.sub(this.velocity);
            avg.limit(behaviourParams.maxForce);
        }
        return avg;
    }

    avoid_edges(behaviourParams : BehaviourParams) {
        const avg = this.p.createVector();
        let count = 0;
        const position : p5.Vector = this.position;
        if (position.x <= behaviourParams.maxEdgeDistance)
        {
            // separate from (0, y)
            const distance = position.x;
            const diff = p5.Vector.sub(this.position, this.p.createVector(0, position.y));
            diff.mult(behaviourParams.maxEdgeDistance - distance);
            avg.add(diff);
            count++;
        }
        if (position.y <= behaviourParams.maxEdgeDistance)
        {
            // separate from (x, 0)
            const distance = position.y;
            const diff = p5.Vector.sub(this.position, this.p.createVector(this.position.x, 0));
            diff.mult(behaviourParams.maxEdgeDistance - distance);
            avg.add(diff);
            count++;
        }

        if ((this.p.width - position.x) <= behaviourParams.maxEdgeDistance)
        {
            // separate from (width, y)
            const distance = this.p.width - position.x;
            const diff = p5.Vector.sub(this.position, this.p.createVector(this.p.width, position.y));
            diff.mult(behaviourParams.maxEdgeDistance - distance);
            avg.add(diff);
            count++;
        }
        if ((this.p.height - position.y) <= behaviourParams.maxEdgeDistance)
        {
            // separate from (x, height)
            const distance = this.p.height - position.y;
            const diff = p5.Vector.sub(this.position, this.p.createVector(this.position.x, this.p.height));
            diff.mult(behaviourParams.maxEdgeDistance - distance);
            avg.add(diff);
            count++;
        }
        if (count > 0)
        {
            // get avg location
            avg.div(count); 
            avg.setMag(behaviourParams.maxSpeed);
            avg.sub(this.velocity);
            avg.limit(behaviourParams.maxForce);
        }
        return avg;
    }

    flock(neighbors : Boid[], weight: FlockingWeights, behaviourParams : BehaviourParams)
    {
        
        const alignment = weight.alignment ? this.alignment(neighbors, behaviourParams).mult(weight.alignment) : this.p.createVector();
        const cohesion =  weight.alignment ? this.cohesion(neighbors, behaviourParams).mult(weight.cohesion) : this.p.createVector();
        const separation = weight.separation ? this.separation(neighbors, behaviourParams).mult(weight.separation) : this.p.createVector();
        // const edge_avoidance = this.avoid_edges();
        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
        // this.acceleration.add(edge_avoidance);
    }

    update(behaviourParams : BehaviourParams) {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(behaviourParams.maxSpeed);
        this.acceleration.mult(0);
    }
}

export default Boid;