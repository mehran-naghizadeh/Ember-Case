// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Pattern x=y.yy z=5 class="w-8 h-2 whatever"
const pattern = /\s+(?=(?:(?:[^"]*"){2})*[^"]*$)/g;

// Pattern: {{/some/where/quite-strange/some-thing}}
const blockClosingPattern = /^{{\/([\w/-]+)}}$/;
const blockStartingPattern = /^{{#([\w/-]+)([^}}]*)(}})?$/;
const multilinerStartingPattern = /^{{(?!\/)([\w/-]+)([^}}]*)$/;
const onelinerPattern = /^{{(?!\/)([\w/-]+)(.*)}}$/;
const assignmentsLinePattern = /^((\w+=[^\s]+)\s?)+$/;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "embercase" is now active!');
  
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand('embercase.emberCase', () => {
    // The code you place here will be executed every time your command is executed
    const editor = vscode.window.activeTextEditor;

    if (!editor) { return; }

    const { document, selection } = editor;
    const line = document.lineAt(selection.active.line);
    const text = line.text;

    const indentSteps = text.indexOf(text.trim());
    const indentation = new Array(indentSteps + 1).join(' ');

    editor.edit((editBuilder: vscode.TextEditorEdit) => {
      editBuilder.replace(line.range, `${indentation}${convertedText(text.trim())}`);
    });
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function convertedText(text: string): string {
  switch(true) {
    case text === '}}':
      return '/>';
    case blockClosingPattern.test(text):
      return convertBlockClosing(text);
    case onelinerPattern.test(text):
    case blockStartingPattern.test(text):
    case multilinerStartingPattern.test(text):
      return convertTag(text);
    case assignmentsLinePattern.test(text):
      return text.split(pattern).map(p => assignmentCase(p)).join(' ');
    case text.includes('this.get('):
      return convertGet(text);
    default:
      break;
  }

  return text;
}

function convertGet(text: string): string {
  return text
    .replace(/this\.get\('(\w+)\./, "this.$1.get('")
    .replace(/this\.get\('(\w+)\'\)/, 'this.$1');
}

function convertTag(text: string): string {
  const isOneliner = onelinerPattern.test(text);

  return text.replace('}}', isOneliner ? ' />' : '>').split(pattern)
    .map((part: string) => {
      switch(true) {
        case part.includes('='):
          return assignmentCase(part);
        case part.indexOf('{{#') === 0:
          return `<${emberPascalCase(part.slice(3))}`;
        case part.indexOf('{{') === 0:
          return `<${emberPascalCase(part.slice(2))}`;
        case part.indexOf('}}') === part.length - 2:
          return `${emberPascalCase(part.slice(0, part.length - 2))}${isOneliner ? ' />' : '>'}`;
        default:
          break;
      }

      return part;
    })
    .join(' ');
}

function convertBlockClosing(text: string) {
  return text.replace(blockClosingPattern, (match, path) => `</${emberPascalCase(path)}>`);
}

function assignmentCase(input: string): string {
  console.log(`Assignment: ${input}`);

  const [left, right] = input.split('=');

  const LHS = (left.charAt(0) === '@' || left === 'class') ? left : ('@' + left);
  const sanitizedRight = right.replace('}}', '');

  const isQuoted = ['"', "'"].includes(sanitizedRight.charAt(0));
  const RHS = isNumber(sanitizedRight)
    ? Number(sanitizedRight)
    : (isQuoted ? wrapInProperQuotes(sanitizedRight, left) :  wrapInCurlyBraces(sanitizedRight));

  return [LHS,RHS].join('=');
}

function isNumber(x: string): boolean {
  return !isNaN(Number(x));
}

function wrapInCurlyBraces(input: string): string {
  return wrapBy(input, '{{', '}}')
    .replace('{{{{', '{{')
    .replace('}}}}', '}}');
}

function wrapInProperQuotes(input: string, name: string): string {
  return wrapInDoubleQuotes(input);
}

function wrapInDoubleQuotes(input: string): string {
  return wrapBy(input.slice(1, input.length - 1), '"');
}

function wrapInSingleQuotes(input: string): string {
  return wrapBy(input.slice(1, input.length - 1), "'");
}

function wrapBy(input: string, openWrapper: string, closeWrapper: string | undefined = undefined): string {
  return `${openWrapper}${input}${closeWrapper ?? openWrapper}`;
}

function emberPascalCase(input: string) {
  return input.split('/').map((piece: string) => pascalCase(piece)).join('::');
}

function pascalCase(input: string): string {
  return input
    .split('-')
    .map((word: string) => upperFirstCase(word))
    .join('');
}

function upperFirstCase(word: string): string {
  const firstLetter = word.charAt(0);
  const rest = word.slice(1);

  return `${firstLetter.toUpperCase()}${rest}`;
}
