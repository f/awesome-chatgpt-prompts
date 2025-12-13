#!/bin/bash

# Script to generate contributor commits from prompts.csv
# Fetches latest prompts from prompts.chat/prompts.csv
# Compares with existing prompts.csv and creates commits only for new prompts

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CSV_FILE="$PROJECT_DIR/prompts.csv"
REMOTE_CSV="$PROJECT_DIR/prompts.csv.remote"
REMOTE_CSV_URL="https://prompts.chat/prompts.csv"

# Fetch latest prompts.csv from prompts.chat
echo "Fetching latest prompts.csv from $REMOTE_CSV_URL..."
if ! curl -fsSL "$REMOTE_CSV_URL" -o "$REMOTE_CSV"; then
    echo "Error: Failed to fetch prompts.csv from $REMOTE_CSV_URL"
    echo "Make sure prompts.chat is running and the endpoint is available."
    exit 1
fi
echo "Successfully fetched remote prompts.csv"

# Initialize local CSV if it doesn't exist
if [ ! -f "$CSV_FILE" ]; then
    echo "Local prompts.csv not found, initializing with header..."
    head -1 "$REMOTE_CSV" > "$CSV_FILE"
    git add "$CSV_FILE"
    git commit -m "Initialize prompts.csv with header" --allow-empty 2>/dev/null || true
fi

echo ""
echo "Comparing local and remote prompts.csv..."

# Process diffs and create commits for new prompts
export PROJECT_DIR
set +e  # Temporarily allow non-zero exit
python3 << 'PYTHON_SCRIPT'
import csv
import subprocess
import os
import io

project_dir = os.environ.get('PROJECT_DIR', '.')
csv_file = os.path.join(project_dir, 'prompts.csv')
remote_csv = os.path.join(project_dir, 'prompts.csv.remote')

# Read existing local prompts (by act title as key)
local_prompts = {}
fieldnames = None
with open(csv_file, 'r', newline='', encoding='utf-8') as f:
    # Normalize CRLF to LF
    content = f.read().replace('\r\n', '\n').replace('\r', '\n')
    reader = csv.DictReader(io.StringIO(content))
    fieldnames = reader.fieldnames
    for row in reader:
        act = row.get('act', '').strip()
        if act:
            local_prompts[act] = row

print(f"Found {len(local_prompts)} existing local prompts")

# Read remote prompts (normalize CRLF to LF)
remote_prompts = []
with open(remote_csv, 'r', newline='', encoding='utf-8') as f:
    content = f.read().replace('\r\n', '\n').replace('\r', '\n')
    reader = csv.DictReader(io.StringIO(content))
    remote_fieldnames = reader.fieldnames
    for row in reader:
        remote_prompts.append(row)

print(f"Found {len(remote_prompts)} remote prompts")

# Use remote fieldnames if local is empty
if not fieldnames:
    fieldnames = remote_fieldnames

# Build set of remote prompt acts for quick lookup
remote_acts = set()
for row in remote_prompts:
    act = row.get('act', '').strip()
    if act:
        remote_acts.add(act)

# Find new, updated, and deleted prompts
new_prompts = []
updated_prompts = []
deleted_prompts = []

# Check for new and updated
for row in remote_prompts:
    act = row.get('act', '').strip()
    if not act:
        continue
    
    if act not in local_prompts:
        new_prompts.append(row)
    else:
        local_row = local_prompts[act]
        # Check if content OR contributors changed
        content_changed = row.get('prompt', '').strip() != local_row.get('prompt', '').strip()
        contributors_changed = row.get('contributor', '').strip() != local_row.get('contributor', '').strip()
        if content_changed or contributors_changed:
            updated_prompts.append((row, local_row))

# Check for deleted (in local but not in remote)
for act, local_row in local_prompts.items():
    if act not in remote_acts:
        deleted_prompts.append(local_row)

print(f"Found {len(new_prompts)} new prompts to add")
print(f"Found {len(updated_prompts)} updated prompts to modify")
print(f"Found {len(deleted_prompts)} prompts to remove (unlisted/deleted)")

if not new_prompts and not updated_prompts and not deleted_prompts:
    print("\nNo changes detected. Already up to date!")
    import sys
    sys.exit(2)  # Exit code 2 = no changes
