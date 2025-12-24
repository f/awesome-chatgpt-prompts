#!/bin/bash

# Script to rewrite PROMPTS.md git history from scratch
# Uses contributor blame info from prompts.csv to create commits with correct authors and dates

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CSV_FILE="$PROJECT_DIR/prompts.csv"
PROMPTS_MD="$PROJECT_DIR/PROMPTS.md"

if [ ! -f "$CSV_FILE" ]; then
    echo "Error: prompts.csv not found at $CSV_FILE"
    exit 1
fi

echo "This script will rewrite PROMPTS.md git history from prompts.csv blame data."
echo "WARNING: This will modify git history. Make sure you're on a clean branch."
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Remove existing PROMPTS.md and its history entry
if [ -f "$PROMPTS_MD" ]; then
    rm "$PROMPTS_MD"
    git add "$PROMPTS_MD" 2>/dev/null || true
fi

export PROJECT_DIR CSV_FILE PROMPTS_MD

python3 << 'PYTHON_SCRIPT'
import csv
import subprocess
import os
import io
import re
from datetime import datetime

project_dir = os.environ.get('PROJECT_DIR', '.')
csv_file = os.environ.get('CSV_FILE')
prompts_md = os.environ.get('PROMPTS_MD')

def get_all_blame_info():
    """Get all git blame info from prompts.csv in one call"""
    blame_map = {}  # Maps act title to (author, email, date)
    
    try:
        result = subprocess.run(
            ['git', 'blame', '--porcelain', csv_file],
            capture_output=True, text=True, check=True,
            cwd=project_dir
        )
        
        lines = result.stdout.split('\n')
        current_author = None
        current_email = None
        current_date = None
        
        i = 0
        while i < len(lines):
            line = lines[i]
            
            if re.match(r'^[0-9a-f]{40}', line):
                current_author = None
                current_email = None
                current_date = None
            elif line.startswith('author '):
                current_author = line[7:]
            elif line.startswith('author-mail '):
                current_email = line[12:].strip('<>')
            elif line.startswith('author-time '):
                timestamp = int(line[12:])
                current_date = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%dT%H:%M:%S')
            elif line.startswith('\t'):
                content = line[1:]
                # Skip header line
                if not content.startswith('act,'):
                    # Extract act title from CSV line
                    # Handle quoted and unquoted formats
                    if content.startswith('"'):
                        # Quoted: "Act Title","prompt..."
                        match = re.match(r'^"([^"]*)"', content)
                        if match:
                            act = match.group(1)
                            blame_map[act] = (current_author, current_email, current_date)
                    else:
                        # Unquoted: Act Title,prompt...
                        act = content.split(',')[0]
                        if act:
                            blame_map[act] = (current_author, current_email, current_date)
            
            i += 1
        
        return blame_map
    except Exception as e:
        print(f"Warning: Could not get blame info: {e}")
        return {}

def format_contributor_links(contributor_field):
    """Format contributors as GitHub profile links"""
    if not contributor_field:
        return '@anonymous'
    
    contributors = [c.strip() for c in contributor_field.split(',') if c.strip()]
    if not contributors:
        return '@anonymous'
    
    return ', '.join([f'[@{c}](https://github.com/{c})' for c in contributors])

def generate_prompt_block(row):
    """Generate a single prompt's <details> block"""
    act = row.get('act', 'Untitled')
    prompt = row.get('prompt', '')
    contributor = row.get('contributor', '')
    prompt_type = row.get('type', 'TEXT').upper()
    
    if prompt_type == 'TEXT':
        lang = 'md'
    elif prompt_type == 'JSON':
        lang = 'json'
    elif prompt_type == 'YAML':
        lang = 'yaml'
    else:
        lang = 'md'
    
    contributor_links = format_contributor_links(contributor)
    
    block = f'<details>\n'
    block += f'<summary><strong>{act}</strong></summary>\n\n'
    block += f'## {act}\n\n'
    block += f'Contributed by {contributor_links}\n\n'
    block += f'```{lang}\n'
    block += f'{prompt}\n'
    block += f'```\n\n'
    block += f'</details>\n\n'
    return block

def parse_contributors(contributor_field):
    """Parse contributor field, returns (primary_author, co_authors_list)"""
    if not contributor_field:
        return 'anonymous', []
    
    contributors = [c.strip() for c in contributor_field.split(',') if c.strip()]
    
    if not contributors:
        return 'anonymous', []
    
    primary = contributors[0]
    co_authors = contributors[1:] if len(contributors) > 1 else []
    return primary, co_authors

