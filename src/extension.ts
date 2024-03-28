import * as vscode from "vscode";
import { generateComment } from "./comments";
import { generateReview } from "./review";
import { generateRefactoredCode } from "./refactor";
import { fixCodeError } from "./fix";
import { generateOptimizeCode } from "./optimize";

export function activate(context: vscode.ExtensionContext) {
  const commentCode = vscode.commands.registerCommand("pipet-code-agent.commentCode", generateComment);
  const reviewCode = vscode.commands.registerCommand("pipet-code-agent.reviewCode", generateReview);
  const refactorCode = vscode.commands.registerCommand("pipet-code-agent.codeRefactor", generateRefactoredCode);
  const optimizeCode = vscode.commands.registerCommand("pipet-code-agent.codeOptimize", generateOptimizeCode);
  const fixCode = vscode.commands.registerCommand("pipet-code-agent.codeFix", (errorMessage: string) => {
    fixCodeError(errorMessage);
  });

  const askExtensionProvider = new AskExtensionProvider();
  const askExtensionDisposable = vscode.languages.registerCodeActionsProvider(
    { scheme: "file", language: "*" },
    askExtensionProvider
  );

  context.subscriptions.push(commentCode, reviewCode, refactorCode, fixCode, optimizeCode, askExtensionDisposable);
}

class AskExtensionProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
    const actions: vscode.CodeAction[] = [];
    if (context.diagnostics.length > 0) {
      const diagnostic = context.diagnostics[0];
      const errorMessage = diagnostic.message;
      const action = new vscode.CodeAction("Ask Ola to Fix", vscode.CodeActionKind.QuickFix);
      action.command = {
        command: "pipet-code-agent.codeFix",
        title: "Ask Ola to Fix",
        arguments: [errorMessage],
      };
      actions.push(action);
    }
    return actions;
  }
}

export function deactivate() {}
