import { DirectedGraphNode } from "./dagNode";

/**
 * A directed acyclic graph.
 */
export class DirectedAcyclicGraph {
  vertices: Map<number, DirectedGraphNode>;

  constructor() {
    this.vertices = new Map();
  }

  /**
   * Add a vertex to the graph.
   * @param index The index of the vertex.
   * @param timestamp The timestamp of the vertex.
   * @returns The newly created vertex.
   */
  addVertex(index: number, timestamp: number): DirectedGraphNode {
    const newNode = new DirectedGraphNode(index);
    newNode.timestamp = timestamp;
    this.vertices.set(index, newNode);

    return newNode;
  }

  /**
   * Add an edge to the graph.
   * @param parentIndex The index of the parent vertex.
   * @param targetIndex The index of the target vertex.
   * @returns True if the edge was added, false otherwise.
   */
  addEdge(parentIndex: number, targetIndex: number): boolean {
    const parentNode = this.vertices.get(parentIndex);
    const targetNode = this.vertices.get(targetIndex);

    if (!parentNode || !targetNode) return false;

    // Check validity against parent timestamps
    if (
      targetNode.timestamp == undefined ||
      parentNode.timestamp == undefined
    ) {
      throw new Error("Timestamp is undefined.");
    }

    if (targetNode.timestamp < parentNode.timestamp) {
      console.warn(
        `Node [${targetNode.value}] timestamp ${targetNode.timestamp}, is not greater than parent node [${parentNode.value}] timestamp ${parentNode.timestamp}.`
      );
    }

    parentNode.edges.push(targetNode);

    // console.debug(
    //   "Adding edge: ",
    //   parentNode.value,
    //   targetIndex,
    //   this.hasPath(targetNode, parentNode)
    // );

    if (this.hasPath(targetNode, parentNode)) {
      const index = parentNode.edges.indexOf(targetNode);
      if (index > -1) {
        parentNode.edges.splice(index, 1);
      }

      // parentNode.edges.delete(targetNode);
      throw new Error(
        `Adding an edge from node [${parentNode.value}] to node [${targetIndex}] would create a cycle.`
      );
    }
    return parentNode.edges.indexOf(targetNode) > -1;
  }

  /**
   * Check if there is a path from source to destination.
   * @param source The source node.
   * @param destination The destination node.
   * @returns True if there is a path, false otherwise.
   */
  hasPath(source: DirectedGraphNode, destination: DirectedGraphNode): boolean {
    const visited = new Set<DirectedGraphNode>();
    const stack: DirectedGraphNode[] = [source];

    while (stack.length) {
      const current = stack.pop();
      if (current === destination) {
        return true;
      }

      if (current) {
        visited.add(current);
        for (let neighbor of current.edges) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
    }
    return false;
  }
}
