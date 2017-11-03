import copy


def main():
    f = open("blatt3_environment.txt", "r")
    world = [list(line.rstrip()) for line in f]
    frontier = [find(world, "s")]

    output(world, frontier)


def output(world, frontier):

    display = copy.deepcopy(world)

    for path in frontier:
        for (x, y) in path:
            display[y][x] = "-"

    for row in display:
        print("".join(row))


def find(world, value):
    results = list()

    for y in range(len(world)):
        line = world[y]
        for x in range(len(line)):
            field = line[x]

            if field == value:
                results.append((x, y))

    return results


if __name__ == "__main__":
    main()
