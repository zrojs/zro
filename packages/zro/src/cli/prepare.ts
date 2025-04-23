import consola from "consola";
import dotenv from "dotenv";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const checkForGenerateAppKeyAndGenerate = () => {
  const envPath = path.resolve(process.cwd(), ".env");
  const env = dotenv.config({ path: envPath });

  if (!env.parsed?.APP_KEY) {
    const envContent = fs.existsSync(envPath)
      ? fs.readFileSync(envPath, "utf8")
      : "";
    const APP_KEY = crypto.randomBytes(32).toString("hex");
    const newEnvContent = `APP_KEY=${APP_KEY}\n${envContent}`;
    fs.writeFileSync(envPath, newEnvContent, "utf8");
    consola.success("App key generated successfully and added to .env file");
  } else {
    consola.success("App key is configured");
  }
};

export const prepare = async () => {
  await checkForGenerateAppKeyAndGenerate();
  consola.success("App is prepared successfully");
};
