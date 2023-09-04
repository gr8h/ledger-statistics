import fs from "fs";

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

type NodeData = {
  leftParentId: number;
  rightParentId: number;
  timestamp: number;
};

const parseFile = (content: string): { n: number; nodes: NodeData[] } => {
  const lines = content.trim().split("\n");

  const n = parseInt(lines[0], 10);

  const nodes = lines.slice(1, n + 1).map((line) => {
    const [L, R, T] = line.split(" ").map(Number);
    return {
      leftParentId: L,
      rightParentId: R,
      timestamp: T,
    };
  });

  return { n, nodes };
};

export default { readFile, parseFile };
