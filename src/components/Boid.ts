import p5 from 'p5';
import { Color, FlockingWeights } from './types.ts'


class Boid {
    position: p5.Vector;
    velocity: p5.Vector;
    acceleration: p5.Vector;
    maxSpeed!: number;
    maxDistance!: number;
    maxEdgeDistance!: number;
    maxForce!: number;
    p: p5;
    color: Color;
    constructor(p: p5, x: number, y: number) {
        this.p = p;
        this.position = p.createVector(x, y);
        // params
        this.set_params();
        this.velocity = p5.Vector.random2D().setMag(p.random(0.5, 2));
        this.acceleration = p.createVector();
        this.color = {
            r: Math.random() * 255,
            g: Math.random() * 255,
            b: Math.random() * 255,
        };
    }
    set_params()
    {
        this.maxSpeed = 4;
        this.maxDistance = 200;
        this.maxEdgeDistance = 20;
        this.maxForce = 1;
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

    alignment(neighbors : Boid[]) : p5.Vector {
        const avg = this.p.createVector();
        let count = 0;
        for (const boid of neighbors)
        {
            const distance = p5.Vector.dist(this.position, boid.position);
            if (distance <= this.maxDistance)
            {
                avg.add(boid.velocity);
                count++;
            }
        }
        if (count > 0)
        {
            avg.div(count);
            avg.setMag(this.maxSpeed);
            avg.sub(this.velocity);
            avg.limit(this.maxForce);
        }
        return avg;

    }

    cohesion(neighbors : Boid[]) {
        const avg = this.p.createVector();
        let count = 0;
        for (const boid of neighbors)
        {
            const distance = p5.Vector.dist(this.position, boid.position);
            if (boid !== this && distance <= this.maxDistance)
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
            avg.setMag(this.maxSpeed);
            avg.sub(this.velocity);
            avg.limit(this.maxForce);
        }
        return avg;
    }

    separation(neighbors : Boid[]) {
        const avg = this.p.createVector();
        let count = 0;
        for (const boid of neighbors)
        {
            const distance = p5.Vector.dist(this.position, boid.position);
            if (distance !== 0 && distance <= this.maxDistance)
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
            avg.setMag(this.maxSpeed);
            avg.sub(this.velocity);
            avg.limit(this.maxForce);
        }
        return avg;
    }

    avoid_edges() {
        const avg = this.p.createVector();
        let count = 0;
        const position : p5.Vector = this.position;
        if (position.x <= this.maxEdgeDistance)
        {
            // separate from (0, y)
            const distance = position.x;
            const diff = p5.Vector.sub(this.position, this.p.createVector(0, position.y));
            diff.mult(this.maxEdgeDistance - distance);
            avg.add(diff);
            count++;
        }
        if (position.y <= this.maxEdgeDistance)
        {
            // separate from (x, 0)
            const distance = position.y;
            const diff = p5.Vector.sub(this.position, this.p.createVector(this.position.x, 0));
            diff.mult(this.maxEdgeDistance - distance);
            avg.add(diff);
            count++;
        }

        if ((this.p.width - position.x) <= this.maxEdgeDistance)
        {
            // separate from (width, y)
            const distance = this.p.width - position.x;
            const diff = p5.Vector.sub(this.position, this.p.createVector(this.p.width, position.y));
            diff.mult(this.maxEdgeDistance - distance);
            avg.add(diff);
            count++;
        }
        if ((this.p.height - position.y) <= this.maxEdgeDistance)
        {
            // separate from (x, height)
            const distance = this.p.height - position.y;
            const diff = p5.Vector.sub(this.position, this.p.createVector(this.position.x, this.p.height));
            diff.mult(this.maxEdgeDistance - distance);
            avg.add(diff);
            count++;
        }
        if (count > 0)
        {
            // get avg location
            avg.div(count); 
            avg.setMag(this.maxSpeed);
            avg.sub(this.velocity);
            avg.limit(this.maxForce);
        }
        return avg;
    }

    flock(neighbors : Boid[], weight: FlockingWeights)
    {
        
        const alignment = weight.alignment ? this.alignment(neighbors).mult(weight.alignment) : this.p.createVector();
        const cohesion =  weight.alignment ? this.cohesion(neighbors).mult(weight.cohesion) : this.p.createVector();
        const separation = weight.separation ? this.separation(neighbors).mult(weight.separation) : this.p.createVector();
        // const edge_avoidance = this.avoid_edges();
        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
        // this.acceleration.add(edge_avoidance);
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.acceleration.mult(0);
    }

    display(color : p5.Color, p: p5) {
        // p.strokeWeight(5);
        // p.stroke(255, 255, 128); // yellow

        // p.point(this.position.x, this.position.y);

        // draw the boid
        
        const angle = this.velocity.heading(); // Get the angle of the boid's velocity

        // Draw the body as an ellipse
        const bodyWidth = 5; // Width of the body
        const bodyHeight = 6; // Height of the body
        console.log(this.color)
        p.stroke(this.color.r, this.color.g, this.color.b); 
        p.strokeWeight(2);
        p.ellipse(this.position.x, this.position.y, bodyWidth, bodyHeight);
        
        // Draw the tail as a line instead of a triangle
        const tailLength = 10; // Length of the tail
        const x1 = this.position.x - tailLength * Math.cos(angle);
        const y1 = this.position.y - tailLength * Math.sin(angle);
        
        // Set the stroke color with fading effect
        p.strokeWeight(5)
        p.stroke(this.color.r, this.color.g, this.color.b, 150); // Set stroke with alpha
        // Draw the tail line
        p.line(this.position.x, this.position.y, x1, y1);
    }
}

export default Boid;