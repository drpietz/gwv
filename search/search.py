from enum import Enum
import time
import math
import itertools


world = [[]]
width = 0
height = 0
goals = []
portals = {}
walls = []


def main():
    global world, width, height, goals, portals, walls

    file = open("blatt4_environment_b.txt", "r")
    world = [list(line.rstrip()) for line in file]
    width = len(world[0])
    height = len(world)

    start = find("s")[0]
    goals = find('g')
    portals = find_portals()
    walls = find('x')

    # search(start, QueueFrontier, multiple_path_pruning)  # Breadth first
    # search(start, StackFrontier, circle_checking)  # Depth first
    search(start, PriorityQueue, multiple_path_pruning)  # A*
    # search(start, PriorityQueue, circle_checking, False, True)  # A* all paths


def search(start, frontier_class, pruning_method, view_steps=True, all_paths=False):
    paths_found = 0
    max_nodes_in_frontier = 0
    max_paths_in_frontier = 0
    iteration_count = 1

    frontier = frontier_class(start)
    visited = {start}

    while not frontier.is_empty():
        path = frontier.get_next()
        (x, y) = current = path[-1]

        if current not in goals:
            pruned_neighbours = pruning_method(path, get_free_neighbours(x, y), visited)

            if view_steps:
                output(visited, path, pruned_neighbours)
                time.sleep(0.1)

            frontier.add(path, pruned_neighbours)
            visited.update(pruned_neighbours)

        else:
            paths_found += 1
            output(visited, path)
            print_metrics(iteration_count, len(path), max_paths_in_frontier, max_nodes_in_frontier)

            if all_paths:
                time.sleep(0.1)
            else:
                return

        iteration_count += 1
        max_nodes_in_frontier = max(max_nodes_in_frontier, sum([len(p) for p in frontier]))
        max_paths_in_frontier = max(max_paths_in_frontier, len(frontier))

    print_metrics(iteration_count, '-', max_paths_in_frontier, max_nodes_in_frontier)
    if all_paths:
        print("Paths found: " + str(paths_found))


def print_metrics(iteration_count, path_length, max_paths_in_frontier, max_nodes_in_frontier):
    print("Iterations: " + str(iteration_count))
    print("Path length: " + str(path_length))
    print("Max. paths in frontier: " + str(max_paths_in_frontier))
    print("Max. nodes in frontier: " + str(max_nodes_in_frontier))
    print()


def in_bounds(x, y):
    return y in range(len(world)) and x in range(len(world[0]))


def get_free_neighbours(x, y):
    direct_neighbours = [(x-1, y), (x, y-1), (x+1, y), (x, y+1)]  # l,o,r,u
    neighbours = [teleport(p) for p in direct_neighbours]  # portals

    return [n for n in neighbours if get_field(n[0], n[1]) != 'x']


def get_field(x, y):
    if in_bounds(x, y):
        return world[y][x]
    else:
        return ' '


def find(value):
    return [(x, y) for x, y in itertools.product(range(width), range(height)) if get_field(x, y) == value]


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


def f(path):
    return c(path) + h2(path)


def c(path):
    return len(path)


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


def circle_checking(path, neighbours, visited):
    return [n for n in neighbours if n not in path]


def multiple_path_pruning(path, neighbours, visited):
    return [n for n in neighbours if n not in visited]


class Frontier:
    def __init__(self, start):
        self.content = [[start]]

    def __iter__(self):
        return iter(self.content)

    def __len__(self):
        return len(self.content)

    def is_empty(self):
        return len(self.content) == 0

    def get_next(self):
        return self.content.pop(0)

    def add(self, path, extensions):
        new_paths = []
        for extension in extensions:
            new_paths.append(path[:] + [extension])

        self.add_paths(new_paths)

    def add_paths(self, paths):
        return


class QueueFrontier(Frontier):
    def add_paths(self, paths):
        self.content = self.content + paths


class StackFrontier(Frontier):
    def add_paths(self, paths):
        self.content = paths + self.content


class PriorityQueue(Frontier):
    def get_next(self):
        path = min(self.content, key=f)
        self.content.remove(path)

        return path

    def add_paths(self, paths):
        self.content = self.content + paths


class Color(Enum):
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    GREY = '\033[1;30m'


def output(visited, path, neighbours=None):
    if neighbours is None:
        neighbours = {}

    display = create_output_field()

    set_output_cells(display, walls, '░', Color.GREY)  # ░▒▓█

    set_output_cells(display, visited, '-', Color.BLUE)
    set_output_cells(display, neighbours, '#', Color.RED)
    draw_path(display, path, Color.YELLOW)

    set_output_colors(display, goals, Color.MAGENTA)
    set_output_colors(display, portals, Color.GREEN)

    print_colorized(display)
    print()


def create_output_field():
    return [[(cell, None) for cell in row] for row in world]


def set_output_cells(display, positions, value, color):
    set_output_values(display, positions, value)
    set_output_colors(display, positions, color)


def set_output_colors(display, positions, color):
    for (x, y) in positions:
        if in_bounds(x, y):
            (value, _) = display[y][x]
            display[y][x] = (value, color)


def set_output_values(display, positions, value):
    for (x, y) in positions:
        if in_bounds(x, y):
            _, color = display[y][x]
            display[y][x] = (value, color)


def draw_path(display, path, color):
    symbols = [
        ['╯', '╵', '╰'],
        ['╴', ' ', '╶'],
        ['╮', '╷', '╭']
    ]

    temp_path = [path[0]] + path + [path[-1]]
    for i in range(1, len(temp_path) - 1):
        (c_x, c_y) = current = temp_path[i]
        (p_x, p_y) = previous = current if current in portals else temp_path[i-1]
        (n_x, n_y) = next = current if i == len(temp_path) - 2 else teleport(temp_path[i+1]) if temp_path[i+1] in portals else temp_path[i+1]

        horizontal = p_x + n_x - 2*c_x + 1
        vertical = p_y + n_y - 2*c_y + 1

        if horizontal not in range(3) or vertical not in range(3):
            set_output_cells(display, [current], '┼', color)

        elif horizontal == 1 and vertical == 1:
            if p_x != n_x:
                set_output_cells(display, [current], '─', color)
            elif p_y != n_y:
                set_output_cells(display, [current], '│', color)
            else:
                set_output_cells(display, [current], '┼', color)

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


if __name__ == "__main__":
    main()
