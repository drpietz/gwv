import FieldGenerator from './FieldGenerator';
import EventEmitter from 'events';
import search from "./search";
import toast from "./Toast";
import GameState from "./GameState";

export default class Game extends EventEmitter {
	constructor(state) {
		super();
		this.state = state;
		this.generator = new FieldGenerator();
	}

	async restart() {
		this.setState(new GameState(this.generator.get()));
	}

	hint() {
		this.solve();
	}

	transition(transition) {
		const nextState = this.getState().afterTransition(transition);
		if (nextState)
			this.setState(nextState);
	}

	async solve() {
		search(this.getState()).then(async path => {
			if (path === null) {
				toast.toast("No solution found");
			} else {
				toast.toast("Found path of length " + path.length);

				return this.followPath(path);
			}
		});
	}

	async followPath(path) {
		for (const state of path) {
			await this.setState(state);
		}
	}

	async setState(state) {
		this.state = state;
		this.emit('change');

		return new Promise(resolve => setTimeout(resolve, 300));
	}

	getState() {
		return this.state;
	}

	onChange(handler) {
		this.on('change', handler);
	}
}
