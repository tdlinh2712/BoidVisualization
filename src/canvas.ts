import p5 from 'p5';
import { FlockingWeights, MODE } from './components/types.ts'
import { WASMFunctions } from './wasmTypes.ts';
import { BoidSimulation } from './components/BoidSimulation.ts';
import Boid from './components/Boid.ts'

const population: number = 1000;
let weight: FlockingWeights;
const boids: Boid[] = [];

const sketch = (p: p5, { init_boids, simulate }: WASMFunctions, Module: any, mode: MODE) => {
  const simulation = new BoidSimulation(population, Module, init_boids);

  p.setup = () => {
    p.createCanvas(500, 500);
    p.fullscreen(true);
    for (let i = 0; i < population; i++) {
      boids.push(new Boid(p, p.random(p.width), p.random(p.height)));
    }
    weight = {
      alignment: 1, cohesion: 1, separation: 1
    }
  };

  p.draw = () => {
    p.background(20);
    p.strokeWeight(5);
    p.stroke(255, 255, 128);



    // Render boids
    if (mode === MODE.CPP_BOIDS) {
      // Update simulation
      simulation.simulate(simulate, weight);
      const positions = simulation.getPositions();
      for (let i = 0; i < simulation.getNumBoids(); i++) {
        const x = positions[i * 2];
        const y = positions[i * 2 + 1];
        p.point(x, y);
      }
    } else {
      for (const boid of boids) {
        boid.checkbound();
        boid.flock(boids, weight);

      }
      for (const boid of boids) {
        boid.update();
        boid.display(p);
      }
    }

    // Draw UI
    const text_size = 12;
    p.strokeWeight(0);
    p.fill(255);
    p.textSize(text_size);
    p.text(`Current population:${population}`, 10, text_size);
    p.text(`Current framerate:${Math.round(p.frameRate())}`, 10, text_size * 2);
    p.text(`Mode : ${mode.toString()}`, 10, text_size * 3);
  }
}

document.getElementById("alignment")?.addEventListener("input", (e) => {

  weight.alignment = parseFloat((e.target as HTMLInputElement).value);
})
document.getElementById("cohesion")?.addEventListener("input", (e) => {
  weight.cohesion = parseFloat((e.target as HTMLInputElement).value);
})
document.getElementById("separation")?.addEventListener("input", (e) => {
  weight.separation = parseFloat((e.target as HTMLInputElement).value);
})


export default sketch;