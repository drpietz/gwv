import Mapmap from "./Mapmap";


export default class SearchGraph {
	constructor(root) {
		this.nodeMap = new Mapmap();
		this.nodeMap.put(root, new SearchNode(root, null));
	}

	addChild(child, parent) {
		// console.log("Add node" , child);
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
