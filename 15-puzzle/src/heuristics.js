import State from "./State";

export const manhattan = state => {
	let result = 0;

	for (let value = 1; value <= 16; value++) {
		const [cx, cy] = state.find(value);
		const [tx, ty] = State.targetPosition(value);

		result += Math.abs(cx - tx) + Math.abs(cy - ty);
	}

	return result;
};

export const manhattan_without_empty = state => {
	let result = 0;

	for (let value = 1; value < 16; value++) {
		const [cx, cy] = state.find(value);
		const [tx, ty] = State.targetPosition(value);

		result += Math.abs(cx - tx) + Math.abs(cy - ty);
	}

	return result;
};
