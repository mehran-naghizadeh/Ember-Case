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
  return editor()?.document.fileName.endsWith('template.hbs') ?? false;
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

const contextify = () => {
  const word = getWord();

  if (!word) { return; }

  if (['currentClient', 'currentUser', 'permissions'].includes(word)) {
    thisify();
    return;
  }

  if (!isTemplate()) {
    vscode.window.showInformationMessage('This command is only available for "template.hbs" files.');
    return;
  }

  const patterns = [
    new RegExp(`${word}: (computed|alias|oneWay|reads|and|or|not)`),
    new RegExp(`this\.set\\('${word}',`),
    new RegExp(`set\\(this, '${word}',`),
    new RegExp(`this\.${word} =`),
  ];

  const content: Record<string, string> = siblingContent() ?? {};

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
