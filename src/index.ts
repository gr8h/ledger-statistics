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
    const dag = await DagBuilder.buildFromFile(filePath);

    console.log("==STATS==================================", filePath);

    const dagService = new GraphAnalysisService(dag, 0);

    console.log("AVG DAG DEPTH: ", dagService.getAvgDepth().toFixed(3));
    console.log(
      "AVG TXS PER DEPTH: ",
      dagService.getAvgTransactionPerDepth().toFixed(3)
    );
    console.log("AVG REF: ", dagService.getAvgInReferencePerNode().toFixed(3));
    console.log("IS BIPARTITE: ", dagService.isBipartite());
    console.log("TOPOLOGICAL SORT: ", dagService.topologicalSort());
    console.log("ORDERED TIMESTAMP TXS: ", dagService.getOrderedTransactions());
    console.log(
      "CONNECTED COMPONENTS: ",
      dagService.getConnectedComponentsCount()
    );
    console.log("LEAF NODES: ", dagService.countLeafNodes());
  } catch (error) {
    console.error(`Error reading the file: ${error}`);
    process.exit(1);
  }
};

main();