else:
    # Helper function to parse contributors (supports "user1,user2,user3" format)
    def parse_contributors(contributor_field):
        """Parse contributor field, returns (primary_author, co_authors_list)"""
        if not contributor_field:
            return 'anonymous', []
        
        # Split by comma and clean up
        contributors = [c.strip() for c in contributor_field.split(',') if c.strip()]
        
        if not contributors:
            return 'anonymous', []
        
        primary = contributors[0]
        co_authors = contributors[1:] if len(contributors) > 1 else []
        return primary, co_authors
    
    def build_commit_message(action, act, co_authors):
        """Build commit message with optional co-author trailers"""
        msg = f'{action} prompt: {act}'
        
        if co_authors:
            msg += '\n\n'
            for co_author in co_authors:
                co_email = f"{co_author}@users.noreply.github.com"
                msg += f'Co-authored-by: {co_author} <{co_email}>\n'
        
        return msg
    
    # Process updates first (rewrite entire file with updates applied)
    if updated_prompts:
        print("\nApplying updates to existing prompts...")
        
        # Build updated local_prompts dict
        for remote_row, _ in updated_prompts:
            act = remote_row.get('act', '').strip()
            local_prompts[act] = remote_row
        
        # Rewrite the CSV with updates
        with open(csv_file, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            # Write in order of remote (to maintain order)
            for row in remote_prompts:
                act = row.get('act', '').strip()
                if act in local_prompts:
                    writer.writerow(local_prompts[act])
        
        # Commit updates
        for i, (remote_row, local_row) in enumerate(updated_prompts, 1):
            contributor_field = remote_row.get('contributor', '').strip()
            act = remote_row.get('act', 'Unknown')
            
            primary_author, co_authors = parse_contributors(contributor_field)
            email = f"{primary_author}@users.noreply.github.com"
            
            subprocess.run(['git', 'add', csv_file], check=True)
            
            env = os.environ.copy()
            env['GIT_AUTHOR_NAME'] = primary_author
            env['GIT_AUTHOR_EMAIL'] = email
            env['GIT_COMMITTER_NAME'] = primary_author
            env['GIT_COMMITTER_EMAIL'] = email
            
            commit_msg = build_commit_message('Update', act, co_authors)
            
            subprocess.run([
                'git', 'commit',
                '-m', commit_msg,
                f'--author={primary_author} <{email}>'
            ], env=env, check=True)
            
            co_authors_str = f" (+ {', '.join(co_authors)})" if co_authors else ""
            print(f"[UPDATE {i}/{len(updated_prompts)}] {primary_author}{co_authors_str}: {act}")
    
    # Process new prompts
    if new_prompts:
        print("\nCreating commits for new prompts...")
        
        for i, row in enumerate(new_prompts, 1):
            contributor_field = row.get('contributor', '').strip()
            act = row.get('act', 'Unknown')
            
            primary_author, co_authors = parse_contributors(contributor_field)
            email = f"{primary_author}@users.noreply.github.com"
            
            # Append this row to the CSV
            with open(csv_file, 'a', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writerow(row)
            
            # Stage and commit
            subprocess.run(['git', 'add', csv_file], check=True)
            
            env = os.environ.copy()
            env['GIT_AUTHOR_NAME'] = primary_author
            env['GIT_AUTHOR_EMAIL'] = email
            env['GIT_COMMITTER_NAME'] = primary_author
            env['GIT_COMMITTER_EMAIL'] = email
            
            commit_msg = build_commit_message('Add', act, co_authors)
            
            subprocess.run([
                'git', 'commit',
                '-m', commit_msg,
                f'--author={primary_author} <{email}>'
            ], env=env, check=True)
            
            co_authors_str = f" (+ {', '.join(co_authors)})" if co_authors else ""
            print(f"[NEW {i}/{len(new_prompts)}] {primary_author}{co_authors_str}: {act}")
    
    # Process deleted prompts (remove from CSV, commit with original author)
    if deleted_prompts:
        print("\nRemoving unlisted/deleted prompts...")
        
        for i, row in enumerate(deleted_prompts, 1):
            contributor_field = row.get('contributor', '').strip()
            act = row.get('act', 'Unknown')
            
            primary_author, co_authors = parse_contributors(contributor_field)
            email = f"{primary_author}@users.noreply.github.com"
            
            # Remove this prompt from local_prompts
            if act in local_prompts:
                del local_prompts[act]
            
            # Rewrite CSV without the deleted prompt
            with open(csv_file, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                for remaining_act, remaining_row in local_prompts.items():
                    writer.writerow(remaining_row)
            
            # Stage and commit
            subprocess.run(['git', 'add', csv_file], check=True)
            
            env = os.environ.copy()
            env['GIT_AUTHOR_NAME'] = primary_author
            env['GIT_AUTHOR_EMAIL'] = email
            env['GIT_COMMITTER_NAME'] = primary_author
            env['GIT_COMMITTER_EMAIL'] = email
            
            commit_msg = build_commit_message('Remove', act, co_authors)
            
            subprocess.run([
                'git', 'commit',
                '-m', commit_msg,
                f'--author={primary_author} <{email}>'
            ], env=env, check=True)
            
            co_authors_str = f" (+ {', '.join(co_authors)})" if co_authors else ""
            print(f"[REMOVE {i}/{len(deleted_prompts)}] {primary_author}{co_authors_str}: {act}")
    
    print(f"\nDone! Created {len(new_prompts)} new, {len(updated_prompts)} update, {len(deleted_prompts)} remove commits.")

PYTHON_SCRIPT
PYTHON_EXIT=$?
set -e  # Re-enable exit on error

# Clean up
rm -f "$REMOTE_CSV"

# Exit early if no changes (Python exited with code 2)
if [ $PYTHON_EXIT -eq 2 ]; then
    echo ""
    echo "Nothing to commit or push."
    exit 0
fi

# Check for actual Python errors
if [ $PYTHON_EXIT -ne 0 ]; then
    echo "Error: Script failed with exit code $PYTHON_EXIT"
    exit 1
fi

echo ""
echo "Review with: git log --oneline prompts.csv"
echo ""
echo "To push: git push origin main"
