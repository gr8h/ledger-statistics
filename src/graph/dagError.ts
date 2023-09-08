class DAGError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = DAGError.name;
  }
}

export class InvalidInputError extends DAGError {
  constructor(message: string = "Invalid input provided.") {
    super(message);
    this.name = InvalidInputError.name;
  }
}

export class NodeNotFoundError extends DAGError {
  constructor(node: number) {
    super(`Node with id [${node}] not found in the DAG.`);
    this.name = NodeNotFoundError.name;
  }
}

export class CycleError extends DAGError {
  constructor(source: number, destination: number) {
    super(
      `Adding an edge from node [${source}] to node [${destination}] would create a cycle.`
    );
    this.name = CycleError.name;
  }
}

export class InvalidTimestamp extends DAGError {
  constructor(message: string = "Timestamp is undefined.") {
    super(message);
    this.name = InvalidInputError.name;
  }
}
