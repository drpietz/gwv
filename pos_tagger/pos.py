# Die Site Voteauction.com bietet Wählern in den USA an , ihre Stimme im Internet an den Meistbietenden zu verkaufen .


# a = {
#     '$.': {
#         'the': {
#             'nn': 5,
#             'vbd': 2
#         }
#     },
#     'det': {
#         None: {
#             'v': 5,
#             'sub': 2
#         }
#     }
# }
import time


class TagMap:
    def __init__(self):
        self.map = {}

    def predict(self, prev_tag, word):
        if word not in self.map[prev_tag]:
            counts = self.map[prev_tag][None]
        else:
            counts = self.map[prev_tag][word]

        return TagMap.normalize_probabilities(counts)

    @staticmethod
    def normalize_probabilities(counts):
        total = sum(counts.values())
        return {tag: count/total for tag, count in counts.items()}

    def add(self, prev_tag, word, tag):
        if prev_tag not in self.map:
            self.map[prev_tag] = {}

        if word not in self.map[prev_tag]:
            self.map[prev_tag][word] = {}

        if tag not in self.map[prev_tag][word]:
            self.map[prev_tag][word][tag] = 0

        self.map[prev_tag][word][tag] += 1


def main():
    train_inputs, train_targets = read_data('hdt-1-10000-train.tags')
    tag_map = build_tag_map(train_inputs, train_targets)

    test_inputs, test_targets = read_data('hdt-10001-12000-test.tags')
    model_score = score(tag_map, test_inputs[:50], test_targets[:50])
    print('Model Accuracy: {:.01f}%\n\n'.format(model_score*100))

    while True:
        inputs = get_user_input()
        predictions, probability = predict(tag_map, inputs)
        print_prediction(inputs, predictions, probability)


def get_user_input():
    user_input = input('> ')
    return user_input.split(' ')


def score(tag_map, inputs, targets):
    start = time.time()

    predictions, _ = predict(tag_map, inputs)

    correct = 0
    for prediction, target in zip(predictions, targets):
        if prediction == target:
            correct += 1

    print("Scoring took {:.03f}s".format(time.time() - start))

    return correct / len(inputs)


def print_prediction(words, predictions, probability):
    print('{:.01f}%'.format(probability*100), end=" ")
    for word, tag in zip(words, predictions):
        print(word + "\\" + tag, end=" ")

    print()
    print()


def build_tag_map(inputs, targets):
    tag_map = TagMap()
    prev_tag = '$.'

    for word, tag in zip(inputs, targets):
        tag_map.add(prev_tag, word, tag)
        tag_map.add(prev_tag, None, tag)

        prev_tag = tag

    return tag_map


def predict(tag_map, inputs):
    frontier = [(1, ['$.'], inputs)]
    # [
    #   (0.3, ["ITJ", "APPO", "APPR"], ["bietet", "Wählern", "in", "den"]),
    #   ...
    # ]

    best_tag_probabilites = [{} for _ in range(len(inputs))]

    best_probability = 0
    best_tags = []

    while len(frontier) > 0:
        previous_probability, previous_tags, rest = frontier.pop()

        if previous_probability <= best_probability:
            continue

        if len(rest) == 0 and previous_probability > best_probability:
            best_probability = previous_probability
            best_tags = previous_tags
            continue

        index = len(previous_tags) - 1
        prev_tag = previous_tags[-1]
        current_word = rest[0]

        word_predictions = tag_map.predict(prev_tag, current_word)

        for predicted_tag, predicted_tag_probability in sorted(word_predictions.items(), key=lambda p: p[1]):
            probability = previous_probability * predicted_tag_probability

            if best_tag_probabilites[index].get(predicted_tag, 0) < probability:
                best_tag_probabilites[index][predicted_tag] = probability

                tags = previous_tags[:]
                tags.append(predicted_tag)

                frontier.append((probability, tags, rest[1:]))

    return best_tags[1:], best_probability


def read_data(tags):
    with open(tags, encoding='utf-8') as file:
        lines = [tuple(line.rstrip('\n').split('\t')) for line in file if line != "\n"]

    words = [word for word, _ in lines]
    tags = [tag for _, tag in lines]

    return words, tags


if __name__ == '__main__':
    main()

