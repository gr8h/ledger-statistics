# Ledger Statistics

This project provides a system to parse transaction data and compute various graph-based statistics on the data.

## Overview

Given a list of transactions with their unique identifiers, two reference transactions (left & right), and a timestamp, the system constructs a graph in memory and calculates several statistics, including:

- Average depth of the Directed Acyclic Graph (DAG).
- Average number of transactions per depth.
- Average number of out-references per node.
- Additional statistics like the number of leaf nodes, topological order of transactions, etc.

## Assumptions

- **Bipartite Graph**: The constructed graph is assumed to be bipartite. However, most of our calculations work even if it's not.
- **Timestamp**: Each node in the graph has an associated timestamp. For now, it's used for operations like ordering the transactions, validating ... etc.
- **Unique IDs**: Each node in the graph has a unique identifier. This is used to identify nodes in the graph and to reference them in the input data, the IDs are assumed to be integers and start from 0.

## Getting Started

### Prerequisites

- Node.js and TypeScript installed.
- Ensure you have the necessary dependencies installed via `yarn install`.

### Running the System

1. Place your transaction data in a `.txt` file with the structure specified below.
   Examples are provided in the `test/files` directory.
2. Run the main program with the path to your data file as an argument.
   For example:
   ```
   yarn start test/files/database_original.txt
   ```

### Data File Structure

```
N
L R T
...
```

Where:

- `N` is the number of nodes (transactions).
- `L` and `R` are the left and right parent node IDs, respectively.
- `T` is the timestamp.

Examples are provided in the `test/files` directory.

### Tests

Run tests using the following command:

```
yarn test
```

Get test coverage using the following command:

```
yarn test:coverage
```
