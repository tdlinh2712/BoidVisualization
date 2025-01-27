import Boid from "./Boid";

export interface Color {
    r: number;
    g: number;
    b: number;
};

export interface FlockingWeights {
    alignment: number;
    cohesion: number;
    separation: number;
}
export enum MODE {
    CPP_BOIDS = "WebAssembly",
    JS_BOIDS = "JavaScript"
}

export interface Point {
    x: number,
    y : number,
    userData : Boid
}