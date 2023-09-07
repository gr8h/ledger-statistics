import { DagBuilder } from "./graph/dagBuilder";
import { GraphAnalysisService } from "./graph/dagAnalysisService";

const main = async () => {
  try {
    const [filePath] = process.argv.slice(2);

    if (!filePath) {
      console.error("Please provide a file path.");
      process.exit(1);
    }

    DagBuilder.MaxNodes = 100000;
    const dagGraph = await DagBuilder.buildFromFile(filePath);

    console.log("==STATS==================================", filePath);

    const graphAnalysisService = new GraphAnalysisService(dagGraph);

    console.log(
      "AVG DAG DEPTH: ",
      graphAnalysisService.getAvgDepth(0).toFixed(3)
    );
    console.log(
      "AVG TXS PER DEPTH: ",
      graphAnalysisService.getAvgTransactionPerDepth(0).toFixed(3)
    );
    console.log(
      "AVG REF: ",
      graphAnalysisService.getAvgInReferencePerNode().toFixed(3)
    );
    console.log("IS BIPARTITE: ", graphAnalysisService.isBipartite(0));
    console.log("TOPOLOGICAL SORT: ", graphAnalysisService.topologicalSort());
    console.log(
      "ORDERED TIMESTAMP TXS: ",
      graphAnalysisService.getOrderedTransactions()
    );
    console.log(
      "CONNECTED COMPONENTS: ",
      graphAnalysisService.getConnectedComponentsCount()
    );
    console.log("LEAF NODES: ", graphAnalysisService.countLeafNodes());
  } catch (error) {
    console.error(`Error reading the file: ${error}`);
    process.exit(1);
  }
};

main();
