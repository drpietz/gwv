export default class PriorityQueue {
	constructor(heuristic) {
		this.queue = [];
		this.heuristic = heuristic;
	}

	add(state) {
		const value = this.heuristic(state) + state.getTurnCount();
		const searchState = {state, value};
		const insertIndex = _.sortedIndexBy(this.queue, searchState, searchState => searchState.value);
		this.queue.splice(insertIndex, 0, searchState);
	}

	pop() {
		const searchState = this.queue.shift();
		return searchState.state;
	}

	length() {
		return this.queue.length;
	}

	isEmpty() {
		return this.length() === 0;
	}
}