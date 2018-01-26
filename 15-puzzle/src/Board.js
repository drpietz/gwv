import $ from 'jquery';
import _ from 'lodash';
import State from "./State";

export default class Board {
	constructor(state) {
		this.$component = $('#board');
		this.cells = [];
		this.initializeCells();
		this.setState(state);
	}

	initializeCells() {
		for (let i = 1; i <= 16; i++) {
			const $cell = $('<div>', {'class': 'cell'});

			if (i === 16) {
				$cell.addClass('empty')
			} else {
				$cell.text(i);
			}

			this.cells.push($cell);
			this.$component.append($cell);
		}
	}

	setState(state) {
		const fstate = _.flatten(state.getState());
		for (let i = 0; i < fstate.length; i++) {
			const targetValue = fstate[i];
			const [tx, ty] = State.targetPosition(i+1);
			this.cells[targetValue-1].css({top: (ty * 8 + 0.5) + 'rem', left: (tx * 8 + 0.5) + 'rem'});
		}
	}
};

