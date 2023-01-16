import random
import markdown
import black
from tqdm import tqdm
import mistune
import os
import re
import pandas as pd
import csv
import numpy as np
import random


def collect_badges(directory="./data/prompts/specific_topics"):
    # Create dynamic badges for middle section
    badges = []
    badge_texts = []
    badge_count = len(os.listdir(directory))
    for i in tqdm(range(badge_count)):
        badge_color = random.choice(
            [
                "brightgreen",
                "green",
                "yellowgreen",
                "darkred",
                "lightblue",
                "darkgreen",
                "purple",
                "yellow",
                "orange",
                "red",
                "blue",
                "lightgrey",
                "success",
                "important",
                "critical",
                "informational",
                "inactive",
                "blueviolet",
                "ff69b4",
                "9cf",
            ]
        )
        # get the name of the file
        badge_filename = os.listdir(directory)[i]  # get the name of the file
        badge_text = badge_filename.replace(".md", "")  # remove the .md extension
        badge_text_two = badge_text.replace(" ", "_")  # replace spaces with underscores
        badge_link = f"./{directory}/{badge_text_two}.md"
        while " " in badge_text:
            badge_text = badge_text.replace(" ", "_")
        if badge_text not in badge_texts:
            badge = f"[![{badge_text}](https://img.shields.io/badge/{badge_text}-{badge_color})]({badge_link})"
            badges.append(badge)  # add the badge to the list
        badge_texts.append(
            badge_text.replace("_", " ")
        )  # add the badge text to the list
    # concatenate the badges together then return the concatenated string
    # badges = "\n".join(badges)
    return badges


def collect_badges_from_dirs(dirs_list):
    # go to each directory and collect the badges
    badges = []
    for directory in dirs_list:
        new_badges_list = collect_badges(directory=directory)
        updated_badges = [
            badge for badge in new_badges_list if badge not in badges
        ]  # remove duplicates
        badges.extend(updated_badges)
    # join the badges together and return the string
    badges = "\n ".join(badges)
    return badges


def master_badge_function():
    badges = collect_badges_from_dirs(
        dirs_list=["./data/prompts/specific_topics"]
    )  # can add user_defined_topics later
    return badges


# Read in the top, middle, and bottom sections of the README
with open("./docs/section_1.md", "r") as file:
    top = file.read()
    # Write the section to the top of the readme
    with open("README.md", "w") as file:
        file.write(top)

with open("./docs/section_2.md", "r") as file:
    # middle = file.read()
    updated_middle = master_badge_function()  # collect the badges
    # Convert to HTML
    #!middle = mistune.markdown(updated_middle)
    middle = "\n\n" + updated_middle
    # write the section to the bottom of the readme
    with open("README.md", "a") as file:
        file.write(middle)

with open("./docs/section_3.md", "r") as file:
    bottom = file.read()
    # add a new line to the bottom
    bottom += "\n"
    # write the section to the bottom of the readme
    with open("README.md", "a") as file:
        file.write(bottom)
