import PriorityQueue from './PriorityQueue';
import SearchGraph from "./SearchGraph";
import {manhattan_without_empty} from "./heuristics";


export default async function search(startState, heuristic=manhattan_without_empty) {
	const frontier = new PriorityQueue(heuristic);
	const graph = new SearchGraph(startState);

	frontier.add(startState);

	let iterationCounter = 0;
	while (!frontier.isEmpty()) {
		const state = frontier.pop();

		// console.log("Search iteration", iterationCounter, state);

		if (state.isGoal()) {
			console.log("Found solution", iterationCounter);
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