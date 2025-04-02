import { PluginObj } from "@babel/core";

const serverOnlyExports = ["loader", "actions", "middlewares"];

export default function serverCodeRemover(): PluginObj {
  const pluginName = `[vite-zro-plugin] server-code-remover`;

  return {
    name: pluginName,
    visitor: {
      ExportNamedDeclaration(path) {
        const { node } = path;
        if (
          node.declaration &&
          node.declaration.type === "VariableDeclaration" &&
          node.declaration.declarations
        ) {
          node.declaration.declarations = node.declaration.declarations.filter(
            (declaration) => {
              return (
                declaration.id.type === "Identifier" &&
                !serverOnlyExports.includes(declaration.id.name)
              );
            }
          );
          if (node.declaration.declarations.length === 0) {
            path.remove();
          }
        } else if (node.specifiers) {
          node.specifiers = node.specifiers.filter((specifier) => {
            return (
              specifier.exported.type === "Identifier" &&
              !serverOnlyExports.includes(specifier.exported.name)
            );
          });
          if (node.specifiers.length === 0) {
            path.remove();
          }
        }
      },
    },
  };
}
