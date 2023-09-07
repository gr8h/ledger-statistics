import { DirectedAcyclicGraph } from "./dag";
import fileUtils from "../utils/file";

export class DagBuilder {
  static MaxNodes: number;

  static async buildFromFile(filePath: string): Promise<DirectedAcyclicGraph> {
    // ----------- Read the file
    const content = await fileUtils.readFile(filePath);

    // ----------- Parse the file content

    // Input validation
    const { n, inputs } = fileUtils.parseFile(content);

    if (Number.isNaN(n)) {
      throw new Error("Error parsing the file.");
    }

    if (n !== inputs.length) {
      throw new Error(
        `Expected ${n} nodes, but found ${inputs.length} in the input file.`
      );
    }

    if (n > this.MaxNodes) {
      throw new Error(
        `The number of nodes must be less than ${this.MaxNodes}.`
      );
    }

    // ----------- Create the DAG
    const dagGraph = new DirectedAcyclicGraph();

    // Origin node
    dagGraph.addVertex(0, 0);

    // Add transaction with it's timestamp
    for (let i = 0; i < n; i++) {
      const { leftParentId, rightParentId, timestamp } = inputs[i];
      dagGraph.addVertex(i + 1, timestamp);
    }

    // Add edges
    for (let i = 0; i < n; i++) {
      const { leftParentId, rightParentId, timestamp } = inputs[i];

      const node = dagGraph.vertices.get(i + 1);
      if (node && node.timestamp !== timestamp) {
        node.timestamp = timestamp;
      }

      if (leftParentId <= 0 || rightParentId <= 0) {
        throw new Error("Left or Right Parent ID cannot be 0.");
      }

      dagGraph.addEdge(leftParentId - 1, i + 1);

      dagGraph.addEdge(rightParentId - 1, i + 1);
    }

    return dagGraph;
  }
}
