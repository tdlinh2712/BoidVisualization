#ifndef CIRCLE_H
#define CIRCLE_H

#include "vector2d.h" // Assuming you have a Vector2D class defined

class Circle {
public:
    float x;      // Center x
    float y;      // Center y
    float radius; // Radius

    Circle(float x, float y, float r)
        : x(x), y(y), radius(r) {}

    bool contains(const Vector2D& point) const {
        float distance = sqrt(pow(x - point.x, 2) + pow(y - point.y, 2));
        return distance <= radius;
    }

    // Additional method to check intersection with Rectangle can be added here
};

#endif // CIRCLE_H 