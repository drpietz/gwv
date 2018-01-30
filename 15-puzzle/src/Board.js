import $ from 'jquery';
import _ from 'lodash';
import State from "./State";

export default class Board {
	constructor(state) {
		this.$component = $('#board');
		this.$frame = $('#frame');
		this.cells = [];
		this.initializeCells();
		this.setState(state);

		this.$component.click(ev => {
			ev.stopPropagation();
			this.$frame.toggle();
		});
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

			$cell.click(ev => {
				ev.stopPropagation();
				$cell.toggleClass('hidden');
				return true;
			});
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

