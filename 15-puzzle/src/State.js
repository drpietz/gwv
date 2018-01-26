import _ from 'lodash';
import { TRANSITION_UP, TRANSITION_DOWN, TRANSITION_LEFT, TRANSITION_RIGHT } from "./transitions";

const GOAL_FIELD = _.chunk(_.range(1, 17), 4);


export default class State {
	constructor(state) {
		this.state = state;
	}

	getState() {
		return this.state;
	}

	isGoal() {
		return _.isEqual(this.state, GOAL_FIELD);
	}

	getSuccessorStates() {
		return _.compact([
			this.afterTransition(TRANSITION_UP),
			this.afterTransition(TRANSITION_DOWN),
			this.afterTransition(TRANSITION_LEFT),
			this.afterTransition(TRANSITION_RIGHT),
		]);
	}

	afterTransition([dx, dy]) {
		const [cx, cy] = this.find(16);
		const [nx, ny] = [cx+dx, cy+dy];

		if (State.inField([nx, ny])) {
			return this.afterSwap([cx, cy], [nx, ny]);
		} else {
			return null;
		}
	}

	static inField([x, y]) {
		return (x >= 0 && x <= 3) && (y >= 0 && y <= 3);
	}

	find(value) {
		for (let y = 0; y < 4; y++) {
			const idx = this.state[y].indexOf(value);
			if (idx !== -1) {
				return [idx, y]
			}
		}
	}

	afterSwap(a, b) {
		const copy = this.clone();
		copy.swap(a, b);
		return copy;
	}

	swap([ax, ay], [bx, by]) {
		const tmp = this.state[ay][ax];
		this.state[ay][ax] = this.state[by][bx];
		this.state[by][bx] = tmp;
	}

	clone() {
		return new State(_.cloneDeep(this.state));
	}

	equals(that) {
		return _.isEqual(this.state, that.state);
	}

	static targetPosition(value) {
		const x = (value - 1) % 4;
		const y = Math.floor((value - 1) / 4);
		return [x, y];
	}
}
