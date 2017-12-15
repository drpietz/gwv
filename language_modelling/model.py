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


class Window:
    def __init__(self, size):
        self.content = []
        self.size = size

    def push(self, item):
        if self.size != 0:
            self.content.append(item)
            self.content = self.content[-self.size:]

    def clear(self):
        self.content = []

    def get_content(self):
        return self.content

    def is_full(self):
        return len(self.content) == self.size


class MultigramPredictor:
    def __init__(self, n):
        self.predictors = [NgramPredictor(i) for i in range(n, 0, -1)]

    def read(self, item):
        for predictor in self.predictors:
            predictor.read(item)

    def clear(self):
        for predictor in self.predictors:
            predictor.clear()

    def train(self, item):
        for predictor in self.predictors:
            predictor.train(item)

    def predict(self):
        for predictor in self.predictors:
            if predictor.has_prediction():
                return predictor.predict()


class NgramPredictor:
    def __init__(self, n):
        self.map = {}
        self.window = Window(n - 1)

    def __contains__(self, item):
        return item in self.map

    def read(self, item):
        self.window.push(item)

    def clear(self):
        self.window.clear()

    def train(self, item):
        if self.window.is_full():
            previous = tuple(self.window.get_content())
            self.increment(previous, item)

    def increment(self, previous, item):
        if previous not in self.map:
            self.map[previous] = {}

        a = self.map[previous]

        if item in a:
            a[item] += 1
        else:
            a[item] = 1

    def predict(self):
        previous = tuple(self.window.get_content())

        prediction = random.choices(
            population=list(self.map[previous].keys()),
            weights=list(self.map[previous].values())
        )[0]

        return prediction, len(self.map[previous]) == 1

    def has_prediction(self):
        previous = tuple(self.window.get_content())
        return previous in self.map


def main():
    predictor = MultigramPredictor(3)

    with open('ggcc-one-word-per-line.txt', encoding='utf-8') as f:
        predictor = train(predictor, (line.rstrip() for line in f))

    while True:
        initial_str = input("> ")
        initial = [] if not initial_str else initial_str.split(' ')

        generated = generate(predictor, initial=initial)
        print(' '.join(generated))
        print()


def train(predictor, dataset):
    for item in dataset:
        predictor.train(item)
        predictor.read(item)

    predictor.clear()
    return predictor


def generate(predictor, initial=[], length=20):
    for item in initial:
        predictor.read(item)

    result = initial[:]

    for i in range(length - len(initial)):
        prediction, highlighted = predictor.predict()
        predictor.read(prediction)

        result.append('\033[31m' + prediction + '\033[0m' if highlighted else prediction)

    predictor.clear()

    return result


if __name__ == '__main__':
    main()
