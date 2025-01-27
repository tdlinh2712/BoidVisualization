#include <emscripten/emscripten.h>
#include <emscripten/bind.h>

#include "vector2d.h"
#include "boid.h"
#include <emscripten.h>
#include "helpers.h"
#include "quad_tree.h"
#include "circle.h"
int main() {
    return 0;
}
int cur = 0;
std::vector<Boid> boids;
QuadTree<Boid> quadTree;
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

extern "C" EMSCRIPTEN_KEEPALIVE void write_velocities(int population, float* velocities) {
    for (int i = 0; i < population; i++) {
        velocities[xPos(i)] = boids[i].getVelocityX();      // x-component
        velocities[yPos(i)] = boids[i].getVelocityY();     // y-component
    }
}

extern "C" EMSCRIPTEN_KEEPALIVE float init_boids(int population, int width, int height,  float* positions) {
    for (int i = 0; i < population; i++) {
        boids.push_back( Boid(((float)rand() / RAND_MAX) * width, ((float)rand() / RAND_MAX) * height, width, height));
        positions[xPos(i)] = boids[i].getX();      // x-component
        positions[yPos(i)] = boids[i].getY();     // y-component
    }
    Rectangle boundary(width / 2.0, height / 2.0, width, height);
    quadTree = QuadTree<Boid>(boundary, 4);
    return positions[xPos(0)] + positions[yPos(0)];
}

extern "C" EMSCRIPTEN_KEEPALIVE void simulate(int population, float alignmentWeight, float cohesionWeight, float separationWeight, float maxSpeed, float maxDistance, float maxEdgeDistance, float maxForce, float* positions,  float* velocities) {
        Parameters params{
            .alignmentWeight = alignmentWeight,
            .cohesionWeight = cohesionWeight,
            .separationWeight = separationWeight,
            .maxSpeed = maxSpeed,
            .maxDistance = maxDistance,
            .maxEdgeDistance = maxEdgeDistance,
            .maxForce = maxForce
        };
        quadTree.clear();
        for (int i = 0; i < population; i++) {
            quadTree.insert(boids[i]);
        }
        for (int i = 0; i < population; i++) {
            const Circle range(boids[i].getX(), boids[i].getY(), maxDistance);
            const auto neighbors = quadTree.query(range);
            boids[i].flock(neighbors, params);
        }
        for (int i = 0; i < population; i++) {
            boids[i].update(params);
            boids[i].checkBounds();
        }

        write_pos(population, positions);
        write_velocities(population, velocities);
        // write new pos to array
}