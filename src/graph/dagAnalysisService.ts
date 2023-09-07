import { DirectedAcyclicGraph } from "./dag";
import { DirectedGraphNode } from "./dagNode";

/**
 * A directed acyclic graph analysis.
 */
export class GraphAnalysisService {
  private graph: DirectedAcyclicGraph;

  constructor(graph: DirectedAcyclicGraph) {
    this.graph = graph;
  }

  /**
   * Check if the graph is a bipartite graph.
   * @param rootValue The root node value.
   * @returns True if the graph is bipartite, false otherwise.
   */
  isBipartite(rootValue: number): boolean {
    enum Color {
      Black,
      White,
    }

    const toggleColor = (color: Color) => {
      return color === Color.Black ? Color.White : Color.Black;
    };

    const colors = new Map<number, Color>();

    const rootNode = this.graph.vertices.get(rootValue);
    if (!rootNode) {
      throw new Error("Root node not found");
    }

    // BFS to color all nodes
    colors.set(rootNode.value, Color.White);

    const queue: DirectedGraphNode[] = [rootNode];

    while (queue.length) {
      const currentNode = queue.shift()!; // Remove first element
      const currentColor = colors.get(currentNode.value);

      if (currentColor !== undefined) {
        const nextColor = toggleColor(currentColor);
        for (let child of currentNode.edges) {
          const childColor = colors.get(child.value);
          if (childColor !== undefined) {
            if (childColor !== nextColor) {
              return false; // Adjacent nodes have the same color
            }
          } else {
            colors.set(child.value, nextColor);
            queue.push(child);
          }
        }
      }
    }
    return true;
  }

  /**
   * Get the depth of each node in the graph.
   * @param rootValue The root node value.
   * @returns A map of node values to their depth.
   */
  getDepths(rootValue: number): Map<number, number> {
    const depths = new Map<number, number>();
    const rootNode = this.graph.vertices.get(rootValue);

    if (!rootNode) {
      throw new Error("Root node not found");
    }
    // DFS to calculate depths
    depths.set(rootNode.value, 0);
    const stack: [DirectedGraphNode, number][] = [[rootNode, 0]];

    while (stack.length) {
      const [currentNode, currentDepth] = stack.pop()!;
      for (let child of currentNode.edges) {
        if (!depths.has(child.value)) {
          depths.set(child.value, currentDepth + 1);
          stack.push([child, currentDepth + 1]);
        }
      }
    }

    return depths;
  }

  /**
   * Get the average depth of the graph.
   * @param rootValue The root node value.
   * @returns The average depth of the graph.
   */
  getAvgDepth(rootValue: number): number {
    const depths = this.getDepths(rootValue);
    const totalDepth = Array.from(depths.values()).reduce(
      (acc, depth) => acc + depth,
      0
    );
    return totalDepth / this.graph.vertices.size;
  }

  /**
   * Get the average number of transactions per depth.
   * @param rootValue The root node value.
   * @returns The average number of transactions per depth.
   */
  getAvgTransactionPerDepth(rootValue: number): number {
    if (this.graph.vertices.size === 1) {
      return 0;
    }
    const depths = this.getDepths(rootValue);
    const maxDepth = Math.max(...Array.from(depths.values()));
    return (this.graph.vertices.size - 1) / maxDepth;
  }

  /**
   * Get the average number of in-references per node.
   * @returns The average number of in-references per node.
   */
  getAvgInReferencePerNode(): number {
    const inRefs = new Map<number, number>();

    for (const vertex of this.graph.vertices.keys()) {
      inRefs.set(vertex, 0);
    }

    for (const node of this.graph.vertices.values()) {
      for (const child of node.edges) {
        inRefs.set(child.value, (inRefs.get(child.value) || 0) + 1);
      }
    }

    // Calculate the average
    const totalInRefs = Array.from(inRefs.values()).reduce(
      (acc, ref) => acc + ref,
      0
    );

    return totalInRefs / this.graph.vertices.size;
  }

  /**
   * Check if there is a path from one node to another.
   * @param source The source node.
   * @param target The target node.
   * @returns True if there is a path, false otherwise.
   */
  topologicalSort(): number[] {
    const visited = new Set();
    const resultStack: number[] = [];
    const visit = (node: DirectedGraphNode) => {
      visited.add(node.value);
      for (let neighbor of node.edges) {
        if (!visited.has(neighbor.value)) {
          visit(neighbor);
        }
      }
      resultStack.push(node.value);
    };

    for (let node of this.graph.vertices.values()) {
      if (!visited.has(node.value)) {
        visit(node);
      }
    }
    return resultStack.reverse();
  }

  /**
   * Get the ordered transactions.
   * @returns An array of ordered transactions.
   */
  getOrderedTransactions(): number[] {
    return Array.from(this.graph.vertices.values())
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
      .map((node) => node.value);
  }

  /**
   * Get the number of connected components in the graph.
   * @returns The number of connected components in the graph.
   */
  getConnectedComponentsCount(): number {
    const visited = new Set();
    let components = 0;

    const dfs = (node: DirectedGraphNode) => {
      visited.add(node.value);
      for (let neighbor of node.edges) {
        if (!visited.has(neighbor.value)) {
          dfs(neighbor);
        }
      }
    };

    for (let node of this.graph.vertices.values()) {
      if (!visited.has(node.value)) {
        dfs(node);
        components++;
      }
    }
    return components;
  }

  /**
   * Get the number of leaf nodes in the graph.
   * @returns The number of leaf nodes in the graph.
   */
  countLeafNodes(): number {
    let count = 0;

    for (let node of this.graph.vertices.values()) {
      if (node.edges.length === 0) {
        count++;
      }
    }

    return count;
  }
}
