import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.grapesjsOpen', () => {
    const panel = vscode.window.createWebviewPanel(
      'grapesjs',
      'GrapesJS',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'build'))],
      }
    );

    const scriptPathOnDisk = vscode.Uri.file(
      path.join(context.extensionPath, 'build', 'grapes.min.js')
    );

    const scriptUri = panel.webview.asWebviewUri(scriptPathOnDisk);

    panel.webview.html = getWebviewContent(scriptUri);
  });

  context.subscriptions.push(disposable);
}

function getWebviewContent(scriptUri: vscode.Uri) {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GrapesJS</title>
    </head>
    <body>
        <div id="gjs"></div>
        <script src="${scriptUri}"></script>
        <script>
          const editor = grapesjs.init({
              container: '#gjs',
              fromElement: true,
              height: '100%',
              width: 'auto',
              storageManager: { type: null },
          });
        </script>
    </body>
    </html>`;
}

export function deactivate() {}
