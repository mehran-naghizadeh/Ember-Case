import * as vscode from 'vscode';

export default function applyContext(context: '@' | 'this') {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showInformationMessage('I need an open document to operate on.');

    return;
  }

  // Get the user's selected word
  const word = editor.document.getText(editor.selection);

  if (!word) {
    vscode.window.showInformationMessage('Please select a word in the document and then try again.');

    return;
  }

  const infix = context === '@' ? '' : '.';

  const searchPattern = new RegExp(`([\n {=])${word}([ .)}\n])`, 'g');

  // word -> @word
  // word -> this.word
  const replacePattern = `$1${context}${infix}${word}$2`;

  const modifiedText = editor.document.getText().replace(searchPattern, replacePattern);

  // Show the Find and Replace widget with the selected word
  vscode.commands.executeCommand('actions.findWithSelection');

  // Replace the entire document with the modified text
  editor.edit((editBuilder) => {
    const documentStart = new vscode.Position(0, 0);
    const documentEnd = new vscode.Position(editor.document.lineCount - 1, 0);
    const documentRange = new vscode.Range(documentStart, documentEnd);

    editBuilder.replace(documentRange, modifiedText);
  });


};
