import {working, broken} from "./randomFields";

export default class FieldGenerator {
	constructor() {
		this.queue = _.sampleSize(working, 3);
		this.queue.push(_.sample(broken));
	}

	get() {
		return this.queue.shift();
	}
}
