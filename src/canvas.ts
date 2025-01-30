import p5 from 'p5';
import { BehaviourParams, Color, FlockingWeights, MODE, randomColor } from './components/types.ts'
import { WASMFunctions } from './wasmTypes.ts';
import { BoidSimulation } from './components/BoidSimulation.ts';
import Boid from './components/Boid.ts'
import Rectangle from './components/Rectangle.ts';
import QuadTree from './components/QuadTree.ts';
import Circle from './components/Circle.ts';

// GLOBAL PARAMS
const DIMENSIONS: number = 2;
const MAX_POPULATION : number = 1000;


let flockPopulation : number = 200;
let population: number = 0;
let weight: FlockingWeights;
let behaviourParams: BehaviourParams;
let shouldShowQuadTree: boolean = false;
let shouldShowRadius: boolean = false;
let shouldShowPredator: boolean = false;


let flock_count : number = 0;
const boids: Boid[] = [];
const predatorBoids : Boid[] = [];

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

const simulateBoids = (p: p5, displayBoidFunc, boids: Boid[], predatorBoids : Boid[], quadTree: QuadTree) => {

  // simulate with quad tree
  // create a new qtree with current boids' location
  quadTree.clear();
  for (const boid of boids) {
    quadTree.insert(boid);
  }

  if (shouldShowPredator)
  {
    for (const boid of predatorBoids) {
      quadTree.insert(boid);
    }
  }

  const displayBoids = (boidArray : Boid[]) => {
      for (let i = 0; i < boidArray.length; i++) {
      const boid = boidArray[i];
      const range = new Circle(boid.position.x, boid.position.y, behaviourParams.maxDistance);
       const neighbors = quadTree.query(range)
      boid.flock(neighbors, weight, behaviourParams);
    }
    for (let i = 0; i < boidArray.length; i++) {
      const boid = boidArray[i];
      boid.update(behaviourParams);
      boid.checkbound();
      displayBoidFunc(boid.position, boid.velocity, boid.color, boid.is_predator);
    }
  }

  displayBoids(boids);
  if (shouldShowPredator)
  {
    displayBoids(predatorBoids);
  }

  // display perception radius for the first boid only
  if (shouldShowRadius && boids.length > 0)
  {
    const displayedBoid = boids[0];
    const range = new Circle(displayedBoid.position.x, displayedBoid.position.y, behaviourParams.maxDistance);
    const neighbors = quadTree.query(range);

    // display one highlighted boid and highlight its neighbor boids (of the same flock) in red
    p.strokeWeight(3);

    // Draw the arc for the perception area
    p.noFill();
    p.stroke(displayedBoid.color.r, displayedBoid.color.g, displayedBoid.color.b);
    p.circle(displayedBoid.position.x, displayedBoid.position.y, behaviourParams.maxDistance * 2);
    for (const neighbor of neighbors) {
      if (neighbor === displayedBoid || !neighbor.isSameFlock(displayedBoid.flock_id))
      {
        continue;
      }
      displayBoidFunc(neighbor.position, neighbor.velocity, { r: 255, g: 255, b: 0 });
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
    for (let i = 0; i < flockPopulation; i++) {
      if ( boids.length === MAX_POPULATION)
      {
        break;
      }
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
    p.createCanvas(window.innerWidth * 0.75, window.innerHeight * 0.75);

    // init params
    weight = {
      alignment: 1, cohesion: 1, separation: 1
    }
    behaviourParams = {
      maxSpeed: 4,
      maxDistance: 200,
      perceptionAngle: Math.PI / 2,
      maxEdgeDistance: p.height / 6,
      maxForce: 1,
      maxSpeedFromPredatorMult: 5
    }

    // choose a random color
    const flock_color = randomColor();
    flock_count++;
    for (let i = 0; i < population; i++) {
      boids.push(new Boid(p, p.random(p.width), p.random(p.height), flock_count, flock_color));
    }

    flock_count++;
    const predColor : Color = {
      r: 255, g: 0, b: 0
    } 
    for (let i = 0; i < 2; i++) {
      predatorBoids.push(new Boid(p, p.random(p.width), p.random(p.height), flock_count, predColor, true /* predator*/));
    }
    boundary = new Rectangle(p.width / 2, p.height / 2, p.width, p.height);
    quadTree = new QuadTree(boundary, 4);
    simulation = new BoidSimulation(population, Module, init_boids, p.width, p.height);
  };

  const displayBoidFunc = (position: p5.Vector, velocity: p5.Vector, color: Color, is_predator = false) => {
    const size_mult = is_predator ? 20 : 10;
    p.strokeWeight(size_mult);
    p.stroke(color.r, color.g, color.b);
    p.point(position.x, position.y);
  }

  p.draw = () => {
    p.background(0);
    p.strokeWeight(2);
    p.stroke(100); // pastel pink
    p.rect(p.width / 2, p.height / 2, p.width , p.height);

    // Render boids
    if (mode === MODE.CPP_BOIDS) {
      // Update simulation
      if (simulation) {
        simulation.simulate(simulate, weight, behaviourParams);
        const positions = simulation.getPositions();
        renderPositionArray(displayBoidFunc, positions, simulation.getVelocities(), simulation.getColors());
      }
    } else {
      simulateBoids(p, displayBoidFunc, boids, predatorBoids, quadTree);
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

    // display boundary line where the boids start to come back
    p.strokeWeight(2);
    p.stroke(255, 182, 193); // Pastel Pink
    p.noFill();
    p.rectMode(p.CENTER);
    p.rect(p.width / 2, p.height / 2, p.width - behaviourParams.maxEdgeDistance * 2, p.height - behaviourParams.maxEdgeDistance * 2 );
    
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

document.getElementById("showPredator").addEventListener("input", (e) => {
  shouldShowPredator = !shouldShowPredator;
});

document.getElementById("flockPopulation").addEventListener("input", (e) => {
  flockPopulation = parseInt((e.target as HTMLInputElement).value)
});



export default sketch;