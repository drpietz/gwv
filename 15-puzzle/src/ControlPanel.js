import $ from 'jquery';
import EventEmitter from 'events';

export default class ControlPanel extends EventEmitter {
	constructor(game) {
		super();
		this.game = game;

		$('#button-restart').click(() => {
			this.emit('restart');
		});

		$('#button-hint').click(() => {
			console.log("Hint");
			this.emit('hint');
		});

		this.$turnView = $('#turns');
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
}