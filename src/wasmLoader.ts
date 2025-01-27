import Module from '/public/wasm.js';
import sketch  from './canvas.ts';
import p5 from 'p5';
import { MODE } from './components/types.ts';
// let exportedFunctions : WASMFunctions | undefined = undefined;
const startWasm = async () => {
    const module = await Module();
    const myFunction = module.cwrap('myFunction', null, null);
    const calculate_acceleration = module.cwrap('calculate_acceleration', null, ["Float32Array", "Float32Array", "Float32Array", "number"]);
    const init_boids = module.cwrap('init_boids', null, ["number", "number", "number", "Float32Array"]);
    const simulate = module.cwrap('simulate', null, ["number", "Float32Array"]);

    const exportedFunctions : WASMFunctions = {
        myFunction, 
        calculate_acceleration,
        init_boids,
        simulate,
    }
    // new p5((p: p5) => sketch(p, exportedFunctions, module, MODE.JS_BOIDS));
    new p5((p: p5) => sketch(p, exportedFunctions, module, MODE.JS_BOIDS));

}
await startWasm();