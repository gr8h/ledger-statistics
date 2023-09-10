import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { DirectedAcyclicGraph } from "../src/graph/dag";
import { GraphAnalysisService } from "../src/graph/dagAnalysisService";
import { DagBuilder } from "../src/graph/dagBuilder";

import path from "path";

chai.use(chaiAsPromised);

describe("DAG", () => {
  let dag: DirectedAcyclicGraph;
  let service: GraphAnalysisService;

  async function setupGraphFromFile(relativePath: string) {
    const filePath = path.join(process.cwd(), relativePath);

    DagBuilder.MaxNodes = 100000;
    dag = await DagBuilder.buildFromFile(filePath);
    service = new GraphAnalysisService(dag, 0);
  }

  // Graph setup Tests
  describe("DAG Core Functions", () => {
    const originalWarn = console.warn;
    afterEach(() => (console.warn = originalWarn));

    let consoleOutput: string[] = [];
    const mockedWarn = (output: string) => consoleOutput.push(output);
    beforeEach(() => (console.warn = mockedWarn));

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

    it("should throw an error for invalid timestamp", async () => {
      await chai
        .expect(setupGraphFromFile("test/files/database_timestamp_ud.txt"))
        .to.eventually.be.rejectedWith("Timestamp is undefined.");
    });

    it("should throw an error for a graph with a cycle", async () => {
      await chai
        .expect(setupGraphFromFile("test/files/database_cycle.txt"))
        .to.eventually.be.rejectedWith(
          "Adding an edge from node [6] to node [7] would create a cycle."
        );

      chai
        .expect(consoleOutput)
        .to.include(
          "Node [3] timestamp 1, is not greater than parent node [7] timestamp 5."
        );
      chai
        .expect(consoleOutput)
        .to.include(
          "Node [4] timestamp 3, is not greater than parent node [5] timestamp 4."
        );
    });

    it("should add vertices with appropriate timestamps", async () => {
      await setupGraphFromFile("test/files/database_original.txt");
      const node0 = dag.vertices.get(1);
      chai.expect(node0?.getTimestamp()).to.equal(0);

      const node5 = dag.vertices.get(5);
      chai.expect(node5?.getTimestamp()).to.equal(3);
    });

    it("should correctly add edges between nodes", async () => {
      await setupGraphFromFile("test/files/database_original.txt");
      const parentNode = dag.vertices.get(1);
      const childNode = dag.vertices.get(2);

      chai.expect(childNode).to.not.be.undefined;
      if (childNode === undefined) return;
      chai.expect(parentNode?.edges.indexOf(childNode)).to.be.greaterThan(-1);
    });

    it("should warn if a node has a timestamp earlier than its parent", async () => {
      await setupGraphFromFile("test/files/database_timestamp.txt");

      chai
        .expect(consoleOutput)
        .to.include(
          "Node [4] timestamp 5, is not greater than parent node [2] timestamp 6."
        );
      chai
        .expect(consoleOutput)
        .to.include(
          "Node [4] timestamp 5, is not greater than parent node [2] timestamp 6."
        );
    });
  });
});
