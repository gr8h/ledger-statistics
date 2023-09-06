import fs from "fs";

/**
 * The data of a node.
 */
type InputData = {
  leftParentId: number;
  rightParentId: number;
  timestamp: number;
};

/**
 * Reads the content of a file.
 * @param filePath Path to the file.
 * @returns A promise that resolves with the file content or rejects with an error.
 */
const readFile = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Parses the content of a file.
 * @param content The file content.
 * @returns An object containing the number of nodes and the node data.
 */
const parseFile = (content: string): { n: number; inputs: InputData[] } => {
  const lines = content.trim().split("\n");

  const n = parseInt(lines[0], 10);

  const inputs = lines.slice(1, n + 1).map((line) => {
    const [L, R, T] = line.split(" ").map(Number);
    return {
      leftParentId: L,
      rightParentId: R,
      timestamp: T,
    };
  });

  return { n, inputs };
};

export default { readFile, parseFile };
