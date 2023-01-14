import csv
import json
import sys

snippets = []

# Open the CSV file and read the data
with open("../prompts.csv", "r") as file:
    reader = csv.reader(file)
    for row in reader:
        # Extract the snippet information from the row
        name = row[0]
        description = row[1]
        # Create the snippet template
        snippet = {name.lower():''}
        snippet[name.lower()] = {
            "scope": "markdown,python,txt",
            "prefix": name.lower(),
            "body": [description],
            "description": name
        }
        # Add the snippet to the list
        snippets.append(snippet)

# Write the snippets to the Visual Studio Code snippets file
# Where sys.argv[1] is the location of your snippets config file.
# Usually in .vscode folder
# Example: python3 csv_to_vs_snippets.py ./.vscode/chat_gpt_snippets.code-snippets
with open(sys.argv[1], "w") as file:
    file.write('{')
    for snippet in snippets:
        snippet_key = list(snippet.keys())[0]
        if snippet_key == 'act':
            continue # Skips CSV fields.
        file.write(f'"{snippet_key}":')
        file.write(json.dumps(snippet[snippet_key], indent=4))
        file.write(',')
    file.write('}')
