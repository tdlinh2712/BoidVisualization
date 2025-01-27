#ifndef BOID_H
#define BOID_H

#include <vector>
#include <cmath>
#include <cstdlib>
#include "vector2d.h" // Include the Vector2D header

struct Parameters {
    float alignmentWeight;
    float cohesionWeight;
    float separationWeight;
    float maxSpeed;
    float maxDistance;
    float maxEdgeDistance;
    float maxForce;
};

// Boid class definition
class Boid {
public:
    // Constructor
    Boid(float x, float y, int w, int h);

    // Update the boid's position and velocity
    void update(const Parameters params);

    // Apply flocking behavior based on neighbors
    void flock(const std::vector<Boid*>& neighbors, const Parameters& params);

    // Check and correct the boid's position if it goes out of bounds
    void checkBounds();

    // Getters for position and velocity
    float getX() const { return position.x; }
    float getY() const { return position.y; }
    float getVelocityX() const { return velocity.x; }
    float getVelocityY() const { return velocity.y; }
    Vector2D& getPosition() { return position; }
private:
    // Boid properties
    Vector2D position;       // Position (x, y)
    Vector2D velocity;       // Velocity (vx, vy)
    Vector2D acceleration;   // Acceleration (ax, ay)
    // Canvas width & height limit
    int width;
    int height;


    // Private methods for flocking behavior
    void setParams();        // Set parameters for the boid
    Vector2D alignment(const std::vector<Boid*>& neighbors, const Parameters& params); // Calculate alignment vector
    Vector2D cohesion(const std::vector<Boid*>& neighbors, const Parameters& params);  // Calculate cohesion vector
    Vector2D separation(const std::vector<Boid*>& neighbors, const Parameters& params); // Calculate separation vector
    Vector2D avoidEdges(const Parameters& params);          // Calculate edge avoidance vector
    Vector2D limitForce(Vector2D& force, const Parameters& params);
};

#endif // BOID_H
