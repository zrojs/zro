import { promises as fs } from "fs";
import path from "path";
import plugin from ".";
async function createConfigFileIfNotExists() {
  const configFileName = plugin.configFileName;
  const configDir = path.join(process.env.INIT_CWD || process.cwd(), "configs");
  const configFilePath = path.join(configDir, configFileName);

  const defaultContent = `import { defineConfig } from "@zro/db";
import sqlite from "@zro/db/connectors/node-sqlite";

export default defineConfig({
  connector: sqlite({
    name: ":memory:",
  }),
  orm: "drizzle",
});
`;

  try {
    // Ensure the configs directory exists
    await fs.mkdir(configDir, { recursive: true });

    // Check if the config file already exists
    try {
      await fs.access(configFilePath);
      console.log(`Config file already exists at: ${configFilePath}`);
    } catch {
      // If the file doesn't exist, create it with default content
      await fs.writeFile(configFilePath, defaultContent, "utf8");
      console.log(`Config file created at: ${configFilePath}`);
    }
  } catch (error) {
    console.error("Error creating config file:", error);
  }
}

// Run the script
createConfigFileIfNotExists();