# Read all prompts from CSV
prompts = []
with open(csv_file, 'r', newline='', encoding='utf-8') as f:
    content = f.read().replace('\r\n', '\n').replace('\r', '\n')
    reader = csv.DictReader(io.StringIO(content))
    for row in reader:
        act = row.get('act', '').strip()
        if act:
            prompts.append(row)

print(f"Found {len(prompts)} prompts in CSV")
print("Getting blame info from prompts.csv (single call)...")

# Get all blame info in one call
blame_map = get_all_blame_info()
print(f"Got blame info for {len(blame_map)} prompts")

# Match blame info to prompts
prompt_blame_info = []
for row in prompts:
    act = row.get('act', '')
    author, email, date = blame_map.get(act, (None, None, None))
    prompt_blame_info.append({
        'row': row,
        'author': author,
        'email': email,
        'date': date
    })

# Sort by date (oldest first) so commits appear in chronological order
prompt_blame_info.sort(key=lambda x: x['date'] or '9999-99-99')

print(f"\nCreating PROMPTS.md with {len(prompt_blame_info)} commits...")

# Initialize PROMPTS.md with header
with open(prompts_md, 'w', encoding='utf-8') as f:
    f.write('# Awesome ChatGPT Prompts\n\n')
    f.write('> A curated list of prompts for ChatGPT and other AI models.\n\n')
    f.write('---\n\n')

# Commit the header
subprocess.run(['git', 'add', prompts_md], check=True, cwd=project_dir)
subprocess.run([
    'git', 'commit', '-m', 'Initialize PROMPTS.md',
    '--allow-empty'
], check=True, cwd=project_dir)

print("[INIT] Created PROMPTS.md header")

# Create commits for each prompt
for i, info in enumerate(prompt_blame_info, 1):
    row = info['row']
    act = row.get('act', 'Unknown')
    contributor_field = row.get('contributor', '').strip()
    
    # Get author info from blame or fall back to contributor field
    blame_author = info['author']
    blame_email = info['email']
    blame_date = info['date']
    
    primary_author, co_authors = parse_contributors(contributor_field)
    
    # Use blame info if available, otherwise use contributor field
    if blame_author and blame_author != 'Not Committed Yet':
        author_name = blame_author
        author_email = blame_email or f"{primary_author}@users.noreply.github.com"
    else:
        author_name = primary_author
        author_email = f"{primary_author}@users.noreply.github.com"
    
    # Append this prompt to PROMPTS.md
    block = generate_prompt_block(row)
    with open(prompts_md, 'a', encoding='utf-8') as f:
        f.write(block)
    
    # Stage the change
    subprocess.run(['git', 'add', prompts_md], check=True, cwd=project_dir)
    
    # Build commit message
    commit_msg = f'Add prompt: {act}'
    if co_authors:
        commit_msg += '\n\n'
        for co_author in co_authors:
            co_email = f"{co_author}@users.noreply.github.com"
            commit_msg += f'Co-authored-by: {co_author} <{co_email}>\n'
    
    # Set environment for author info
    env = os.environ.copy()
    env['GIT_AUTHOR_NAME'] = author_name
    env['GIT_AUTHOR_EMAIL'] = author_email
    env['GIT_COMMITTER_NAME'] = author_name
    env['GIT_COMMITTER_EMAIL'] = author_email
    
    # Set commit date if we have it from blame
    if blame_date:
        env['GIT_AUTHOR_DATE'] = blame_date
        env['GIT_COMMITTER_DATE'] = blame_date
    
    # Commit with the original author
    subprocess.run([
        'git', 'commit',
        '-m', commit_msg,
        f'--author={author_name} <{author_email}>'
    ], env=env, check=True, cwd=project_dir)
    
    co_authors_str = f" (+ {', '.join(co_authors)})" if co_authors else ""
    date_str = f" [{blame_date[:10]}]" if blame_date else ""
    print(f"[{i}/{len(prompt_blame_info)}] {author_name}{co_authors_str}: {act}{date_str}")

print(f"\nDone! Created {len(prompt_blame_info)} commits for PROMPTS.md")
print("\nReview with: git log --oneline PROMPTS.md")
print("Check blame with: git blame PROMPTS.md")

PYTHON_SCRIPT

echo ""
echo "PROMPTS.md history has been rewritten!"
echo ""
echo "Review with: git log --oneline PROMPTS.md"
echo "Check blame with: git blame PROMPTS.md"
