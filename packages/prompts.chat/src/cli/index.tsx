import React, { useState } from 'react';
import { render } from 'ink';
import meow from 'meow';
import clipboardy from 'clipboardy';
import { spawn } from 'child_process';
import { PromptList } from './components/PromptList.js';
import { PromptDetail } from './components/PromptDetail.js';
import type { Prompt } from './api.js';
import { createNew } from './new.js';

type View = 'list' | 'detail';

interface AppState {
  view: View;
  selectedPrompt: Prompt | null;
  searchQuery: string;
  page: number;
  selectedCategory: string | null;
  selectedIndex: number;
}

function App() {
  const [state, setState] = useState<AppState>({
    view: 'list',
    selectedPrompt: null,
    searchQuery: '',
    page: 1,
    selectedCategory: null,
    selectedIndex: 0,
  });

  const handleSelectPrompt = (prompt: Prompt) => {
    setState(prev => ({
      ...prev,
      view: 'detail',
      selectedPrompt: prompt,
    }));
  };

  const handleBack = () => {
    setState(prev => ({
      ...prev,
      view: 'list',
      selectedPrompt: null,
    }));
  };

  const handleSearchChange = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, page }));
  };

  const handleCategoryChange = (category: string | null) => {
    setState(prev => ({ ...prev, selectedCategory: category, page: 1, selectedIndex: 0 }));
  };

  const handleIndexChange = (index: number) => {
    setState(prev => ({ ...prev, selectedIndex: index }));
  };

  const handleCopy = async (content: string) => {
    try {
      await clipboardy.write(content);
    } catch {
      // Clipboard might not be available in some environments
    }
  };

  const handleQuit = () => {
    process.exit(0);
  };

  if (state.view === 'detail' && state.selectedPrompt) {
    return (
      <PromptDetail
        prompt={state.selectedPrompt}
        onBack={handleBack}
        onCopy={handleCopy}
      />
    );
  }

  return (
    <PromptList
      onSelect={handleSelectPrompt}
      onQuit={handleQuit}
      searchQuery={state.searchQuery}
      onSearchChange={handleSearchChange}
      page={state.page}
      onPageChange={handlePageChange}
      selectedCategory={state.selectedCategory}
      onCategoryChange={handleCategoryChange}
      selectedIndex={state.selectedIndex}
      onIndexChange={handleIndexChange}
    />
  );
}

const cli = meow(`
  Usage
    $ prompts-chat [command] [options]

  Commands
    (default)     Launch interactive TUI
    new <dir>     Create a new prompts.chat instance
    mcp           Start MCP server for AI tools

  Options
    --help        Show this help
    --version     Show version

  Navigation (TUI)
    ↑/↓ or j/k    Navigate list
    Enter         Select prompt
    /             Search prompts
    n/p           Next/Previous page
    r             Run prompt (open in ChatGPT, Claude, etc.)
    c             Copy prompt (with variable filling)
    C             Copy raw prompt
    o             Open in browser
    b             Go back
    q             Quit

  Examples
    $ npx prompts.chat
    $ npx prompts.chat new my-prompts
    $ prompts-chat
`, {
  importMeta: import.meta,
  flags: {},
});

async function main() {
  const [command, ...args] = cli.input;

  // Handle 'new' command
  if (command === 'new') {
    const directory = args[0];
    if (!directory) {
      console.error('\n❌ Please specify a directory name.\n');
      console.error('   Usage: npx prompts.chat new <directory>\n');
      process.exit(1);
    }
    await createNew({ directory });
    return;
  }

  // Handle 'mcp' command - proxy to @fkadev/prompts.chat-mcp
  if (command === 'mcp') {
    const child = spawn('npx', ['-y', '@fkadev/prompts.chat-mcp', ...args], {
      stdio: 'inherit',
      shell: true,
    });
    child.on('close', (code) => process.exit(code ?? 0));
    return;
  }

  // Default: Launch interactive TUI
  console.clear();
  
  const { waitUntilExit } = render(<App />, {
    exitOnCtrlC: true,
  });
  
  waitUntilExit().then(() => {
    console.clear();
  });
}

main();
