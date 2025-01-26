import p5 from 'p5';
import Boid from './components/Boid.ts'
import { FlockingWeights } from './components/types.ts'

let weight : FlockingWeights;

const sketch = (p: p5) => {
  const boids: Boid[] = [];
  // let iteration= 0;
  const population : number = 100; // initial start 

  p.setup = () => {
    p.createCanvas(1500, 1000);
    p.fullscreen(true);
    // p.strokeWeight(5);
    for (let i = 0; i < population; i++)
    {
      boids.push(new Boid(p, p.random(p.width - 200), p.random(p.height - 200)));
    }
    weight = {
      alignment : 1, cohesion : 1, separation : 1
    } 
  };
  p.draw = () => {
    p.background(20);
    // if (iteration % 10 == 0)
    // {
    //   boids.push(new Boid(p, p.random(p.width), p.random(p.height)));
    // }
    // const alignment = Number((document.getElementById('alignment') as HTMLInputElement)?.value || 0);
    // const cohesion = Number((document.getElementById('cohesion') as HTMLInputElement)?.value || 0);
    // const separation = Number((document.getElementById('separation') as HTMLInputElement)?.value || 0);
    
    // console.log(weight)
    for (const boid of boids)
    {
      boid.checkbound();
      boid.flock(boids, weight);

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
document.getElementById("alignment")?.addEventListener("input", (e) => {
  
  weight.alignment = parseFloat((e.target as HTMLInputElement).value);
  console.log(weight)
})
document.getElementById("cohesion")?.addEventListener("input", (e) => {
  weight.cohesion = parseFloat((e.target as HTMLInputElement).value);
})
document.getElementById("separation")?.addEventListener("input", (e) => {
  weight.separation = parseFloat((e.target as HTMLInputElement).value);
})



new p5(sketch);
