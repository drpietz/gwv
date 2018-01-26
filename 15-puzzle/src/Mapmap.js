export default class Mapmap {
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