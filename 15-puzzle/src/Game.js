import EventEmitter from 'events';

export default class Game extends EventEmitter {
	constructor(state) {
		super();
		this.state = state;
	}

	restart() {
		console.log('Restart requested');
	}

	hint() {
		console.log('Hint requested');
	}

	solve() {
		console.log('Solution requested');
	}

	setState(state) {
		this.state = state;
		this.emit('change');
	}

	getState() {
		return this.state;
	}

	onChange(handler) {
		this.on('change', handler);
	}
}
