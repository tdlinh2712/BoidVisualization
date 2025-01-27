
export interface WASMFunctions {
    myFunction: () => void;
    calculate_acceleration : (positions : Float32Array, velocities : Float32Array, accelerations : Float32Array, numBoids : number) => void;
    init_boids : (population : number, width : number, height : number, positions : Float32Array) => void;
    simulate : (population : number, alignmentWeight : number, cohesionWeight: number, separationWeight: number, positions : Float32Array, velocities : Float32Array) => void;
  }