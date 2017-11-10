import copy
import time


def main():
    f = open("blatt3_environment.txt", "r")
    world = [list(line.rstrip()) for line in f]
    start = find(world, "s")[0]

    search(world, start)


def output(world, visited, path, neighbours=None):
    if neighbours is None:
        neighbours = {}

    display = copy.deepcopy(world)

    put(display, '-', visited)
    put(display, '+', path)
    put(display, '#', neighbours)

    print_colorized(display)


def put(matrix, value, positions):
    for (x, y) in positions:
        matrix[y][x] = value


def print_colorized(matrix):
    colors = {
        '-': '\033[34m',
        '+': '\033[33m',
        '#': '\033[32m',
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


def search(world, start):
    frontier = [[start]]
    visited = {start}

    while len(frontier) > 0:
        time.sleep(0.25)

        path = frontier.pop(0)
        (x, y) = current = path[len(path) - 1]
        goals = find(world, 'g')

        if current in goals:
            output(world, visited, path)
            return path

        else:
            pruned_neighbours = get_free_neighbours(world, x, y) - visited

            output(world, visited, path, pruned_neighbours)

            for n in pruned_neighbours:
                new_path = path[:]
                new_path.append(n)
                frontier.append(new_path)

            visited |= pruned_neighbours


def find(world, value):
    results = list()

    for y in range(len(world)):
        line = world[y]
        for x in range(len(line)):
            field = line[x]

            if field == value:
                results.append((x, y))

    return results


def get_free_neighbours(world, x, y):
    a = {(x-1, y), (x, y-1), (x+1, y), (x, y+1)}  # l,o,r,u
    return {n for n in a if get_field(world, n[0], n[1]) != 'x'}


def get_field(world, x, y):
    if y < 0 or y >= len(world) or x < 0 or x >= len(world[0]):
        return ' '
    else:
        return world[y][x]


if __name__ == "__main__":
    main()
