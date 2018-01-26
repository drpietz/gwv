import $ from 'jquery';
import _ from 'lodash';
import Board from './Board';
import {TRANSITION_UP, TRANSITION_DOWN, TRANSITION_LEFT, TRANSITION_RIGHT} from "./transitions";
import GameState from "./GameState";
import Game from "./Game";
import ControlPanel from "./ControlPanel";
import State from "./State";


const KEY_TRANSITIONS = {
	"ArrowLeft": TRANSITION_LEFT,
	"ArrowRight": TRANSITION_RIGHT,
	"ArrowUp": TRANSITION_UP,
	"ArrowDown": TRANSITION_DOWN
};

const game = new Game(new GameState(_.chunk(_.range(1, 17), 4)));
const board = new Board(game.getState());
const controlPanel = new ControlPanel(game);


// TODO: Replace & remove
class Mapmap {
	constructor() {
		this.keys = [];
		this.values = [];
	}

	put(key, value) {
		this.keys.push(key);
		this.values.push(value);
	}

	get(key) {
		for (let i = 0; i < this.keys.length; i++) {
			if (this.keys[i].equals(key)) {
				return this.values[i];
			}
		}

		console.log("Key not found", key);
		return null;
	}
}


function updateBoard() {
	console.log("Update board according to game state");
	board.setState(game.getState());
}

game.onChange(updateBoard);

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function search(startState) {
	const parentMap = new Mapmap();

	const frontier = new PriorityQueue(h);
	frontier.add(startState);

	let iterationCounter = 0;
	while (!frontier.isEmpty()) {
		console.log("Search iteration with frontier size " + frontier.length());
		const state = frontier.pop();
		console.log("Search iteration with state", state);

		if (state.isGoal()) {
			const path = [state];

			let backtrackingCounter = 0;
			console.log('backtracking', parentMap);
			while (!(_.last(path).equals(startState))) {
				console.log("Backtracking path node " + path.length);
				path.push(parentMap.get(_.last(path)));

				if (backtrackingCounter++ >= 1000) {
					console.log("Backtracking stopped");
					return [];
				}
			}
			_.reverse(path);

			console.log("Reconstructed path", path);
			toast.toast("Found solution");
			return path;
		}

		state.getSuccessorStates().forEach(function (neighbour) {
			frontier.add(neighbour);
			parentMap.put(neighbour, state);
		});

		iterationCounter += 1;
		if (iterationCounter > 2000) {
			toast.toast("Stopped after 2000 iterations");
			break;
		}
	}

	toast.toast("No solution found");
	return [];
}

async function solve() {
	search(board.getState()).then(async path => {
		console.log(path);

		for (const node of path) {
			game.setState(node);
			await sleep(300);
		}
	});
}

class PriorityQueue {
	constructor(heuristic) {
		this.queue = [];
		this.heuristic = heuristic;
	}

	add(state) {
		const value = this.heuristic(state);
		const searchState = {state, value};
		const insertIndex = _.sortedIndexBy(this.queue, searchState, searchState => searchState.value);
		this.queue.splice(insertIndex, 0, searchState);
	}

	pop() {
		const searchState = this.queue.shift();
		return searchState.state;
	}

	length() {
		return this.queue.length;
	}

	isEmpty() {
		return this.length() === 0;
	}
}

function h(state) {
	let result = 0;

	for (let value = 1; value <= 16; value++) {
		const [cx, cy] = state.find(value);
		const [tx, ty] = State.targetPosition(value);

		result += Math.abs(cx - tx) + Math.abs(cy - ty);
	}

	return result;
}

$(document).keydown(ev => {
	const keyTransition = KEY_TRANSITIONS[ev.key];
	if (keyTransition) {
		const nextState = game.getState().afterTransition(keyTransition);
		if (nextState)
			game.setState(nextState);
	}
});


class Toast {
	constructor() {
		const $list = $('<ul>', {'class': 'toast-list'});
		$('body').append($list);
		this.$list = $list;
	}

	toast(message) {
		const $messageItem = $('<li>');
		$messageItem.text(message);
		this.$list.append($messageItem);

		setTimeout(function () {
			$messageItem.addClass('show');
		}, 5);
		setTimeout(_.bind(function () {
			$messageItem.addClass('fade-out');
			setTimeout(_.bind(function () {
				$messageItem.remove();
			}, this), 250)
		}, this), 1500);
	}
}

const toast = new Toast();

controlPanel.onHint(() => {
	solve();
});
