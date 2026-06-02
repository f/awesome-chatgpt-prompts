import { describe, expect, it } from 'vitest';
import { buildUrl, codePlatforms } from '../cli/platforms';

describe('platform URL builder', () => {
  it('builds VS Code Copilot Chat deep links with encoded prompts', () => {
    const vscode = codePlatforms.find((platform) => platform.id === 'vscode');
    const insiders = codePlatforms.find((platform) => platform.id === 'vscode-insiders');

    expect(vscode).toBeDefined();
    expect(insiders).toBeDefined();
    expect(vscode?.baseUrl).toBe('vscode://GitHub.Copilot-Chat/chat');
    expect(insiders?.baseUrl).toBe('vscode-insiders://GitHub.Copilot-Chat/chat');

    expect(buildUrl('vscode', vscode!.baseUrl, 'Review this code & explain it')).toBe(
      'vscode://GitHub.Copilot-Chat/chat?prompt=Review%20this%20code%20%26%20explain%20it',
    );
    expect(buildUrl('vscode-insiders', insiders!.baseUrl, '/fix failing tests')).toBe(
      'vscode-insiders://GitHub.Copilot-Chat/chat?prompt=%2Ffix%20failing%20tests',
    );
  });
});
