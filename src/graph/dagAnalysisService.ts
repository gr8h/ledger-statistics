import { DirectedAcyclicGraph } from "./dag";
import { DirectedGraphNode } from "./dagNode";
import { NodeNotFoundError } from "./dagError";

/**
 * A directed acyclic graph analysis.
 */
export class GraphAnalysisService {
  private graph: DirectedAcyclicGraph;
  private rootNode: DirectedGraphNode;

  constructor(graph: DirectedAcyclicGraph, rootId: number) {
    this.graph = graph;

    const rootNode = this.graph.vertices.get(rootId);
    if (rootNode === undefined) {
      throw new NodeNotFoundError(rootId);
    } else {
      this.rootNode = rootNode;
    }
  }

  /**
   * Check if the graph is a bipartite graph.
   * @returns True if the graph is bipartite, false otherwise.
   */
  isBipartite(): boolean {
    enum Color {
      Black,
      White,
    }

    const toggleColor = (color: Color) => {
      return color === Color.Black ? Color.White : Color.Black;
    };

    const colors = new Map<number, Color>();

    // BFS to color all nodes
    colors.set(this.rootNode.id, Color.White);

    const queue: DirectedGraphNode[] = [this.rootNode];

    while (queue.length) {
      const currentNode = queue.shift()!; // Remove first element
      const currentColor = colors.get(currentNode.id);

      if (currentColor !== undefined) {
        const nextColor = toggleColor(currentColor);
        for (let child of currentNode.edges) {
          const childColor = colors.get(child.id);
          if (childColor !== undefined) {
            if (childColor !== nextColor) {
              return false;
            }
          } else {
            colors.set(child.id, nextColor);
            queue.push(child);
          }
        }
      }
    }
    return true;
  }

  /**
   * Get the depth of each node in the graph.
   * @returns A map of node values to their depth.
   */
  getDepths(): Map<number, number> {
    const depths = new Map<number, number>();

    // DFS to calculate depths
    depths.set(this.rootNode.id, 0);
    const stack: [DirectedGraphNode, number][] = [[this.rootNode, 0]];

    while (stack.length) {
      const [currentNode, currentDepth] = stack.pop()!;
      for (let child of currentNode.edges) {
        if (!depths.has(child.id)) {
          depths.set(child.id, currentDepth + 1);
          stack.push([child, currentDepth + 1]);
        }
      }
    }

    return depths;
  }

  /**
   * Get the average depth of the graph.
   * @returns The average depth of the graph.
   */
  getAvgDepth(): number {
    const depths = this.getDepths();
    const totalDepth = Array.from(depths.values()).reduce(
      (acc, depth) => acc + depth,
      0
    );
    return totalDepth / this.graph.vertices.size;
  }

  /**
   * Get the average number of transactions per depth.
   * @returns The average number of transactions per depth.
   */
  getAvgTransactionPerDepth(): number {
    if (this.graph.vertices.size === 1) {
      return 0;
    }
    const depths = this.getDepths();
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
        inRefs.set(child.id, (inRefs.get(child.id) || 0) + 1);
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
      visited.add(node.id);
      for (let child of node.edges) {
        if (!visited.has(child.id)) {
          visit(child);
        }
      }
      resultStack.push(node.id);
    };

    for (let node of this.graph.vertices.values()) {
      if (!visited.has(node.id)) {
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
      .sort((a, b) => (a.getTimestamp() || 0) - (b.getTimestamp() || 0))
      .map((node) => node.id);
  }

  /**
   * Get the number of connected components in the graph.
   * @returns The number of connected components in the graph.
   */
  getConnectedComponentsCount(): number {
    const visited = new Set();
    let components = 0;

    const dfs = (node: DirectedGraphNode) => {
      visited.add(node.id);
      for (let child of node.edges) {
        if (!visited.has(child.id)) {
          dfs(child);
        }
      }
    };

    for (let node of this.graph.vertices.values()) {
      if (!visited.has(node.id)) {
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

  getAverageLatency(): number {
    let totalLatency = 0;
    let count = 0;

    for (let node of this.graph.vertices.values()) {
      if (node.getTimestamp() !== undefined) {
        for (let neighbor of node.edges) {
          if (neighbor.getTimestamp() !== undefined) {
            totalLatency += node.getTimestamp()! - neighbor.getTimestamp()!;
            count++;
          }
        }
      }
    }

    return count > 0 ? totalLatency / count : 0;
  }
}
