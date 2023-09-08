import { DagBuilder } from "./graph/dagBuilder";
import { GraphAnalysisService } from "./graph/dagAnalysisService";
import { round } from "./utils/math";

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

    console.log("AVG DAG DEPTH: ", round(dagService.getAvgDepth(), 2));
    console.log(
      "AVG TXS PER DEPTH: ",
      round(dagService.getAvgTransactionPerDepth(), 2)
    );
    console.log("AVG REF: ", round(dagService.getAvgInReferencePerNode(), 3));
    console.log("IS BIPARTITE: ", dagService.isBipartite());
    console.log("TOPOLOGICAL SORT: ", dagService.topologicalSort());
    console.log("ORDERED TIMESTAMP TXS: ", dagService.getOrderedTransactions());
    console.log(
      "CONNECTED COMPONENTS: ",
      dagService.getConnectedComponentsCount()
    );
    console.log("LEAF NODES: ", dagService.countLeafNodes());
    console.log("AVG LATENCY: ", round(dagService.getAverageLatency(), 3));
  } catch (error) {
    console.error(`Error reading the file: ${error}`);
    process.exit(1);
  }
};

main();
