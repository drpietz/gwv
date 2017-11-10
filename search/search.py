import copy
import time


def main():
    f = open("blatt3_environment.txt", "r")
    world = [list(line.rstrip()) for line in f]
    frontier = [find(world, "s")]

    search(world, frontier)


def output(world, frontier):

    display = copy.deepcopy(world)

    for path in frontier:
        for (x, y) in path:
            display[y][x] = "-"

    next_path = frontier[0]
    (x, y) = next_path[len(next_path) - 1]
    display[y][x] = 'F'

    for row in display:
        print("".join(row))

    print(len(frontier))


def prune(frontier, neighbours):
    result = []
    for neighbour in neighbours:
        if not in_frontier(neighbour, frontier):
            result.append(neighbour)

    return result


def in_frontier(position, frontier):
    for path in frontier:
        if position in path:
            return True

    return False



def search(world, frontier):
    while len(frontier) > 0:
        time.sleep(0.5)

        output(world, frontier)

        path = frontier.pop(0)
        (x, y) = current = path[len(path) - 1]
        goals = find(world, 'g')

        if current in goals:
            print("Gefunden")
            return path

        else:
            free_neighbours = get_free_neighbours(world, x, y)
            pruned_neighbours = prune(frontier, free_neighbours)

            for n in pruned_neighbours:
                new_path = path[:]
                new_path.append(n)
                frontier.append(new_path)


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
    a = [(x-1, y), (x, y-1), (x+1, y), (x, y+1)]  # l,o,r,u
    return [n for n in a if get_field(world, n[0], n[1]) != 'x']


def get_field(world, x, y):
    if y < 0 or y >= len(world) or x < 0 or x >= len(world[0]):
        return ' '
    else:
        return world[y][x]


if __name__ == "__main__":
    main()
