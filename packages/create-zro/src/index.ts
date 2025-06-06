#!/usr/bin/env node

import {
  confirm,
  intro,
  isCancel,
  outro,
  select,
  spinner,
  text,
} from "@clack/prompts";
import chalk from "chalk";
import fs from "node:fs";
import path, { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { installDependencies, PackageManagerName } from "nypm";

const __filename = fileURLToPath(import.meta.url);

const templatesDir = path.resolve(__filename, "../..", `templates`);
const availableTemplates = fs.readdirSync(templatesDir).reverse();

(async () => {
  intro(`Create a new ${chalk.gray.bold("[Z۰RO]")} project`);
  // Get the project name from command-line arguments
  let initialProjectName = process.argv[2]?.trim();

  const packageManager = pkgFromUserAgent(process.env.npm_config_user_agent);

  const projectName =
    initialProjectName ||
    (await text({
      message: "Enter the name of your project:",
      validate: (value) =>
        value.trim() === "" ? "Project name cannot be empty" : undefined,
    }));

  if (isCancel(projectName)) {
    outro("Operation cancelled.");
    process.exit(0);
  }

  const projectPath = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.error(`Error: Directory ${projectName} already exists.`);
    process.exit(1);
  }

  const template = await select({
    message: "Select a template to use:",
    options: availableTemplates.map((template) => ({
      label: template,
      value: template,
    })),
  });

  if (isCancel(template)) {
    outro("Operation cancelled.");
    process.exit(0);
  }
  const relativePath = relative(process.cwd(), projectPath);

  const initializeProjectSpinner = spinner();
  initializeProjectSpinner.start(
    chalk.dim(
      `Creating a new ZRO project in ${chalk.reset.bold(
        relativePath
      )} ${chalk.dim("using template")} ${chalk.reset.bold(template)}...`
    )
  );

  // Copy template files
  const templatePath = path.join(templatesDir, template);
  fs.mkdirSync(projectPath, { recursive: true });

  const copyRecursiveSync = (src: string, dest: string) => {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      let destName = entry.name;

      // Rename _gitignore to .gitignore
      if (destName === "_gitignore") {
        destName = ".gitignore";
      }

      const destPath = path.join(dest, destName);

      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyRecursiveSync(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };

  copyRecursiveSync(templatePath, projectPath);

  initializeProjectSpinner.stop(
    chalk.dim(
      `Project initialized in ${chalk.bold.reset(relativePath)} successfully.`
    )
  );

  if (!!packageManager) {
    // Ask user if they want to install dependencies
    const installDeps = await confirm({
      message: "Install dependencies now?",
      active: "Yes",
      inactive: "No",
      initialValue: false,
    });

    if (isCancel(installDeps)) {
      outro("Operation cancelled.");
      process.exit(0);
    }
    const installDependenciesSpinner = spinner();
    if (installDeps) {
      // Detect package manager (npm, yarn, pnpm, bun)
      installDependenciesSpinner.start(
        `Installing dependencies with ${packageManager.name}...`
      );
      try {
        await installDependencies({
          cwd: projectPath,
          packageManager: packageManager.name,
          silent: true,
        });
        installDependenciesSpinner.stop("Dependencies installed successfully.");
      } catch (error) {
        installDependenciesSpinner.message(
          "Failed to install dependencies. You can install them manually later."
        );
        installDependenciesSpinner.stop();
      }
    }
  }

  // Ask for git initialization
  const initGit = await confirm({
    message: "Initialize git?",
    active: "Yes",
    inactive: "No",
    initialValue: true,
  });

  if (isCancel(initGit)) {
    outro("Operation cancelled.");
    process.exit(0);
  }

  if (initGit) {
    const initGitSpinner = spinner();
    initGitSpinner.start("Initializing git repository...");
    try {
      const { exec } = await import("node:child_process");
      exec("git init", { cwd: projectPath }, (error) => {
        if (error) {
          initGitSpinner.stop("Failed to initialize git repository.");
        } else {
          initGitSpinner.stop("Git repository initialized successfully.");
        }
      });
    } catch (error) {
      initGitSpinner.stop("Failed to initialize git repository.");
    }
  }

  outro(
    `Next steps:\n   ${chalk.dim("$")} ${chalk.bold(
      `cd ${projectName}`
    )}\n   ${chalk.dim("$")} ${chalk.bold("pnpm dev")}`
  );
})();

interface PkgInfo {
  name: PackageManagerName;
  version: string;
}

function pkgFromUserAgent(userAgent: string | undefined): PkgInfo | undefined {
  if (!userAgent) return undefined;
  const pkgSpec = userAgent.split(" ")[0];
  const pkgSpecArr = pkgSpec.split("/");
  return {
    name: pkgSpecArr[0] as PackageManagerName,
    version: pkgSpecArr[1],
  };
}
