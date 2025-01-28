import p5 from 'p5';
import { BehaviourParams, Color, FlockingWeights, MODE, randomColor } from './components/types.ts'
import { WASMFunctions } from './wasmTypes.ts';
import { BoidSimulation } from './components/BoidSimulation.ts';
import Boid from './components/Boid.ts'
import Rectangle from './components/Rectangle.ts';
import QuadTree from './components/QuadTree.ts';
import Circle from './components/Circle.ts';

const DIMENSIONS: number = 2;
let population: number = 0;
let weight: FlockingWeights;
let behaviourParams: BehaviourParams;
let shouldShowQuadTree: boolean = false;
let shouldShowRadius: boolean = false;

let flock_count : number = 0;
const boids: Boid[] = [];

const renderPositionArray = (displayBoidFunc, positions: Float32Array, velocities: Float32Array, colors: Color[]) => {
  for (let i = 0; i < positions.length / DIMENSIONS; i++) {
    const x = positions[i * DIMENSIONS];
    const y = positions[i * DIMENSIONS + 1];
    const velX = velocities[i * DIMENSIONS];
    const velY = velocities[i * DIMENSIONS + 1];
    displayBoidFunc(new p5.Vector(x, y), new p5.Vector(velX, velY), colors[i]);
  }
}

let lastClicked = 0;

const checkFlock = (curBoid : Boid, other : Boid) => {
  return curBoid.isSameFlock(other);
}

const simulateBoids = (p: p5, displayBoidFunc, boids: Boid[], quadTree: QuadTree) => {

  // simulate with quad tree
  // create a new qtree with current boids' location
  quadTree.clear();
  for (const boid of boids) {
    quadTree.insert(boid);
  }

  for (let i = 0; i < boids.length; i++) {
    const boid = boids[i];
    const range = new Circle(boid.position.x, boid.position.y, behaviourParams.maxDistance);
    const neighbors = quadTree.query(range, (other) => checkFlock(boid, other));
    boid.flock(neighbors, weight, behaviourParams);
  }
  for (let i = 0; i < boids.length; i++) {
    const boid = boids[i];
    boid.update(behaviourParams);
    boid.checkbound();
    displayBoidFunc(boid.position, boid.velocity, boid.color);
    // if it's the first boid, display the perception radius
  }
  if (shouldShowRadius && boids.length > 0)
  {
    const displayedBoid = boids[0];
    const range = new Circle(displayedBoid.position.x, displayedBoid.position.y, behaviourParams.maxDistance);
    const neighbors = quadTree.query(range);
    
    // display one highlighted boid and highlight its neighbor boids (of the same flock) in red
    p.strokeWeight(3);
    p.noFill();
    p.stroke(displayedBoid.color.r, displayedBoid.color.g, displayedBoid.color.b);
    p.circle(displayedBoid.position.x, displayedBoid.position.y, behaviourParams.maxDistance * 2);
    for (const neighbor of neighbors) {
      if (neighbor === displayedBoid || !neighbor.isSameFlock(displayedBoid))
      {
        continue;
      }
      displayBoidFunc(neighbor.position, neighbor.velocity, { r: 255, g: 0, b: 0 });
    }
  }
  

  if (shouldShowQuadTree) {
    quadTree.display(p);
  }

  if (p.mouseIsPressed) {
    if (p.mouseX < 0 || p.mouseY < 0) {
      return;
    }
    const cur_time = Date.now();
    const TIMEOUT_SECONDS = 1;
    if (cur_time - lastClicked < TIMEOUT_SECONDS * 1000) {
      return;
    }
    lastClicked = cur_time;

    const newBoidRadius = 100;

    // add 100 new boids of same random color
    const flock_color = randomColor();
    flock_count++;
    for (let i = 0; i < 200; i++) {
      const newBoid = new Boid(p, p.random(p.mouseX - newBoidRadius, p.mouseX + newBoidRadius), p.random(p.mouseY - newBoidRadius, p.mouseY + newBoidRadius), flock_count, flock_color);
      boids.push(newBoid);
      displayBoidFunc(newBoid.position, newBoid.velocity, newBoid.color)
      population++;
    }
  }

}

const sketch = (p: p5, { init_boids, simulate }: WASMFunctions, Module: any, mode: MODE) => {
  let boundary = new Rectangle(p.width / 2, p.height / 2, p.width, p.height);
  let quadTree = new QuadTree(boundary, 4);
  let simulation: BoidSimulation | null = null;
  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight - 100);

    // init params
    weight = {
      alignment: 1, cohesion: 1, separation: 1
    }
    behaviourParams = {
      maxSpeed: 4,
      maxDistance: 200,
      maxEdgeDistance: 20,
      maxForce: 1
    }

    // choose a random color
    const flock_color = randomColor();
    flock_count++;
    for (let i = 0; i < population; i++) {
      boids.push(new Boid(p, p.random(p.width), p.random(p.height), flock_count, flock_color));
    }


    boundary = new Rectangle(p.width / 2, p.height / 2, p.width, p.height);
    quadTree = new QuadTree(boundary, 4);
    simulation = new BoidSimulation(population, Module, init_boids, p.width, p.height);
  };

  const displayBoidFunc = (position: p5.Vector, velocity: p5.Vector, color: Color) => {
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
    p.stroke(color.r, color.g, color.b); // Set stroke with alpha
    // Draw the tail line
    p.line(position.x, position.y, x1, y1);
  }

  p.draw = () => {
    p.background(20);
    // p.strokeWeight(5);
    // p.stroke(255, 255, 128);

    // Render boids
    if (mode === MODE.CPP_BOIDS) {
      // Update simulation
      if (simulation) {
        simulation.simulate(simulate, weight, behaviourParams);
        const positions = simulation.getPositions();
        renderPositionArray(displayBoidFunc, positions, simulation.getVelocities(), simulation.getColors());
      }
    } else {
      simulateBoids(p, displayBoidFunc, boids, quadTree);
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

document.querySelectorAll('.slider').forEach(slider => {
  slider.addEventListener('input', (e) => {
    const valueSpan = document.getElementById(e.target.id + 'Value');
    valueSpan.innerText = e.target.value;
  });
});


document.getElementById("alignment")?.addEventListener("input", (e) => {
  weight.alignment = parseFloat((e.target as HTMLInputElement).value);
})
document.getElementById("cohesion")?.addEventListener("input", (e) => {
  weight.cohesion = parseFloat((e.target as HTMLInputElement).value);

})
document.getElementById("separation")?.addEventListener("input", (e) => {
  weight.separation = parseFloat((e.target as HTMLInputElement).value);

})

document.getElementById("maxSpeed").addEventListener("input", (e) => {
  behaviourParams.maxSpeed = parseFloat((e.target as HTMLInputElement).value)
});

document.getElementById("maxDistance").addEventListener("input", (e) => {
  behaviourParams.maxDistance = parseFloat((e.target as HTMLInputElement).value)

});

document.getElementById("maxForce").addEventListener("input", (e) => {
  behaviourParams.maxForce = parseFloat((e.target as HTMLInputElement).value)
});

document.getElementById("showQuadtree").addEventListener("input", (e) => {
  shouldShowQuadTree = !shouldShowQuadTree;
});

document.getElementById("showRadius").addEventListener("input", (e) => {
  shouldShowRadius = !shouldShowRadius;
});



export default sketch;