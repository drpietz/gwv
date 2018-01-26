import $ from 'jquery';
import _ from 'lodash';
import Board from './Board';
import {TRANSITION_UP, TRANSITION_DOWN, TRANSITION_LEFT, TRANSITION_RIGHT} from "./transitions";
import GameState from "./GameState";
import Game from "./Game";
import ControlPanel from "./ControlPanel";
import State from "./State";


const KEY_TRANSITIONS = {
	"ArrowLeft": TRANSITION_RIGHT, // TRANSITION_LEFT,
	"ArrowRight": TRANSITION_LEFT, // TRANSITION_RIGHT,
	"ArrowUp": TRANSITION_DOWN, // TRANSITION_UP,
	"ArrowDown": TRANSITION_UP // TRANSITION_DOWN
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

	has(key) {
		for (let k of this.keys) {
			if (k.equals(key)) {
				return true;
			}
		}

		return false;
	}
}


class SearchGraph {
	constructor(root) {
		this.nodeMap = new Mapmap();
		this.addChild(root, null);
	}

	addChild(child, parent) {
		console.log("Add node" , child);
		const parentNode = this.nodeMap.get(parent);
		const childNode = new SearchNode(child, parentNode);
		this.nodeMap.put(child, childNode);
	}

	has(value) {
		return this.nodeMap.has(value);
	}

	getPath(value) {
		let node = this.nodeMap.get(value);
		const path = [node.value];

		while (node.parent !== null) {
			node = node.parent;
			path.push(node.value);
		}

		_.reverse(path);
		return path;
	}
}

class SearchNode {
	constructor(value, parent) {
		this.value = value;
		this.parent = parent;
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
	const graph = new SearchGraph(startState);

	const frontier = new PriorityQueue(h);
	frontier.add(startState);

	let iterationCounter = 0;
	while (!frontier.isEmpty()) {
		console.log("Search iteration with frontier size " + frontier.length());
		const state = frontier.pop();
		console.log("Search iteration with state", state);

		if (state.isGoal()) {
			return graph.getPath(state);
		}

		state.getSuccessorStates().forEach(function (neighbour) {
			if (!graph.has(neighbour)) {
				frontier.add(neighbour);
				graph.addChild(neighbour, state);
			}
		});

		iterationCounter += 1;
		if (iterationCounter > 5000) {
			console.log("Stopped search after reaching iteration limit");
			break;
		}
	}

	return null;
}

async function solve() {
	search(board.getState()).then(async path => {
		if (path === null) {
			toast.toast("No solution found");
		} else {
			toast.toast("Found path of length " + path.length)
			console.log("Solution found", path);
		}

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

	for (let value = 1; value < 16; value++) {
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

	toast(message, duration=1500) {
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
		}, this), duration);
	}
}

const toast = new Toast();

controlPanel.onHint(() => {
	solve();
});




async function runTests() {
	test("Test A", [
		[ 1,  2,  3,  4],
		[ 5,  6,  7,  8],
		[ 9, 10, 11, 12],
		[13, 14, 15, 16]
	]);

	test("Test B", [
		[ 1,  2,  3,  4],
		[ 5, 10, 16,  7],
		[ 9, 11,  6,  8],
		[13, 14, 15, 12]
	]);

	test("Test C", [
		[ 1,  2,  3,  4],
		[ 5, 11, 10,  7],
		[ 9, 16,  6,  8],
		[13, 14, 15, 12]
	]);

}

async function test(name, field) {
	const state = new GameState(field);

	search(state).then(result => {
		if (result === null) {
			toast.toast(name + " failed", 5000);
		} else {
			toast.toast(name + " succeeded with path length " + result.length, 5000);
		}
	});
}

runTests();
