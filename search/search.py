from enum import Enum
import time

import math


class Color(Enum):
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    GREY = '\033[37m'


world = [[]]
goals = []
portals = {}


def main():
    global world, goals, portals

    file = open("blatt4_environment_b.txt", "r")
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

    display = create_output_field()

    set_output_cells(display, visited, '-', Color.BLUE)
    set_output_cells(display, neighbours, '#', Color.RED)
    draw_path(display, path, Color.YELLOW)

    set_output_colors(display, goals, Color.MAGENTA)
    set_output_colors(display, portals, Color.CYAN)

    print_colorized(display)


def create_output_field():
    return [[(cell, None) for cell in row] for row in world]


def set_output_cells(display, positions, value, color):
    set_output_values(display, positions, value)
    set_output_colors(display, positions, color)


def set_output_colors(display, positions, color):
    for (x, y) in positions:
        (value, _) = display[y][x]
        display[y][x] = (value, color)


def set_output_values(display, positions, value):
    height = len(display)
    width = len(display[1])
    for (x, y) in positions:
        if x in range(width) and y in range(height):
            _, color = display[y][x]
            display[y][x] = (value, color)


def draw_path(display, path, color):
    if len(path) == 1:
        set_output_cells(display, path, '┼', color)
        return

    symbols = [
        ['╯', '╵', '╰'],
        ['╴', ' ', '╶'],
        ['╮', '╷', '╭']
    ]

    temp_path = [path[0]] + path + [path[-1]]
    for i in range(1, len(temp_path) - 1):
        (p_x, p_y) = previous = temp_path[i-1]
        (c_x, c_y) = current = temp_path[i]
        (n_x, n_y) = next = temp_path[i+1]

        horizontal = p_x + n_x - 2*c_x + 1
        vertical = p_y + n_y - 2*c_y + 1

        if horizontal == 1 and vertical == 1:
            if p_x != n_x:
                set_output_cells(display, [current], '─', color)
            else:
                set_output_cells(display, [current], '│', color)

        else:
            set_output_cells(display, [current], symbols[vertical][horizontal], color)


def print_colorized(display):
    for row in display:
        for (value, color) in row:
            if color is None:
                print(value, end='')
            else:
                print(color.value + value + '\033[0m', end='')

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
