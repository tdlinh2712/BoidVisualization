#include <cmath>

class Vector2D {
public:
    double x; // X-coordinate
    double y; // Y-coordinate

    // Constructor
    Vector2D(double x = 0, double y = 0) : x(x), y(y) {}

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
        if (scalar == 0) throw std::invalid_argument("Division by zero");
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
