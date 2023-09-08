export class DirectedGraphNode {
  id: number;
  edges: Array<DirectedGraphNode>;
  private _timestamp: number | undefined;

  constructor(id: number) {
    this.id = id;
    this._timestamp = undefined;
    this.edges = [];
  }

  getTimestamp(): number | undefined {
    return this._timestamp;
  }

  setTimestamp(value: number | undefined) {
    this._timestamp = value;
  }
}
