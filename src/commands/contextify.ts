import * as vscode from 'vscode';
import * as fs from 'fs';
import applyContext from '../utils/apply-context';
import atify from './atify';
import thisify from './thisify';

const editor: () => vscode.TextEditor | undefined = () => vscode.window.activeTextEditor;

function getWord() {
  if (!editor()) {
    vscode.window.showInformationMessage('No active document.');
    return;
  }

  const word = editor()!.document.getText(editor()!.selection);

  if (!word) {
    vscode.window.showInformationMessage('Please select a word in the document first.');
    return;
  }

  return word;
}

function isTemplate () {
  return editor()?.document.fileName.endsWith('.hbs') ?? false;
}

function siblingContent() {
  const originalFile = editor()?.document;

  if (!originalFile?.fileName.endsWith('.hbs')) {
    return;
  }

  const { fileName } = originalFile;

  let siblingPaths: Record<string, string> = {};

  if (fileName.endsWith('template.hbs')) {
    // Feature level component
    siblingPaths = {
      component:  fileName.replace('template.hbs', 'component.js'),
      controller: fileName.replace('template.hbs', 'controller.js'),
      route:      fileName.replace('template.hbs', 'route.js'),
    };
  } else {
    // Top level component
    siblingPaths = {
      component: fileName.replace('app/templates/components', 'app/components').replace('.hbs', '.js'),
    };
  }

  let paths = {};

  Object.entries(siblingPaths).forEach(([type, path]) => {
    if (!fs.existsSync(path)) { return; }

    paths = {
      ...paths,
      [type]: fs.readFileSync(path, 'utf8')
    };
  });

  return paths;
}

// Create a text editor decoration type
const highlightDecorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: 'yellow',
});

function highlightLocalDeclaration(localDeclarationPattern: RegExp, documentContent: string) {
  const activeEditor = vscode.window.activeTextEditor!;
  const { document } = activeEditor;

  let decorations: vscode.DecorationOptions[] = [];
  do {
    let match = localDeclarationPattern.exec(documentContent);

    if (!match) { break; }

    const startPos = document.positionAt(match.index);
    const endPos = document.positionAt(match.index + match[0].length);
    const range = new vscode.Range(startPos, endPos);
    const decoration = { range, hoverMessage: 'This is the local declaration.' };
    decorations.push(decoration);
  } while(true);

  activeEditor.setDecorations(highlightDecorationType, decorations);

  // Scroll to the first highlight if there is at least one
  if (decorations.length > 0) {
    const firstHighlightRange = decorations[0].range;
    activeEditor.revealRange(firstHighlightRange, vscode.TextEditorRevealType.InCenter);

    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document === document) {
        // Clear decorations when the document changes
        decorations = [];
        activeEditor.setDecorations(highlightDecorationType, []);
      }
    });

        // Listen for text editor selection change and clear decorations
    vscode.window.onDidChangeTextEditorSelection((event) => {
      // Clear decorations when the user selects a part of the text
      decorations = [];
      activeEditor.setDecorations(highlightDecorationType, []);
    });
  }
}

const contextify = () => {
  const word = getWord();

  if (!word) { return; }

  if (!isTemplate()) {
    vscode.window.showInformationMessage('This command is only available for "*.hbs" files.');
    return;
  }

  const localDeclarationPattern = new RegExp(`as \\|[^|]*${word}[^|]*\\|`, 'g');
  const documentContent = editor()!.document.getText();

  if (localDeclarationPattern.test(documentContent)) {
    highlightLocalDeclaration(localDeclarationPattern, documentContent);
    vscode.window.showInformationMessage('This is a local variable. No context needed.');
    return;
  }

  if (['currentClient', 'currentUser', 'permissions'].includes(word)) {
    thisify();
    return;
  }

  const patterns = [
    new RegExp(`${word}: (computed|alias|filterBy|oneWay|reads|readOnly|and|or|not)`),
    new RegExp(`this\.set\\('${word}',`),
    new RegExp(`set\\(this, '${word}',`),
    new RegExp(`this\.${word} =`),
  ];

  const content: Record<string, string> = siblingContent() ?? {};

  if ((content['route'] || content['controller']) && word !== 'model') {
    thisify();
    return;
  }

  const isLocal = Object.entries(content).some(([type, text]) => {
    return patterns.some(pattern => pattern.test(text));
  });

  if (isLocal) {
    thisify();
    return;
  }

  if (Object.entries(content).some(([, text]) => text.includes(`${word}: `))) {
    vscode.window.showInformationMessage('This case is too difficult for me to figure out.');
    return;
  }

  atify();
};

export default contextify;
