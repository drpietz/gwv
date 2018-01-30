import $ from 'jquery';
import EventEmitter from 'events';

export default class ControlPanel extends EventEmitter {
	constructor(game) {
		super();
		this.game = game;

		$('#button-restart').click(ev => {
			ev.stopPropagation();
			this.emit('restart');
		});

		$('#button-hint').click(ev => {
			ev.stopPropagation();
			this.emit('hint');
		});

		this.$turnView = $('#turns');

		this.$turnView.click(ev => {
			ev.stopPropagation();
			this.emit('input');
		});

		console.log("Set turn view counter", this.$turnView);
		this.updateTurnViewCounter();
		game.onChange(() => this.updateTurnViewCounter());
	}

	updateTurnViewCounter() {
		console.log("Update turn view counter", this.$turnView);
		this.$turnView.text(this.game.getState().getTurnCount());
	}

	onRestart(handler) {
		this.on('restart', handler);
	}

	onHint(handler) {
		this.on('hint', handler);
	}

	onInput(handler) {
		this.on('input', handler);
	}
}