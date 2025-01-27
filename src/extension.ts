import * as vscode from 'vscode';
import * as childProcess from 'child_process';

//212.77.100.101
// degram

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('alive-checker.pingIp', async () => {
        const ipAddress = await vscode.window.showInputBox({
            placeHolder: 'Enter IP Address (e.g., 192.168.1.1)',
            prompt: 'Provide an IP address for ping',
            validateInput: (value: string): string | null => {
                const ipRegex = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;
                return ipRegex.test(value) ? null : 'Invalid IP address';
            }
        });

        if (!ipAddress) {
            vscode.window.showWarningMessage('No IP address was entered!');
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'pingPanel',
            `Ping ${ipAddress}`,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
            }
        );

        panel.webview.html = getWebviewContent(ipAddress);

        let intervalId: NodeJS.Timeout | null = null;

        panel.webview.onDidReceiveMessage(
            (message) => {
                if (message.command === 'ping') {
                    runPing(ipAddress, (output) => {
                        panel.webview.postMessage({ command: 'pingResult', data: output });
                    });
                } else if (message.command === 'pingWithTTL') {
                    runPing(`-i 128 ${ipAddress}`, (output) => {
                        panel.webview.postMessage({ command: 'pingResult', data: output });
                    });
                } else if (message.command === 'pingLargePacket') {
                    runPing(`${ipAddress} -l 1024`, (output) => {
                        panel.webview.postMessage({ command: 'pingResult', data: output });
                    });
                } else if (message.command === 'startInterval') {
                    const interval = message.interval || 5000;
                    if (intervalId) {
                        clearInterval(intervalId);
                    }
                    intervalId = setInterval(() => {
                        runPing(ipAddress, (output) => {
                            panel.webview.postMessage({ command: 'pingResult', data: output });
                        });
                    }, interval);
                } else if (message.command === 'stopInterval') {
                    if (intervalId) {
                        clearInterval(intervalId);
                        intervalId = null;
                    }
                } else if (message.command === 'clearConsole') {
                    panel.webview.postMessage({ command: 'clearOutput' });
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(ipAddress: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ping Options</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }
            h1 {
                color: #333;
            }
            button {
                background-color: #28a745;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                margin-right: 10px;
                margin-bottom: 10px;
            }
            button:hover {
                background-color: #218838;
            }
            #clearButton {
                background-color: #dc3545;
                margin-top: 20px;
            }
            #clearButton:hover {
                background-color: #c82333;
            }
            #output {
                margin-top: 20px;
                font-family: monospace;
                white-space: pre-wrap;
                border: 1px solid #ccc;
                padding: 10px;
                border-radius: 5px;
                background: #000;
                color: #fff;
                max-height: 200px;
                overflow-y: auto;
            }
            #intervalInput {
                margin-top: 20px;
            }
            input[type="number"] {
                padding: 8px 10px;
                font-size: 14px;
                border: 1px solid #ccc;
                border-radius: 5px;
                width: 100px;
                margin-right: 10px;
            }
        </style>
    </head>
    <body>
        <h1>Ping Address: ${ipAddress}</h1>
        <button id="pingButton">Standard Ping</button>
        <button id="pingWithTTL">Ping with TTL</button>
        <button id="pingLargePacket">Ping with Large Packet (1024 bytes)</button>
        <div id="output">No response yet...</div>
        <div id="intervalInput">
            <h3>Set Interval</h3>
            <input type="number" id="interval" value="5000" placeholder="Interval (ms)" />
            <button id="startInterval">Start Interval Ping</button>
            <button id="stopInterval">Stop Interval</button>
            <button id="clearButton">Clear Console</button>
        </div>

        <script>
            const vscode = acquireVsCodeApi();

            document.getElementById('pingButton').addEventListener('click', () => {
                vscode.postMessage({ command: 'ping' });
            });

            document.getElementById('pingWithTTL').addEventListener('click', () => {
                vscode.postMessage({ command: 'pingWithTTL' });
            });

            document.getElementById('pingLargePacket').addEventListener('click', () => {
                vscode.postMessage({ command: 'pingLargePacket' });
            });

            document.getElementById('startInterval').addEventListener('click', () => {
                const interval = parseInt(document.getElementById('interval').value, 10);
                vscode.postMessage({ command: 'startInterval', interval });
            });

            document.getElementById('stopInterval').addEventListener('click', () => {
                vscode.postMessage({ command: 'stopInterval' });
            });

            document.getElementById('clearButton').addEventListener('click', () => {
                vscode.postMessage({ command: 'clearConsole' });
            });

            window.addEventListener('message', (event) => {
                const message = event.data;
                if (message.command === 'pingResult') {
                    const outputDiv = document.getElementById('output');
                    outputDiv.innerText += '\\n' + message.data;
                    outputDiv.scrollTop = outputDiv.scrollHeight;
                } else if (message.command === 'clearOutput') {
                    const outputDiv = document.getElementById('output');
                    outputDiv.innerText = '';
                }
            });
        </script>
    </body>
    </html>
    `;
}

function runPing(command: string, callback: (output: string) => void): void {
    const pingCommand = process.platform === 'win32' ? `ping ${command}` : `ping ${command}`;
    childProcess.exec(pingCommand, (error, stdout, stderr) => {
        if (error) {
            callback(`Error: ${stderr || error.message}`);
        } else {
            callback(stdout);
        }
    });
}

export function deactivate() {}
