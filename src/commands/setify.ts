import * as vscode from 'vscode';
import { Selection, WorkspaceEdit } from 'vscode';

export default function setify() {
  // The code you place here will be executed every time ypur command is executed
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showInformationMessage('I need an open document to operate on.');

    return;
  }

  const { document, selections } = editor;

  // Create a WorkspaceEdit to accumulate the edit operations
  const workspaceEdit = new WorkspaceEdit();

  editor.edit((editBuilder: vscode.TextEditorEdit) => {
    nonOverlapping(selections).forEach((selection) => {
      // Get all lines within the current selection
      const selectedLines = document.getText(selection).split('\n');

      selectedLines.forEach((lineText: string, index: number) => {
        const line = document.lineAt(selection.start.line + index);
        const fullLineText = document.getText(line.range);

        const indentSteps = fullLineText.indexOf(fullLineText.trim());
        const indentation = new Array(indentSteps + 1).join(' ');

        const setifiedText = fullLineText
          .replace(/this.set\('([^']+)', ?([^()]+)\)/, (_, key, value) => {
            const parts = key.split('.');
            const keyName = parts.shift();
            const propertiesPath = parts.join('.');

            return propertiesPath.length === 0
              ? `set(this, '${keyName}', ${value})`
              : `set(this.${keyName}, '${propertiesPath}', ${value})`;
          })
          .trim();

        workspaceEdit.replace(
          document.uri,
          line.range,
          `${indentation}${setifiedText}`,
        );
      });
    });
  });

  vscode.workspace.applyEdit(workspaceEdit);
}

function nonOverlapping(selections: readonly Selection[]): Selection[] {
  return selections.reduce(
    (acc, item) => {
      return acc.some((sel) => sel.start.line === item.start.line)
        ? acc
        : [...acc, item];
    },
    [] as Selection[],
  );
}
