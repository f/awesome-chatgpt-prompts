#!/usr/bin/python
# -*- coding: utf-8 -*-

import os
import sys

import pandas as pd


class PromptFinder:
    """
    A class to search for prompts based on a given action from a CSV file.
    """

    def __init__(self, csv_file_path=None):
        """
        Initialize the PromptFinder with a CSV file path.
        """
        self.csv_file_path = csv_file_path or self.get_default_csv_path()
        if self.csv_file_path is None:
            sys.exit("Error: CSV file not found in default paths or specified path.")
        try:
            self.df = pd.read_csv(self.csv_file_path)
        except FileNotFoundError:
            sys.exit(f"Error: CSV file '{self.csv_file_path}' not found.")

    @staticmethod
    def get_default_csv_path():
        """
        Returns the first existing default CSV path, or None if none found.
        """
        default_paths = ["../prompts.csv", "./prompts.csv"]
        return next((path for path in default_paths if os.path.exists(path)), None)

    def find_prompt(self, search_string):
        """
        Find prompts based on the search_string.
        :param search_string: The action to search for in the CSV.
        :return: The found prompts or a message if no prompt is found.
        """
        filtered_df = self.df[
            self.df["act"].str.lower().str.contains(search_string.lower())
        ]
        if len(filtered_df) > 0:
            return filtered_df[["act", "prompt"]]
        else:
            return f"No prompt found for '{search_string}'."

    @staticmethod
    def display_and_select_prompt(results):
        """
        Display prompts and allow user to select one.
        :param results: DataFrame of found prompts.
        """
        try:
            if isinstance(results, str):
                print(results)  # No prompt found
            elif len(results) == 1:
                # Automatically select if only one prompt is found
                return results.iloc[0]["prompt"]
            else:
                for idx, row in enumerate(results.itertuples(), 1):  # Use enumerate for sequential numbering
                    print(f"{idx}. {row.act}: {row.prompt}")
                choice = int(input("Select a prompt number: "))
                return results.iloc[choice - 1]["prompt"]
        except KeyboardInterrupt:
            print("\nOperation cancelled by the user.")
            sys.exit(0)


if __name__ == "__main__":
    try:
        csv_file_path = sys.argv[1] if len(sys.argv) > 1 else None
        prompt_finder = PromptFinder(csv_file_path)

        if not sys.stdin.isatty():
            act_to_search = sys.stdin.readline().strip()
        else:
            act_to_search = input("Enter the ACT to search for: ")

        found_prompts = prompt_finder.find_prompt(act_to_search)
        if isinstance(found_prompts, str):
            print(found_prompts)
        else:
            selected_prompt = prompt_finder.display_and_select_prompt(found_prompts)
            print(f"Selected Prompt: {selected_prompt}")
    except KeyboardInterrupt:
        print("\nScript interrupted by the user.")
        sys.exit(0)
