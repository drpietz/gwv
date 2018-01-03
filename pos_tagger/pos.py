# a = {
#     'the': {
#         '$.': {
#             'nn': 5,
#             'vbd': 2
#         }
#     },
#     None: {
#         'det': {
#             'v': 5,
#             'sub': 2
#         },
#         'v': {
#
#         }
#     }
# }


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
    data = read_data('hdt-1-10000-train.tags')
    tag_map = build_tag_map(data)
    print(tag_map)


def build_tag_map(data):
    tag_map = TagMap()
    prev_tag = '$.'

    for word, tag in data:
        tag_map.add(prev_tag, word, tag)
        tag_map.add(prev_tag, None, tag)

        prev_tag = tag

    return tag_map


def read_data(tags):
    with open(tags, encoding='utf-8') as file:
        return [tuple(line.rstrip('\n').split('\t')) for line in file if line != "\n"]


if __name__ == '__main__':
    main()

