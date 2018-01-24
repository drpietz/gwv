
const TRANSITION_UP = [0, -1];
const TRANSITION_DOWN = [0, +1];
const TRANSITION_LEFT = [-1, 0];
const TRANSITION_RIGHT = [+1, 0];

const KEY_TRANSITIONS = {
	"ArrowLeft": TRANSITION_LEFT,
	"ArrowRight": TRANSITION_RIGHT,
	"ArrowUp": TRANSITION_UP,
	"ArrowDown": TRANSITION_DOWN
};

const GOAL_STATE = _.chunk(_.range(1, 17), 4);

const board = document.getElementById("board");
const hintButton = document.getElementById("button-hint");
const turnView = document.getElementById("turns");

hintButton.onclick = ev => {
	solve();
};

let boardState = GOAL_STATE;
let turnCount = 0;

function increaseTurnCount() {
	turnView.innerText = ++turnCount;
}

function resetTurnCount() {
	turnView.innerText = 0;
	turnCount = 0;
}

function publishState(state) {
	increaseTurnCount();

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

	boardState = state;
}

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function search(startState) {
	const parentMap = {};

	const frontier = new PriorityQueue(h);
	frontier.add(startState);

	let iterationCounter = 0;
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
			toast.toast("Found solution");
			return path;
		}

		successorStates(state).forEach(function (neighbour) {
			frontier.add(neighbour);
			if (!(neighbour in parentMap))
				parentMap[neighbour] = state;
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
	search(boardState).then(async path => {
		for (const node of path) {
			publishState(node);
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

document.onkeydown = function (ev) {
	const keyTransition = KEY_TRANSITIONS[ev.code];
	if (keyTransition) {
		const nextState = transition(boardState, keyTransition);
		if (nextState)
			publishState(nextState);
	}
};


class Toast {
	constructor() {
		const list = document.createElement("ul");
		list.className = "toast-list";
		document.body.appendChild(list);
		this.list = list;
	}

	toast(message) {
		const messageItem = document.createElement("li");
		messageItem.innerText = message;
		this.list.appendChild(messageItem);
		setTimeout(function () {
			messageItem.className = "show";
		}, 5);
		setTimeout(_.bind(function () {
			messageItem.className += " fade-out";
			setTimeout(_.bind(function () {
				this.list.removeChild(messageItem);
			}, this), 250)
		}, this), 1500);
	}
}


publishState(boardState);
resetTurnCount();

const toast = new Toast();
demoToasts();