import pandas as pd, sys

class PromptFinder:
    def __init__(self, csv_file):
        self.df = pd.read_csv(csv_file)

    def find(self, search_string):
        result = self.df[self.df["act"] == search_string]["prompt"].values

        if len(result) > 0:
            return result[0]
        else:
            return f"No prompt found for '{search_string}'."


if __name__ == "__main__":
    prompt_finder = PromptFinder("../prompts.csv")
    if not sys.stdin.isatty():
        act_to_search = sys.stdin.readline().rstrip()
    else:
        act_to_search = input("Enter the ACT to search for: ")

    prompt_result = prompt_finder.find(act_to_search)

    print(prompt_result)