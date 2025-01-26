import p5 from 'p5';
import Boid from './components/Boid.ts'

const sketch = (p: p5) => {
  const boids: Boid[] = [];
  let iteration= 0;
  p.setup = () => {
    p.createCanvas(1000, 600);
    p.fullscreen(true);
    // p.strokeWeight(5);
      boids.push(new Boid(p, p.random(p.width), p.random(p.height)));
  };
  p.draw = () => {
    iteration++;
    p.background(20);
    if (iteration % 10 == 0)
    {
      boids.push(new Boid(p, p.random(p.width), p.random(p.height)));
    }
    for (const boid of boids)
    {
      boid.checkbound();
      boid.flock(boids);

    }
    for (const boid of boids)
      {
        boid.update();
        boid.display(p);
      }
      p.fill(255); // Set text color to white
      p.textSize(12); // Set text size
      p.text(`Current population:${boids.length}`, 10, 20);
  }
  
}

new p5(sketch);