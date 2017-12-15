# word_map = {
#     'abc': {
#         'Ben': 3,
#     },
#     'Ben': {
#         'Flasche': 1
#     },
#     'Baum': {
#
#     }
# }
import random


class BigramMap:
    def __init__(self):
        self.map = {}

    def count(self, previous, following):
        if previous not in self.map:
            self.map[previous] = {}

        a = self.map[previous]

        if following in a:
            a[following] += 1
        else:
            a[following] = 1

    def predict(self, previous):
        # TODO: Missing words
        total = sum(self.map[previous].values())

        random_num = random.randint(1, total)
        for key, value in self.map[previous].items():
            if random_num <= value:
                return key
            else:
                random_num -= value

    def __contains__(self, item):
        return item in self.map


def main():
    with open('ggcc-one-word-per-line.txt', encoding='utf-8') as f:
        word_map = BigramMap()
        last = f.readline()

        i = 0
        for current in f:
            current = current.rstrip()
            i += 1
            if i == 1000:
                break

            word_map.count(last, current)
            last = current

        generated = ['vielen']
        for i in range(100):
            next = word_map.predict(generated[-1])
            generated.append(next)

        print(' '.join(generated))


if __name__ == '__main__':
    main()
