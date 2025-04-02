import { NodePath, PluginObj } from "@babel/core";
import * as types from "@babel/types";

export default function (): PluginObj {
  const pluginName = `[vite-zro-plugin] dead-import-remover`;

  return {
    name: pluginName,
    visitor: {
      ImportDeclaration(path: NodePath<types.ImportDeclaration>) {
        const specifiers = path.node.specifiers;
        const bindings = path.scope.bindings;

        const isUsed = specifiers.some((specifier) => {
          const bindingName = specifier.local.name;
          const binding = bindings[bindingName];
          return binding && binding.referenced; // Check if binding is defined before accessing 'referenced'
        });

        if (!isUsed) {
          path.remove();
        }
      },
    },
  };
}
