import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { DirectedAcyclicGraph } from "../src/graph/dag";
import { GraphAnalysisService } from "../src/graph/dagAnalysisService";
import { DagBuilder } from "../src/graph/dagBuilder";
import { round } from "../src/utils/math";

import path from "path";

chai.use(chaiAsPromised);

describe("DAG Analysis Service", () => {
  let dag: DirectedAcyclicGraph;
  let service: GraphAnalysisService;

  async function setupGraphFromFile(relativePath: string) {
    const filePath = path.join(process.cwd(), relativePath);

    DagBuilder.MaxNodes = 100000;
    dag = await DagBuilder.buildFromFile(filePath);
    service = new GraphAnalysisService(dag, 0);
  }

  describe("DAG Analysis Service Constructor", () => {
    it("should throw an error if the root node is not found", async () => {
      await setupGraphFromFile("test/files/database_original.txt");
      chai
        .expect(() => {
          new GraphAnalysisService(dag, 100);
        })
        .to.throw("Node with id [100] not found in the DAG.");
    });
  });

  describe("DAG Analysis Functions", () => {
    it("should return true for a bipartite graph", async () => {
      await setupGraphFromFile("test/files/database_bipartite.txt");
      const result = service.isBipartite();
      chai.expect(result).to.be.true;
    });

    it("should return false for a non-bipartite graph", async () => {
      await setupGraphFromFile("test/files/database_original.txt");
      const result = service.isBipartite();
      chai.expect(result).to.be.false;
    });

    it("should correctly calculate the average depth", async () => {
      await setupGraphFromFile("test/files/database_original.txt");
      const avgDepth = service.getAvgDepth();
      chai.expect(round(avgDepth, 2)).to.equal(1.33);
    });

    it("should correctly calculate the average transactions per depth", async () => {
      await setupGraphFromFile("test/files/database_original.txt");
      const avgTxPerDepth = service.getAvgTransactionPerDepth();
      chai.expect(round(avgTxPerDepth, 2)).to.equal(2.5);
    });

    it("should correctly calculate the average in-references per node", async () => {
      await setupGraphFromFile("test/files/database_original.txt");
      const avgInRefPerNode = service.getAvgInReferencePerNode();
      chai.expect(round(avgInRefPerNode, 3)).to.equal(1.667);
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

    it("should correctly count the number of connected components in the graph", async () => {
      await setupGraphFromFile("test/files/database_original.txt");
      const leafCount = service.getConnectedComponentsCount();
      chai.expect(leafCount).to.equal(1);
    });
  });
});
