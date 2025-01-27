#ifndef QUADTREE_H
#define QUADTREE_H

#include <vector>
#include <iostream>
#include "rectangle.h" // Assuming you have a Rectangle class defined
#include "circle.h" // Assuming you have a Rectangle class defined

template <typename T>
class QuadTree {
public:
    Rectangle boundary; // The boundary of the quadtree
    int capacity;       // Maximum number of points in a node
    std::vector<T*> points; // Points contained in this quadtree node
    std::vector<std::unique_ptr<QuadTree<T>>> subTrees; // Child quadtrees
    QuadTree() : boundary(0, 0, 0, 0), capacity(0) {}
    QuadTree(Rectangle boundary, int capacity)
        : boundary(boundary), capacity(capacity) {}

    void clear() {
        points.clear();
        subTrees.clear();
    }

    bool insert(T& point) {
        if (!boundary.contains(point.getPosition())) {
            return false; // Point is out of bounds
        }

        if (points.size() < capacity) {
            points.push_back(&point);
            return true;
        }

        if (subTrees.empty()) {
            subdivide();
        }

        for (const auto& subTree : subTrees) {
            if (subTree->insert(point)) {
                return true;
            }
        }
        return false;
    }

    void subdivide() {
        float x = boundary.x;
        float y = boundary.y;
        float w = boundary.w / 2;
        float h = boundary.h / 2;

        subTrees.push_back(std::make_unique<QuadTree<T>>(Rectangle(x, y, w, h), capacity)); // Top-left
        subTrees.push_back(std::make_unique<QuadTree<T>>(Rectangle(x + w, y, w, h), capacity)); // Top-right
        subTrees.push_back(std::make_unique<QuadTree<T>>(Rectangle(x, y + h, w, h), capacity)); // Bottom-left
        subTrees.push_back(std::make_unique<QuadTree<T>>(Rectangle(x + w, y + h, w, h), capacity)); // Bottom-right
    }

    std::vector<T*> query(const Circle& range) {
        std::vector<T*> found;
        if (!boundary.intersects(range)) {
            return found; // No intersection
        }

        for (auto* point : points) {
            if (range.contains(point->getPosition())) {
                found.push_back(point);
            }
        }

        for (const auto& subTree : subTrees) {
            auto subTreePoints = subTree->query(range);
            found.insert(found.end(), subTreePoints.begin(), subTreePoints.end());
        }

        return found;
    }
};

#endif // QUADTREE_H 