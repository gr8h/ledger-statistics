import fileUtils from "./utils/file";

const main = async () => {
  // Grab the file path from the command line arguments
  const [filePath] = process.argv.slice(2);

  if (!filePath) {
    console.error("Please provide a file path.");
    process.exit(1);
  }

  try {
    const content = await fileUtils.readFile(filePath);
    const { n, nodes } = fileUtils.parseFile(content);
    console.log(n, nodes);
  } catch (error) {
    console.error(`Error reading the file: ${error}`);
  }
};

main();
