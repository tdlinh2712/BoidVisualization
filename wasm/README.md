## To compile WASM into a module

```
cd wasm
emcc src/main.cpp src/boid.cpp  -o ../public/wasm.js \
    -s WASM=1 \
    -s EXPORTED_FUNCTIONS='["_calculate_acceleration","_init_boids", "_simulate","_main", "_malloc", "_free"]' \
    -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' -s NO_EXIT_RUNTIME=1 -s MODULARIZE=1 -s EXPORT_ES6=1 -s NO_DISABLE_EXCEPTION_CATCHING
```

the module (WASM file and js file) is now compiled in /public