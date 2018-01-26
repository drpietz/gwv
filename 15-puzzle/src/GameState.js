import State from './State';

export default class GameState extends State {
	constructor(state, turnCount=0) {
		super(state);
		this.turnCount = turnCount;
	}

	getTurnCount() {
		return this.turnCount;
	}

	increaseTurnCount() {
		this.turnCount += 1;
	}

	swap([ax, ay], [bx, by]) {
		this.increaseTurnCount();
		return super.swap([ax, ay], [bx, by]);
	}

	clone() {
		return new GameState(_.cloneDeep(this.state), this.turnCount);
	}
}
