#pragma once

#include <cmath>
#include <iostream>
class Vector2D {
public:
    float x; // X-coordinate
    float y; // Y-coordinate

    // Constructor
    Vector2D(float x = 0, float y = 0) : x(x), y(y) {}
    
    static Vector2D random2D() {
        float angle = static_cast<float>(rand()) / RAND_MAX * 2 * M_PI; // Random angle
        return Vector2D(cos(angle), sin(angle)); // Return a unit vector in that direction
    }
    // Add two vectors
    Vector2D operator+(const Vector2D& other) const {
        return Vector2D(x + other.x, y + other.y);
    }

    // Subtract two vectors
    Vector2D operator-(const Vector2D& other) const {
        return Vector2D(x - other.x, y - other.y);
    }

    // Scalar multiplication
    Vector2D operator*(double scalar) const {
        return Vector2D(x * scalar, y * scalar);
    }

    // Scalar division
    Vector2D operator/(double scalar) const {
        if (scalar == 0) throw std::invalid_argument("Division by zero, ");
        return Vector2D(x / scalar, y / scalar);
    }

    // Dot product
    double dot(const Vector2D& other) const {
        return x * other.x + y * other.y;
    }

    // Magnitude of the vector
    double magnitude() const {
        return std::sqrt(x * x + y * y);
    }

    void setMagnitude(float magnitude) {
        float currentMagnitude = this->magnitude();
        if (currentMagnitude > 0) {
            x = (x / currentMagnitude) * magnitude;
            y = (y / currentMagnitude) * magnitude;
        }
    }

    // Normalize the vector
    Vector2D normalize() const {
        double mag = magnitude();
        if (mag == 0) throw std::invalid_argument("Cannot normalize a zero vector");
        return *this / mag;
    }

    // Print the vector
    void print() const {
        std::cout << "(" << x << ", " << y << ")" << std::endl;
    }
};
