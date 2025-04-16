export class Vertex {
	constructor(id, harbor) {
		this.id = id;
		this.harbor = harbor;
		this.owner = null;
		this.adjacentHexes = [];
		this.connectedVertices = [];
		this.connectedEdges = [];
	}

	isOccupied() {
		return this.owner !== null;
	}

	occupy(ownerId) {
		this.owner = ownerId;
		return true;
	}

	occupiedBy() {
		return this.owner;
	}
}
