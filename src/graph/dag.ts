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

export class DirectedAcyclicGraph {
  vertices: Map<number, DirectedGraphNode>;

  constructor() {
    this.vertices = new Map();
  }

  addVertex(index: number, timestamp: number): DirectedGraphNode {
    const newNode = new DirectedGraphNode(index);
    newNode.timestamp = timestamp;
    this.vertices.set(index, newNode);

    return newNode;
  }

  addEdge(parentIndex: number, targetIndex: number): boolean {
    const parentNode = this.vertices.get(parentIndex);
    const targetNode = this.vertices.get(targetIndex);

    if (!parentNode || !targetNode) return false;
    if (parentNode.edges.has(targetNode)) return false;

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

    parentNode.edges.add(targetNode);

    if (this.hasPath(targetNode, parentNode)) {
      parentNode.edges.delete(targetNode);
      throw new Error(
        `Adding an edge from node [${parentNode.value}] to node [${targetIndex}] would create a cycle.`
      );
    }
    // console.debug("Adding edge: ", parentNode.value, targetIndex);
    return parentNode.edges.has(targetNode);
  }

  getEdgesPerVertex(index: number): DirectedGraphNode[] {
    const node = this.vertices.get(index);
    if (!node) return [];
    return Array.from(node.edges);
  }

  getAllEdges(): DirectedGraphNode[] {
    const edges: DirectedGraphNode[] = [];
    for (let node of this.vertices.values()) {
      edges.push(...Array.from(node.edges));
    }
    return edges;
  }

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

  isBipartite(rootValue: number): boolean {
    enum Color {
      Black,
      White,
    }

    const toggleColor = (color: Color) => {
      return color === Color.Black ? Color.White : Color.Black;
    };

    const colors = new Map<number, Color>();

    const rootNode = this.vertices.get(rootValue);
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

  getDepths(rootValue: number): Map<number, number> {
    const depths = new Map<number, number>();
    const rootNode = this.vertices.get(rootValue);

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

  getAvgDepth(rootValue: number): number {
    const depths = this.getDepths(rootValue);
    const totalDepth = Array.from(depths.values()).reduce(
      (acc, depth) => acc + depth,
      0
    );
    return totalDepth / this.vertices.size;
  }

  getAvgTransactionPerDepth(rootValue: number): number {
    if (this.vertices.size === 1) {
      return 0;
    }
    const depths = this.getDepths(rootValue);
    const maxDepth = Math.max(...Array.from(depths.values()));
    return (this.vertices.size - 1) / maxDepth;
  }

  getAvgInReferencePerNode(rootValue: number): number {
    const refs = new Map<number, number>();
    const rootNode = this.vertices.get(rootValue);

    if (!rootNode) {
      throw new Error("Root node not found");
    }

    const dfs = (node: DirectedGraphNode): void => {
      refs.set(node.value, node.edges.size);
      for (let child of node.edges) {
        dfs(child);
      }
    };

    dfs(rootNode);
    const totalRefs = Array.from(refs.values()).reduce(
      (acc, ref) => acc + ref,
      0
    );
    return totalRefs / this.vertices.size;
  }

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

    for (let node of this.vertices.values()) {
      if (!visited.has(node.value)) {
        visit(node);
      }
    }
    return resultStack.reverse();
  }

  getOrderedTransactions(): number[] {
    return Array.from(this.vertices.values())
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
      .map((node) => node.value);
  }

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

    for (let node of this.vertices.values()) {
      if (!visited.has(node.value)) {
        dfs(node);
        components++;
      }
    }
    return components;
  }
}
