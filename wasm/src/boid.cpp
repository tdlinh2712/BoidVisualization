// wasm/src/boid.cpp
#include "boid.h"

static constexpr float MIN_APPLIED_WEIGHT = 0.01f;

Boid::Boid(float x, float y, int w, int h) : position(x, y), velocity(0, 0), acceleration(0, 0), width(w), height(h) {
    setParams();
    velocity = Vector2D::random2D();
    velocity.setMagnitude(static_cast<float>(rand()) / RAND_MAX * 1.5f + 0.5f); // Random magnitude in range [0.5, 2]
    color = { static_cast<float>(rand() % 256), static_cast<float>(rand() % 256), static_cast<float>(rand() % 256) };
}

void Boid::setParams() {
    maxSpeed = 4.0f;
    maxDistance = 200.0f;
    maxEdgeDistance = 20.0f;
    maxForce = 1.0f;
}

void Boid::update() {
    position = position + velocity; // Update position
    velocity = velocity + acceleration; // Update velocity
    velocity = velocity * (maxSpeed / velocity.magnitude()); // Limit velocity
    acceleration = Vector2D(0, 0); // Reset acceleration
}

void Boid::flock(const std::vector<Boid>& neighbors, const float alignmentWeight, const float cohesionWeight, const float separationWeight) {
    Vector2D separationVec = separation(neighbors);
    // Vector2D edgeAvoidanceVec = avoidEdges(800, 600); // Assuming canvas size
    if (alignmentWeight >= MIN_APPLIED_WEIGHT)
    {
        Vector2D alignmentVec = alignment(neighbors);
        acceleration = acceleration + alignmentVec * alignmentWeight;
    }
    if (cohesionWeight >= MIN_APPLIED_WEIGHT)
    {
        Vector2D cohesionVec = cohesion(neighbors);
        acceleration = acceleration + cohesionVec * cohesionWeight;
    }
    if (separationWeight >= MIN_APPLIED_WEIGHT)
    {
        acceleration =  Vector2D(0, 0);
        acceleration = acceleration + separationVec * separationWeight;
    }
}

void Boid::checkBounds() {
    if (position.x < 0) position.x = width;
    else if (position.x > width) position.x = 0;
    if (position.y < 0) position.y = height;
    else if (position.y > height) position.y = 0;
}

Vector2D Boid::alignment(const std::vector<Boid>& neighbors) {
    Vector2D avg(0, 0);
    int count = 0;

    for (const Boid& boid : neighbors) {
        if (&boid == this)
        {
            continue;
        }
        
        float distance = (position - boid.position).magnitude();
        if (distance <= maxDistance) {
            avg = avg + boid.velocity;
            count++;
        }
    }

    if (count > 0) {
        avg = avg / count;
        avg = avg * (maxSpeed / avg.magnitude());
        avg = avg - velocity;
        avg = limitForce(avg);
    }
    return avg;
}

Vector2D Boid::cohesion(const std::vector<Boid>& neighbors) {
    Vector2D avg(0, 0);
    int count = 0;

    for (const Boid& boid : neighbors) {
        if (&boid == this)
        {
            continue;
        }
        float distance = (position - boid.position).magnitude();
        if (distance <= maxDistance) {
            avg = avg + boid.position;
            count++;
        }
    }

    if (count > 0) {
        avg = avg / count;
        avg = avg * (maxSpeed / avg.magnitude());
        avg = avg - position;
        avg = limitForce(avg);
    }
    return avg;
}

Vector2D Boid::separation(const std::vector<Boid>& neighbors) {
    Vector2D avg(0, 0);
    int count = 0;

    for (const Boid& boid : neighbors) {
        if (&boid == this)
        {
            continue;
        }
        float distance = (position - boid.position).magnitude();
        if (distance > 0 && distance <= maxDistance) {
            Vector2D diff = position - boid.position;
            diff = diff / distance;
            avg = avg + diff;
            count++;
        }
    }

    if (count > 0) {
        avg = avg / count;
        avg = avg * (maxSpeed / avg.magnitude());
        avg = avg - velocity;
        avg = limitForce(avg);
    }
    return avg;
}

Vector2D Boid::avoidEdges() {
    Vector2D avg(0, 0);
    int count = 0;

    if (position.x <= maxEdgeDistance) {
        float distance = position.x;
        Vector2D diff = position;
        diff.x = -diff.x;
        avg = avg + diff * (maxEdgeDistance - distance);
        count++;
    }
    if (position.y <= maxEdgeDistance) {
        float distance = position.y;
        Vector2D diff = position;
        diff.y = -diff.y;
        avg = avg + diff * (maxEdgeDistance - distance);
        count++;
    }
    if ((width - position.x) <= maxEdgeDistance) {
        float distance = width - position.x;
        Vector2D diff = position;
        diff.x = -diff.x;
        avg = avg + diff * (maxEdgeDistance - distance);
        count++;
    }
    if ((height - position.y) <= maxEdgeDistance) {
        float distance = height - position.y;
        Vector2D diff = position;
        diff.y = -diff.y;
        avg = avg + diff * (maxEdgeDistance - distance);
        count++;
    }

    if (count > 0) {
        avg = avg / count;
        avg = avg * (maxSpeed / avg.magnitude());
        avg = avg - velocity;
        avg = limitForce(avg);
    }
    return avg;
}

Vector2D Boid::limitForce(Vector2D& force) {
    float magnitude = force.magnitude();
    if (magnitude > maxForce) {
        // Scale down the force to maxForce
        force = force * (maxForce / magnitude);
    }
    return force;
}
