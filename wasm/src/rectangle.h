#ifndef RECTANGLE_H
#define RECTANGLE_H

#include "vector2d.h" // Assuming you have a Vector2D class defined
#include "circle.h" // Assuming you have a Vector2D class defined
#include <algorithm> // For std::max and std::min

class Rectangle {
public:
    float x;      // Center x
    float y;      // Center y
    float w;      // Width
    float h;      // Height
    float halfW;  // Half Width
    float halfH;  // Half Height

    Rectangle(float x, float y, float w, float h)
        : x(x), y(y), w(w), h(h), halfW(w / 2), halfH(h / 2) {}

    bool contains(const Vector2D& point) const {
        return (point.x >= x - halfW) && (point.y >= y - halfH &&
               point.x <= x + halfW) && (point.y <= y + halfH);
    }

    bool intersects(const Rectangle& other) const {
        return !(x - halfW > other.x + other.halfW ||
                 x + halfW < other.x - other.halfW ||
                 y - halfH > other.y + other.halfH ||
                 y + halfH < other.y - other.halfH);
    }

    bool intersects(const Circle& circle) const {
        // Find the closest point on the rectangle to the circle's center
        float closestX = std::max(x - halfW, std::min(circle.x, x + halfW));
        float closestY = std::max(y - halfH, std::min(circle.y, y + halfH));

        // Calculate the distance from the closest point to the circle's center
        float distanceX = circle.x - closestX;
        float distanceY = circle.y - closestY;

        // Check if the distance is less than or equal to the circle's radius
        return (distanceX * distanceX + distanceY * distanceY) <= (circle.radius * circle.radius);
    }

    // Additional method to check intersection with Circle can be added here
};

#endif // RECTANGLE_H 