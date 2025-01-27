// wasm/src/boid.cpp
#include "boid.h"

static constexpr float MIN_APPLIED_WEIGHT = 0.01f;

Boid::Boid(float x, float y, int w, int h) : position(x, y), velocity(0, 0), acceleration(0, 0), width(w), height(h) {
    velocity = Vector2D::random2D();
    velocity.setMagnitude(static_cast<float>(rand()) / RAND_MAX * 1.5f + 0.5f); // Random magnitude in range [0.5, 2]
}

void Boid::update(const Parameters params) {
    position = position + velocity; // Update position
    velocity = velocity + acceleration; // Update velocity
    velocity = limitForce(velocity, params); // Limit velocity
    acceleration = Vector2D(0, 0); // Reset acceleration
}

void Boid::flock(const std::vector<Boid*>& neighbors, const Parameters& params) {
    // Vector2D edgeAvoidanceVec = avoidEdges(800, 600); // Assuming canvas size
    acceleration = Vector2D(0, 0); // Reset acceleration
    if (params.alignmentWeight >= MIN_APPLIED_WEIGHT)
    {
        Vector2D alignmentVec = alignment(neighbors, params);
        acceleration = acceleration + alignmentVec * params.alignmentWeight;
    }
    if (params.cohesionWeight >= MIN_APPLIED_WEIGHT)
    {
        Vector2D cohesionVec = cohesion(neighbors, params);
        acceleration = acceleration + cohesionVec * params.cohesionWeight;
    }
    if (params.separationWeight >= MIN_APPLIED_WEIGHT)
    {
        Vector2D separationVec = separation(neighbors, params);
        acceleration = acceleration + separationVec * params.separationWeight;
    }
}

void Boid::checkBounds() {
    if (position.x < 0) position.x = width;
    else if (position.x > width) position.x = 0;
    if (position.y < 0) position.y = height;
    else if (position.y > height) position.y = 0;
}

Vector2D Boid::alignment(const std::vector<Boid*>& neighbors, const Parameters& params) {
    Vector2D avg(0, 0);
    int count = 0;

    for (const Boid* boid : neighbors) {
        if (boid == this)
        {
            continue;
        }
        
        float distance = (position - boid->position).magnitude();
        if (distance != 0 && distance <= params.maxDistance) {
            avg = avg + boid->velocity;
            count++;
        }
    }

    if (count > 0) {
        avg = avg / count;
        avg.setMagnitude(params.maxSpeed);
        avg = avg - velocity;
        avg = limitForce(avg, params);
    }
    return avg;
}

Vector2D Boid::cohesion(const std::vector<Boid*>& neighbors, const Parameters& params) {
    Vector2D avg(0, 0);
    int count = 0;

    for (const Boid* boid : neighbors) {
        if (boid == this)
        {
            continue;
        }
        float distance = (position - boid->position).magnitude();
        if (distance != 0 && distance <= params.maxDistance) {
            avg = avg + boid->position;
            count++;
        }
    }

    if (count > 0) {
        avg = avg / count;
        avg = avg - position;
        avg.setMagnitude(params.maxSpeed);
        avg = avg - velocity;
        avg = limitForce(avg, params);
    }
    return avg;
}

Vector2D Boid::separation(const std::vector<Boid*>& neighbors, const Parameters& params) {
    Vector2D avg(0, 0);
    int count = 0;

    for (const auto* boid : neighbors) {
        if (boid == this)
        {
            continue;
        }
        float distance = (position - boid->position).magnitude();
        if (distance != 0 && distance <= params.maxDistance) {
            Vector2D diff = position - boid->position;
            diff = diff / distance;
            avg = avg + diff;
            count++;
        }
    }

    if (count > 0) {
        avg = avg / count;
        avg.setMagnitude(params.maxSpeed);
        avg = avg - velocity;
        avg = limitForce(avg, params);
    }
    return avg;
}

Vector2D Boid::avoidEdges(const Parameters& params) {
    Vector2D avg(0, 0);
    int count = 0;

    if (position.x <= params.maxEdgeDistance) {
        float distance = position.x;
        Vector2D diff = position;
        diff.x = -diff.x;
        avg = avg + diff * (params.maxEdgeDistance - distance);
        count++;
    }
    if (position.y <= params.maxEdgeDistance) {
        float distance = position.y;
        Vector2D diff = position;
        diff.y = -diff.y;
        avg = avg + diff * (params.maxEdgeDistance - distance);
        count++;
    }
    if ((width - position.x) <= params.maxEdgeDistance) {
        float distance = width - position.x;
        Vector2D diff = position;
        diff.x = -diff.x;
        avg = avg + diff * (params.maxEdgeDistance - distance);
        count++;
    }
    if ((height - position.y) <= params.maxEdgeDistance) {
        float distance = height - position.y;
        Vector2D diff = position;
        diff.y = -diff.y;
        avg = avg + diff * (params.maxEdgeDistance - distance);
        count++;
    }

    if (count > 0) {
        avg = avg / count;
        if (avg.magnitude() != 0)
        {
            avg = avg * (params.maxSpeed / avg.magnitude());
        }
        avg = avg - velocity;
        avg = limitForce(avg, params);
    }
    return avg;
}

Vector2D Boid::limitForce(Vector2D& force, const Parameters& params) {
    float magnitude = force.magnitude();
    if (magnitude > params.maxForce) {
        force.setMagnitude(params.maxForce);
        // Scale down the force to maxForce
    }
    return force;
}
