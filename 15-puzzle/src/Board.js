import $ from 'jquery';

export default class Board {
	constructor(state) {
		this.$component = $('#board');
		this.setState(state);
	}

	getState() {
		return this.state;
	}

	setState(state) {
		console.log("Update board");

		this.$component.empty();

		state.getState().forEach(row => {
			row.forEach(cellValue => {
				const $cell = $('<div>', {'class': 'cell'});

				if (cellValue === 16) {
					$cell.addClass('empty')
				} else {
					$cell.text(cellValue);
				}

				this.$component.append($cell);
			});
		});

		this.state = state;
	}
};

