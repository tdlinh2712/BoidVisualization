import { FlockingWeights } from "./types";

export class BoidSimulation {
    private positions: Float32Array;
    private velocities: Float32Array;
    private accelerations: Float32Array;
    private positionPtr: number;
    private velocityPtr: number;
    private accelerationPtr: number;
    private module: any;
    private numBoids: number;

    constructor(numBoids: number, module: any, init_boids: Function) {
        this.numBoids = numBoids;
        this.module = module;
        
        // Initialize arrays
        this.positions = new Float32Array(numBoids * 2);
        this.velocities = new Float32Array(numBoids * 2);
        this.accelerations = new Float32Array(numBoids * 2);

        // Allocate WASM memory
        this.positionPtr = module._malloc(this.positions.length * this.positions.BYTES_PER_ELEMENT);
        this.velocityPtr = module._malloc(this.velocities.length * this.velocities.BYTES_PER_ELEMENT);
        this.accelerationPtr = module._malloc(this.accelerations.length * this.accelerations.BYTES_PER_ELEMENT);

        // Initialize memory
        this.initializeMemory();
        
        // Initialize boids
        init_boids(numBoids, 500, 500, this.positionPtr);
        this.updatePositionsFromWasm();
    }

    private initializeMemory() {
        this.module.HEAPF32.set(this.positions, this.positionPtr >> 2);
        this.module.HEAPF32.set(this.velocities, this.velocityPtr >> 2);
        this.module.HEAPF32.set(this.accelerations, this.accelerationPtr >> 2);
    }

    public updatePositionsFromWasm() {
        this.positions.set(
            this.module.HEAPF32.subarray(
                this.positionPtr >> 2,
                (this.positionPtr >> 2) + this.positions.length
            )
        );
    }

    public simulate(simulateFunc: Function, weight : FlockingWeights) {
        const { alignment, cohesion, separation } = weight;
        simulateFunc(this.numBoids, this.positionPtr, alignment, cohesion, separation );
        this.updatePositionsFromWasm();
    }

    public getPositions() {
        return this.module.HEAPF32.subarray(
            this.positionPtr >> 2,
            (this.positionPtr >> 2) + this.positions.length
        );
    }

    public getNumBoids() {
        return this.numBoids;
    }
} 