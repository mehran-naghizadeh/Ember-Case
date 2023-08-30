// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

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
    case text.indexOf('{{') === 0:
      return convertTag(text);
    case text.includes(':') || text.includes('='):
      return convertAssignment(text);
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

function convertAssignment(text: string): string {
  const isThisable = (x: string) => !['true', 'false', 'undefined'].includes(x);
  const addThis = (x: string) => (isThisable(x) ? 'this.' : '') + x;
  const rhs = (x: string) => isNumber(x) ? x : wrapInCurlyBraces(addThis(x));

  return text
    .replace(/(\w+)=\s*\(*true\)*/, `@$1={{true}}`)
    .replace(/(\w+)=\s*\(*false\)*/, `@$1={{false}}`)
    .replace(/(\w+)=\s*\(*undefined\)*/, `@$1={{undefined}}`)
    .replace(/(\w+):\s*(\w+)\,/, '$1 = $2;')
    .replace(/(\w+)=\s*(\d+)/, '@$1=$2')
    .replace(/(\w+)=\s*\((.+)\)/, '@$1={{$2}}')
    .replace(/(\w+)=\s*(\D\w+)/, '@$1={{this.$2}}')
    .replace('{{true}}', 'true')
    .replace('{{false}}', 'false')
    .replace('{{undefined}}', 'undefined')
    .replace(/@(class|placeholder)=/, '@$1=');
  }

function convertTag(text: string): string {
  return text.replace('{{#', '{{').split(/\s+/)
    .map((part: string) => {
      switch(true) {
        case part.includes('='):
          return assignmentCase(part);
        case part.indexOf('{{') === 0:
          return `<${emberPascalCase(part.slice(2))}`;
        case part.indexOf('}}') === part.length - 2:
          return `${emberPascalCase(part.slice(0, part.length - 2))}>`;
        default:
          break;
      }

      return part;
    })
    .join(' ');
}

function assignmentCase(input: string): string {
  const [left, right] = input.split('=');

  const LHS = (left.charAt(0) === '@') ? left : ('@' + left);
  const sanitizedRight = right.replace('}}', '');

  const isQuoted = ['"', "'"].includes(sanitizedRight.charAt(0));
  const RHS = isNumber(sanitizedRight)
    ? Number(sanitizedRight)
    : (isQuoted ? wrapInProperQuotes(sanitizedRight, left) :  wrapInCurlyBraces(sanitizedRight));

  return `${LHS}=${RHS}` + (sanitizedRight === right ? '' : '>');
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
