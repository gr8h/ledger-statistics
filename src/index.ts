import fileUtils from "./utils/file";
import { DirectedAcyclicGraph } from "./graph/dag";

import { assert } from "console";

const MaxNodes = 100000;

const main = async () => {
  // Grab the file path from the command line arguments
  const [filePath] = process.argv.slice(2);

  if (!filePath) {
    console.error("Please provide a file path.");
    process.exit(1);
  }

  try {
    // ----------- Read the file
    const content = await fileUtils.readFile(filePath);

    // ----------- Parse the file content
    const { n, inputs } = fileUtils.parseFile(content);

    if (Number.isNaN(n)) {
      console.error("Error parsing the file.");
      process.exit(1);
    }

    if (n !== inputs.length) {
      console.error(
        `The number of nodes ${n}, does not match the inputs ${inputs.length}.`
      );
      process.exit(1);
    }

    // ----------- Create the DAG
    const dag2 = new DirectedAcyclicGraph();

    // Origin node
    dag2.addVertex(0, 0);

    if (n > MaxNodes) {
      console.error(`The number of nodes must be less than ${MaxNodes}.`);
      process.exit(1);
    }

    for (let i = 0; i < n; i++) {
      const { leftParentId, rightParentId, timestamp } = inputs[i];
      dag2.addVertex(i + 1, timestamp);
    }

    for (let i = 0; i < n; i++) {
      const { leftParentId, rightParentId, timestamp } = inputs[i];

      if (leftParentId <= 0 || rightParentId <= 0) {
        console.error("Left or Right Parent ID cannot be 0.");
        process.exit(1);
      }

      dag2.addEdge(leftParentId - 1, i + 1);

      dag2.addEdge(rightParentId - 1, i + 1);
    }

    console.log("====================================");
    console.log("AVG DAG DEPTH: ", dag2.getAvgDepth(0).toFixed(3));
    console.log(
      "AVG TXS PER DEPTH: ",
      dag2.getAvgTransactionPerDepth(0).toFixed(3)
    );
    console.log("AVG REF: ", dag2.getAvgInReferencePerNode(0).toFixed(3));
    console.log("IS BIPARTITE: ", dag2.isBipartite(0));
    console.log("TOPOLOGICAL SORT: ", dag2.topologicalSort());
    console.log("ORDERED TIMESTAMP TXS: ", dag2.getOrderedTransactions());
    console.log("CONNECTED COMPONENTS: ", dag2.getConnectedComponentsCount());
  } catch (error) {
    console.error(`Error reading the file: ${error}`);
  }
};

main();
