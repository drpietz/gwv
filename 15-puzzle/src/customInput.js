export default async function getInput(state) {
	return new Promise((resolve, reject) => {
		const input = prompt("Game state", JSON.stringify(state));
		if (input != null) {
			resolve(JSON.parse(input));
		} else {
			reject()
		}
	})
}
