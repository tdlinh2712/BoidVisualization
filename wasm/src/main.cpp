#include <emscripten/emscripten.h>
#include <emscripten/bind.h>

#include "vector2d.h"
#include "boid.h"
#include <emscripten.h>
#include "helpers.h"

int main() {
    return 0;
}
int cur = 0;
std::vector<Boid> boids;

extern "C" EMSCRIPTEN_KEEPALIVE void calculate_acceleration(float* position, float* velocity, float* acceleration, int num_boids) {
    for (int i = 0; i < num_boids; i++) {
        // Example: Simplified computation
        acceleration[i * 2] = -velocity[i * 2];      // x-component
        acceleration[i * 2 + 1] = -velocity[i * 2 + 1]; // y-component
        // std::cout << acceleration[i * 2]<<","<<acceleration[i * 2+1]<<std::endl;
    }
}

extern "C" EMSCRIPTEN_KEEPALIVE void write_pos(int population, float* positions) {
    for (int i = 0; i < population; i++) {
        positions[xPos(i)] = boids[i].getX();      // x-component
        positions[yPos(i)] = boids[i].getY();     // y-component
    }
}

extern "C" EMSCRIPTEN_KEEPALIVE float init_boids(int population, int width, int height,  float* positions) {
    for (int i = 0; i < population; i++) {
        boids.push_back( Boid(((float)rand() / RAND_MAX) * width, ((float)rand() / RAND_MAX) * height, width, height));
        positions[xPos(i)] = boids[i].getX();      // x-component
        positions[yPos(i)] = boids[i].getY();     // y-component
    }
    return positions[xPos(0)] + positions[yPos(0)];
}

extern "C" EMSCRIPTEN_KEEPALIVE void simulate(int population, float* positions, float alignmentWeight, float cohesionWeight, float separationWeight) {
        for (int i = 0; i < population; i++) {
            boids[i].checkBounds();
            boids[i].flock(boids, alignmentWeight, cohesionWeight, separationWeight);
        }
        for (int i = 0; i < population; i++) {
            boids[i].update();
        }

        write_pos(population, positions);
        // write new pos to array

    }