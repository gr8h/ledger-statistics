export class DirectedGraphNode {
  value: number;
  timestamp: number | undefined;
  edges: Set<DirectedGraphNode>;

  constructor(value: number) {
    this.value = value;
    this.timestamp = undefined;
    this.edges = new Set();
  }
}
