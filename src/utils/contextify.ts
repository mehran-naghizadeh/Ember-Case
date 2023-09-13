import * as vscode from 'vscode';

export default function contextify(context: '@' | 'this') {
  const editor = vscode.window.activeTextEditor;

  if (!editor) { return; }

  // Get the user's selected word
  const word = editor.document.getText(editor.selection);

  if (!word) { return; }

  const infix = context === '@' ? '' : '.';

  const searchPattern = new RegExp(`([ {=])${word}([ .}$])`, 'g');

  // word -> @word
  // word -> this.word
  const replacePattern = `$1${context}${infix}${word}$2`;

  const modifiedText = editor.document.getText().replace(searchPattern, replacePattern);

  // Show the Find and Replace widget with the selected word
  vscode.commands.executeCommand('editor.action.startFindReplaceAction');

  // Replace the entire document with the modified text
  editor.edit((editBuilder) => {
    const documentStart = new vscode.Position(0, 0);
    const documentEnd = new vscode.Position(editor.document.lineCount - 1, 0);
    const documentRange = new vscode.Range(documentStart, documentEnd);

    editBuilder.replace(documentRange, modifiedText);
  });


};
