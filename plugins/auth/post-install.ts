import { promises as fs } from "fs";
import path from "path";
import plugin from ".";

async function createConfigFileIfNotExists() {
  const configDir = path.join(process.env.INIT_CWD || process.cwd(), "configs");
  const configFileName = plugin.configFileName;
  const configFilePath = path.join(configDir, configFileName);

  const defaultContent = `import { defineConfig } from "@zro/auth";

declare module "@zro/auth" {
  export interface User {
    id: number;
    email: string;
  }
}

export default defineConfig({
  authPrefix: "/auth",
  loginPage: "/login",
  onLoginSuccessRedirect: "/dashboard",
  session: {
    password: process.env.AUTH_SESSION_KEY!,
  },
  verifyToken: async (token) => {
    throw new Error('Implement verifyToken method')
  },
  generateToken: async (user) => {
    throw new Error('Implement generateToken method')
  },
  providers: [
    // define your providers here
  ],
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
