import search from "../src/search";
import GameState from "../src/GameState";

it('should find a solution', isSolvable([
	[ 1,  2,  3,  4],
	[ 5,  6,  7,  8],
	[ 9, 10, 11, 12],
	[13, 14, 15, 16]
]));

async function isSolvable(field) {
	const state = new GameState(field);
	search(state).then(should.exists);
}