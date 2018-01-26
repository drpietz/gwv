import $ from 'jquery';
import EventEmitter from 'events';


import {TRANSITION_DOWN, TRANSITION_LEFT, TRANSITION_RIGHT, TRANSITION_UP} from "./transitions";


const KEY_TRANSITIONS = {
	"ArrowLeft": TRANSITION_RIGHT, // TRANSITION_LEFT,
	"ArrowRight": TRANSITION_LEFT, // TRANSITION_RIGHT,
	"ArrowUp": TRANSITION_DOWN, // TRANSITION_UP,
	"ArrowDown": TRANSITION_UP // TRANSITION_DOWN
};

export default class GameInputListener extends EventEmitter {
	constructor() {
		super();

		$(document).keydown(ev => {
			const keyTransition = KEY_TRANSITIONS[ev.key];
			if (keyTransition) {
				this.emit('transition', keyTransition);
			}
		})
	}

	onTransition(handler) {
		this.on('transition', handler);
	}
}
