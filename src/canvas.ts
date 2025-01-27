import p5 from 'p5';
import { Color, FlockingWeights, MODE } from './components/types.ts'
import { WASMFunctions } from './wasmTypes.ts';
import { BoidSimulation } from './components/BoidSimulation.ts';
import Boid from './components/Boid.ts'
import Rectangle from './components/Rectangle.ts';
import QuadTree from './components/QuadTree.ts';
import Circle from './components/Circle.ts';

const DIMENSIONS: number = 2;
const population: number = 3000;
let weight: FlockingWeights;
const boids: Boid[] = [];

const renderPositionArray = (displayBoidFunc, positions: Float32Array, velocities : Float32Array, colors: Color[]) => {
  for (let i = 0; i < positions.length / DIMENSIONS; i++) {
    const x = positions[i * DIMENSIONS];
    const y = positions[i * DIMENSIONS + 1];
    const velX = velocities[i * DIMENSIONS];
    const velY = velocities[i * DIMENSIONS + 1];
    displayBoidFunc(new p5.Vector(x, y), new p5.Vector(velX, velY), colors[i]);
  }
}

const simulateBoids = ( displayBoidFunc, boids: Boid[], quadTree : QuadTree) => {
  // simulate with quad tree
  // create a new qtree with current boids' location
  quadTree.clear();
  for (const boid of boids)
  {
    quadTree.insert(boid);
  }

  for (const boid of boids) {
    const range = new Circle(boid.position.x, boid.position.y, boid.maxDistance);
    const neighbors = quadTree.query(range);
    boid.flock(neighbors, weight);
  }
  for (const boid of boids) {
    boid.update();
    boid.checkbound();
    displayBoidFunc(boid.position, boid.velocity, boid.color);
  }
  // quadTree.display(p);
}

const sketch = (p: p5, { init_boids, simulate }: WASMFunctions, Module: any, mode: MODE) => {
  let boundary = new Rectangle(p.width / 2, p.height / 2, p.width, p.height);
  let quadTree = new QuadTree(boundary, 4);
  let simulation : BoidSimulation | null = null;
  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight - 100);
    for (let i = 0; i < population; i++) {
      boids.push(new Boid(p, p.random(p.width), p.random(p.height)));
    }
    weight = {
      alignment: 1, cohesion: 1, separation: 1
    }
    boundary = new Rectangle(p.width / 2, p.height / 2, p.width, p.height);
    quadTree = new QuadTree(boundary, 4);
    simulation = new BoidSimulation(population, Module, init_boids, p.width, p.height);
  };

  const displayBoidFunc = ( position : p5.Vector, velocity : p5.Vector, color : Color) => {
    const angle = velocity.heading(); // Get the angle of the boid's velocity

    // Draw the body as an ellipse
    const bodyWidth = 5; // Width of the body
    const bodyHeight = 6; // Height of the body
    p.stroke(color.r, color.g, color.b); 
    p.strokeWeight(2);
    p.ellipse(position.x, position.y, bodyWidth, bodyHeight);
    
    // Draw the tail as a line instead of a triangle
    const tailLength = 10; // Length of the tail
    const x1 = position.x - tailLength * Math.cos(angle);
    const y1 = position.y - tailLength * Math.sin(angle);
    
    // Set the stroke color with fading effect
    p.strokeWeight(5)
    p.stroke(color.r, color.g, color.b, 150); // Set stroke with alpha
    // Draw the tail line
    p.line(position.x, position.y, x1, y1);
  }

  const x = 150, y = 150;

  p.draw = () => {
    p.background(20);
    // p.strokeWeight(5);
    // p.stroke(255, 255, 128);

    // Render boids
    if (mode === MODE.CPP_BOIDS) {
      // Update simulation
      if (simulation) {
        simulation.simulate(simulate, weight);
        const positions = simulation.getPositions();
        renderPositionArray(displayBoidFunc, positions, simulation.getVelocities(), simulation.getColors());
      }
    } else {
      simulateBoids(displayBoidFunc, boids, quadTree);
    }
    // query quadtree
    // Draw UI
    const text_size = 12;
    p.strokeWeight(0);
    p.fill(255);
    p.textSize(text_size);
    p.text(`Current population:${population}`, 10, text_size);
    p.text(`Current framerate:${Math.round(p.frameRate())}`, 10, text_size * 2);
    p.text(`Mode : ${mode.toString()}`, 10, text_size * 3);
    // p.noLoop();
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