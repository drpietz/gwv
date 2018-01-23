
const TRANSITION_UP = [0, -1];
const TRANSITION_DOWN = [0, +1];
const TRANSITION_LEFT = [-1, 0];
const TRANSITION_RIGHT = [+1, 0];

const GOAL_STATE = _.chunk(_.range(1, 17), 4);

const board = document.getElementById("board");
const hintButton = document.getElementById("button-hint");
const turnView = document.getElementById("turns");

hintButton.onclick = ev => {
	solve();
};

var state = [
	[ 1,  2,  3,  4],
	[ 5,  6,  7,  8],
	[ 9, 16, 11, 12],
	[13, 10, 14, 15]
];


function showState(state) {
	board.innerHTML = "";

	state.forEach(function (row) {
		row.forEach(function (cellValue) {
			const cell = document.createElement("div");

			if (cellValue === 16) {
				cell.className = "cell empty";
			} else {
				cell.className = "cell";
				cell.innerText = cellValue;
			}

			board.appendChild(cell);
		});
	});
}

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function search(startState) {
	const parentMap = {};

	const frontier = new PriorityQueue(h);
	frontier.add(startState);

	while (!frontier.isEmpty()) {
		console.log("Search iteration with frontier size " + frontier.length());
		const state = frontier.pop();
		console.log("Search iteration with state", state);

		if (isGoal(state)) {
			const path = [state];

			while (!_.isEqual(_.last(path), startState)) {
				console.log("Backtracking path node " + path.length);
				path.push(parentMap[_.last(path)]);
			}
			_.reverse(path);

			console.log("Reconstructed path", path);
			return path;
		}

		successorStates(state).forEach(function (neighbour) {
			frontier.add(neighbour);
			if (!(neighbour in parentMap))
				parentMap[neighbour] = state;
		});
	}

	console.log("No solution found");
	return [];
}

async function solve() {
	search(state).then(async path => {
		for (const node of path) {
			showState(node);
			await sleep(300);
		}
	});
}

function isGoal(state) {
	return _.isEqual(state, GOAL_STATE);
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
		turnView.text = searchState.value;
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
		const [cx, cy] = find(state, value);
		const [tx, ty] = targetPosition(value);

		result += Math.abs(cx - tx) + Math.abs(cy - ty);
	}

	return result;
}

function find(state, value) {
	for (let y = 0; y < 4; y++) {
		const idx = state[y].indexOf(value);
		if (idx !== -1) {
			return [idx, y]
		}
	}
}

function targetPosition(value) {
	const x = (value - 1) % 4;
	const y = Math.floor((value - 1) / 4);
	return [x, y];
}

function successorStates(state) {
	return _.compact([
		transition(state, TRANSITION_UP),
		transition(state, TRANSITION_DOWN),
		transition(state, TRANSITION_LEFT),
		transition(state, TRANSITION_RIGHT),
	]);
}

function transition(state, [dx, dy]) {
	const [cx, cy] = find(state, 16);
	const [nx, ny] = [cx+dx, cy+dy];

	if (inField([nx, ny])) {
		return swap(state, [cx, cy], [nx, ny]);
	} else {
		return null;
	}
}

function swap(state, [ax, ay], [bx, by]) {
	const copy = _.cloneDeep(state);
	copy[ay][ax] = state[by][bx];
	copy[by][bx] = state[ay][ax];
	return copy;
}

function inField([x, y]) {
	return (x >= 0 && x <= 3) && (y >= 0 && y <= 3);
}

showState(state);