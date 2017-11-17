import copy
import time

import math


world = [[]]
goals = []
portals = {}


def main():
    global world, goals, portals

    file = open("blatt3_environment.txt", "r")
    world = [list(line.rstrip()) for line in file]
    start = find("s")[0]
    goals = find('g')
    portals = find_portals()

    # Uncomment first line for breadth first or second line for depth first
    # search(start, QueueFrontier, multiple_path_pruning)
    # search(start, StackFrontier, circle_checking)
    search(start, PriorityQueue, multiple_path_pruning)


def output(visited, path, neighbours=None):
    if neighbours is None:
        neighbours = {}

    display = copy.deepcopy(world)

    put(display, '-', visited)
    put(display, '+', path)
    put(display, '#', neighbours)

    print_colorized(display)


def put(matrix, value, positions):
    height = len(matrix)
    width = len(matrix[1])
    for (x, y) in positions:
        if x in range(width) and y in range(height):
            matrix[y][x] = value


def print_colorized(matrix):
    colors = {
        '-': '\033[34m',
        '+': '\033[33m',
        '#': '\033[31m',
        'x': '\033[37m'
    }

    for row in matrix:
        for cell in row:
            if cell in colors:
                print(colors[cell] + cell + '\033[0m', end='')
            else:
                print(cell, end='')

        print()


def in_frontier(position, frontier):
    for path in frontier:
        if position in path:
            return True

    return False


def search(start, frontier_class, pruning_method):
    frontier = frontier_class(start)
    visited = {start}

    while not frontier.is_empty():
        time.sleep(0.1)

        path = frontier.get_next()
        (x, y) = current = path[len(path) - 1]

        if current in goals:
            output(visited, path)
            return path

        else:
            pruned_neighbours = pruning_method(path, get_free_neighbours(x, y), visited)

            output(visited, path, pruned_neighbours)

            frontier.add(path, pruned_neighbours)

            for n in pruned_neighbours:
                visited.add(n)


def f(path):
    return c(path) + h2(path)


def h(path):
    a = path[-1]
    return manhattan_distance(a, min(goals, key=lambda b: manhattan_distance(a, b)))


def h2(path):
    neighbours = list(portals.keys()) + goals

    frontier = [(0, [path[-1]])]  # (c, p)
    while len(frontier) > 0:
        (cost, path) = min(frontier, key=lambda e: e[0])
        frontier.remove((cost, path))
        position = path[-1]

        if position in goals:
            return cost

        for neighbour in neighbours:
            new_cost = cost
            if neighbour == position:
                new_cost += 2
            else:
                new_cost += manhattan_distance(position, neighbour)

            new_path = path[:]
            new_path.append(teleport(neighbour))

            frontier.append((new_cost, new_path))


def manhattan_distance(a, b):
    return math.fabs(a[0] - b[0]) + math.fabs(a[1] - b[1])


def c(path):
    return len(path)


def circle_checking(path, neighbours, visited):
    return [n for n in neighbours if n not in path]


def multiple_path_pruning(path, neighbours, visited):
    return [n for n in neighbours if n not in visited]


def find(value):
    results = list()

    for y in range(len(world)):
        line = world[y]
        for x in range(len(line)):
            field = line[x]

            if field == value:
                results.append((x, y))

    return results


def find_portals():
    result = {}

    for n in range(10):
        portal = find(str(n))

        if len(portal) == 0:
            continue

        [a, b] = portal

        result[a] = b
        result[b] = a

    return result


def teleport(position):
    if position in portals:
        return portals[position]
    else:
        return position


def get_free_neighbours(x, y):
    direct_neighbours = [(x-1, y), (x, y-1), (x+1, y), (x, y+1)]  # l,o,r,u
    neighbours = [teleport(p) for p in direct_neighbours]  # portals

    return [n for n in neighbours if get_field(n[0], n[1]) != 'x']


def get_field(x, y):
    if y < 0 or y >= len(world) or x < 0 or x >= len(world[0]):
        return ' '
    else:
        return world[y][x]


class Frontier:
    def __init__(self, start):
        self.content = [[start]]

    def is_empty(self):
        return len(self.content) == 0

    def get_next(self):
        return self.content.pop(0)

    def add(self, path, extensions):
        for extension in extensions:
            new_path = path[:]
            new_path.append(extension)
            self.add_path(new_path)

    def add_path(self, path):
        return


class QueueFrontier(Frontier):
    def add_path(self, path):
        self.content.append(path)


class StackFrontier(Frontier):
    def add_path(self, path):
        self.content.insert(0, path)


class PriorityQueue(Frontier):
    def get_next(self):
        path = min(self.content, key=f)
        self.content.remove(path)

        return path

    def add_path(self, path):
        self.content.append(path)


if __name__ == "__main__":
    main()
