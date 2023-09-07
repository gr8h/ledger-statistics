import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { DirectedAcyclicGraph } from "../src/graph/dag";
import { GraphAnalysisService } from "../src/graph/dagAnalysisService";
import { DagBuilder } from "../src/graph/dagBuilder";
import fileUtils from "../src/utils/file";
import { promises as fs } from "fs";
import path from "path";

chai.use(chaiAsPromised);

describe("GraphAnalysisService", () => {
  let dag: DirectedAcyclicGraph;
  let service: GraphAnalysisService;

  beforeEach(() => {
    dag = new DirectedAcyclicGraph();
    service = new GraphAnalysisService(dag);
  });

  async function setupGraphFromFile(relativePath: string) {
    const filePath = path.join(process.cwd(), relativePath);

    DagBuilder.MaxNodes = 100000;
    dag = await DagBuilder.buildFromFile(filePath);
    service = new GraphAnalysisService(dag);
  }

  describe("Graph Setup", () => {
    it("should correctly set up the graph from a valid file", async () => {
      await setupGraphFromFile("test/files/database_original.txt");
      chai.expect(dag.vertices.size).to.equal(6);
    });

    it("should throw an error for invalid files", async () => {
      await chai
        .expect(setupGraphFromFile("test/files/database_wrong_n.txt"))
        .to.eventually.be.rejectedWith(
          "Expected 6 nodes, but found 5 in the input file."
        );
    });

    it("should throw an error for a graph with a cycle", async () => {
      await chai
        .expect(setupGraphFromFile("test/files/database_cycle.txt"))
        .to.eventually.be.rejectedWith(
          "Adding an edge from node [6] to node [7] would create a cycle."
        );
    });

    it("should add vertices with appropriate timestamps", async () => {
      await setupGraphFromFile("test/files/database_original.txt");
      const node0 = dag.vertices.get(1);
      chai.expect(node0?.timestamp).to.equal(0);

      const node5 = dag.vertices.get(5);
      chai.expect(node5?.timestamp).to.equal(3);
    });

    it("should correctly add edges between nodes", async () => {
      await setupGraphFromFile("test/files/database_original.txt");
      const parentNode = dag.vertices.get(1);
      const childNode = dag.vertices.get(2);

      chai.expect(childNode).to.not.be.undefined;
      if (childNode === undefined) return;
      chai.expect(parentNode?.edges.indexOf(childNode)).to.be.greaterThan(-1);
    });
  });

  describe("Graph Analysis", () => {
    it("should return true for a bipartite graph", async () => {
      await setupGraphFromFile("test/files/database_bipartite.txt");
      const result = service.isBipartite(0);
      chai.expect(result).to.be.true;
    });

    it("should return false for a non-bipartite graph", async () => {
      await setupGraphFromFile("test/files/database_original.txt");
      const result = service.isBipartite(0);
      chai.expect(result).to.be.false;
    });

    it("should correctly calculate the average depth", async () => {
      await setupGraphFromFile("test/files/database_original.txt");
      const avgDepth = service.getAvgDepth(0);
      chai.expect(avgDepth.toFixed(2)).to.equal("1.33");
    });

    it("should correctly calculate the average transactions per depth", async () => {
      await setupGraphFromFile("test/files/database_original.txt");
      const avgTxPerDepth = service.getAvgTransactionPerDepth(0);
      chai.expect(avgTxPerDepth).to.equal(2.5);
    });

    it("should correctly calculate the average in-references per node", async () => {
      await setupGraphFromFile("test/files/database_original.txt");
      const avgInRefPerNode = service.getAvgInReferencePerNode();
      chai.expect(avgInRefPerNode.toFixed(3)).to.equal("1.667");
    });

    it("should provide a valid topological sort of the graph", async () => {
      await setupGraphFromFile("test/files/database_original.txt");
      const topoSort = service.topologicalSort();
      chai.expect(topoSort).to.deep.equal([0, 1, 3, 2, 5, 4]);
    });

    it("should correctly return the transactions ordered by timestamp", async () => {
      await setupGraphFromFile("test/files/database_original.txt");
      const orderedTransactions = service.getOrderedTransactions();
      chai.expect(orderedTransactions).to.deep.equal([0, 1, 2, 3, 4, 5]);
    });

    it("should correctly count the number of leaf nodes in the graph", async () => {
      await setupGraphFromFile("test/files/database_original.txt");
      const leafCount = service.countLeafNodes();
      chai.expect(leafCount).to.equal(2);
    });
  });
});
