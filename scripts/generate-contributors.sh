#!/bin/bash

# Script to generate contributor commits from prompts.csv
# Each contributor will have one commit attributed to them so they appear in GitHub's contributors list

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CSV_FILE="$PROJECT_DIR/prompts.csv"
CONTRIBUTORS_FILE="$PROJECT_DIR/CONTRIBUTORS.md"

if [ ! -f "$CSV_FILE" ]; then
    echo "Error: prompts.csv not found at $CSV_FILE"
    exit 1
fi

# Extract unique contributors from CSV
echo "Extracting contributors from prompts.csv..."

contributors=$(python3 -c "
import csv
contributors = set()
with open('$CSV_FILE', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if 'contributor' in row and row['contributor']:
            contributors.add(row['contributor'].strip())
for c in sorted(contributors):
    print(c)
")

# Count contributors
count=$(echo "$contributors" | wc -l | tr -d ' ')
echo "Found $count unique contributors"

# Generate CONTRIBUTORS.md file
echo "# Contributors" > "$CONTRIBUTORS_FILE"
echo "" >> "$CONTRIBUTORS_FILE"
echo "Thank you to all the contributors who have helped make this project better!" >> "$CONTRIBUTORS_FILE"
echo "" >> "$CONTRIBUTORS_FILE"

i=1
while IFS= read -r username; do
    if [ -n "$username" ]; then
        echo "- [@$username](https://github.com/$username)" >> "$CONTRIBUTORS_FILE"
    fi
done <<< "$contributors"

echo "" >> "$CONTRIBUTORS_FILE"
echo "---" >> "$CONTRIBUTORS_FILE"
echo "*This file is auto-generated from prompts.csv*" >> "$CONTRIBUTORS_FILE"

# Stage the file
git add "$CONTRIBUTORS_FILE"

# Create commits for each contributor
echo ""
echo "Creating commits for each contributor..."

i=1
while IFS= read -r username; do
    if [ -n "$username" ]; then
        email="${username}@users.noreply.github.com"
        
        # Amend or create commit with contributor as author
        # We use --allow-empty to create empty commits if needed
        # Each contributor gets credited by adding their line specifically
        
        # Create a unique change for this contributor
        echo "[$i/$count] Adding contributor: $username"
        
        # Use git commit with author override
        GIT_AUTHOR_NAME="$username" \
        GIT_AUTHOR_EMAIL="$email" \
        GIT_COMMITTER_NAME="$username" \
        GIT_COMMITTER_EMAIL="$email" \
        git commit --allow-empty -m "Add prompt contribution from @$username" \
            --author="$username <$email>"
        
        ((i++))
    fi
done <<< "$contributors"

echo ""
echo "Done! Created $count contributor commits."
echo "Review with: git log --oneline -n $count"
echo ""
echo "To push: git push origin main"
