import re
import os
from tqdm.auto import tqdm
import pandas as pd
import csv

# topics is a list of strings, each string is a topic which comes from the list of file names in the "./data/prompts/specific_topics" folder
TOPICS = os.listdir(
    "./data/prompts/specific_topics"
)  # get the list of file names in the "./data/prompts/specific_topics" folder
TOPICS = [
    topic.replace(".md", "") for topic in TOPICS
]  # remove the ".md" from the file names
TOPICS = [
    topic.replace("_", " ") for topic in TOPICS
]  # replace the underscores with spaces
prompts_df = pd.read_csv("./data/csv/prompts.csv")
import numpy as np


def create_prompts_csv(markdown_file):
    prompts_df = pd.DataFrame(columns=["topic", "prompt", "contributor", "link"])
    # read the markdown file, extract the prompts, and write them to a csv file
    with open(markdown_file, "r") as f:
        markdown_text = f.read()
    # the first edge is the first "##" and the second edge is the next "##" or the end of the file
    sections = re.split(r"## ", markdown_text)[
        1:
    ]  # split the markdown text into sections
    prompts = []
    for section in tqdm(sections):
        # the first edge is the first "##" and the second edge is the next "##" or the end of the file
        # initializing the lists to store the extracted data in (these must be the same length)
        first_line = []
        contributor = []
        text_between_arrow = []
        # get the topic
        first_line = re.findall(r"^.*?(?=\n)", section)
        # get the contributor
        contributor_match = re.findall(r"Contributed by: \[@f\]\((.*?)\)", section)
        if contributor_match:
            contributor = contributor_match
        else:
            contributor = [None]
        # get the text of the prompt
        text_between_arrow = re.findall(r"> (.*)", section, re.DOTALL)
        if len(first_line) == len(text_between_arrow) and len(
            text_between_arrow
        ) == len(contributor):
            temp_df = pd.DataFrame(
                {
                    "topic": first_line,
                    "prompt": text_between_arrow,
                    "contributor": contributor,
                }
            )  # create a temporary df
            # use concat to add the temporary df to the prompts df
            prompts_df = pd.concat([prompts_df, temp_df], ignore_index=True)
    # drop the first row of the prompts df, which contains nonprompt data
    prompts_df = prompts_df.drop(0)
    prompts_df.to_csv("./data/csv/prompts.csv", index=False)


def extract_prompts(markdown_file, TOPICS):
    # assert that the markdown file exists, and that the topics are a list of strings.
    assert os.path.exists(markdown_file), "The markdown file does not exist."
    assert isinstance(TOPICS, list), "The topics must be a list of strings."

    with open(markdown_file, "r") as f:
        markdown_text = f.read()
    for topic in tqdm(TOPICS, total=len(TOPICS)):
        # write the prompts to the file "topic.md" in the "./data/prompts/specific_topics" folder
        with open(
            f"./data/prompts/specific_topics/{topic.replace(' ', '_')}.md", "w"
        ) as f:
            f.write("\n".join(topic_prompts))


def populate_files_from_csv():

    # code to read csv file and create prompts_df here
    prompts_df = pd.read_csv("./data/csv/prompts.csv")
    with open("./data/csv/topics.csv", "r") as f:
        topics_str = f.read()
    topics = topics_str.split("\n")
    topics = [x.strip() for x in topics if x]
    # remove " and , from the topics
    topics = [topic.replace('"', "") for topic in topics]
    topics = [topic.replace(",", "") for topic in topics]

    # iterate through the topics
    for topic in tqdm(topics, total=len(topics)):
        # get the filename
        topic_filename = topic.replace(" ", "_") + ".md"
        # if the file doesn't exist, create it
        if not os.path.exists(f"./data/prompts/specific_topics/{topic_filename}"):
            # if the topic_filename contains ',. or any other special characters, replace them with underscores in the filename only. This is to avoid errors when creating the file.
            topic_filename = re.sub(r"[^a-zA-Z0-9_.]", "_", topic_filename)
            with open(f"./data/prompts/specific_topics/{topic_filename}", "w") as f:
                print("creating file: ", topic_filename)
                # write a well-formatted header to the file to make it easier to read
                f.write(
                    f"# Prompts related to: {topic}\n\n"
                )  # write the topic to the file
                f.write("-" * 20)
                f.write("\n\n")
                pass  # create the file

        # open the file in append mode, create it only if it doesn't exist
        with open(f"./data/prompts/specific_topics/{topic_filename}", "a+") as f:

            # if the prompt is already in the file, skip it
            if topic in f.read():
                print(f"topic: {topic} already in file")
                continue

            # define a small data frame with only the rows where the topic matches the topic_string
            prompts_df_sub = prompts_df[
                prompts_df["topic"].str.contains(topic, case=False, na=False)
            ]
            if prompts_df_sub.empty:
                print(f"topic: {topic} not found in prompts_df")
                continue
            # iterate through the rows of the data frame
            for _, row in prompts_df_sub.iterrows():
                if not pd.isna(row["contributor"]):  # if the contributor is not null
                    contributor = row[
                        "contributor"
                    ]  # set the contributor to the contributor in the row
                else:
                    contributor = "None"  # otherwise set the contributor to "None"
                prompt = row["prompt"]  # set the prompt to the prompt in the row
                f.write(f"## {topic}\n")
                if not pd.isna(row["contributor"]):  # if the contributor is not null
                    contributor = row[
                        "contributor"
                    ]  # set the contributor to the contributor in the row
                    f.write(
                        f"Contributed by: [{contributor}](https://www.github.com/{contributor})\n"
                    )
                else:
                    contributor = "None"  # otherwise set the contributor to "None"
                    f.write(f"Contributed by: {contributor}\n")

                f.write(
                    f"> {prompt}\n\n"
                )  # write the prompt to the file in the correct format
        print(f"Finished populating {topic}.md")


######## Fresh Start ########
# Starting with a csv already created and populated with prompts
# we want to distribute those prompts into markdown files that are named by the topic. To do this we need to categorize the prompts by topic.
# We can make a new column in the csv file that is the topic, and then we can use that to populate the markdown files.
# We can also use the topic column to make sure that the prompts are only added to the markdown files that are named after the topic.
# Step 1: Create a new column in the csv file that is the topic
# open the csv file
prompts_df = pd.read_csv("./data/csv/prompts.csv")


def main():
    #! Legacy code used README.md to create prompts.csv when readme was the only file with prompts
    #!create_prompts_csv("README.md") # create the prompts csv file from the markdown file (only needs to be run once)
    create_prompts_csv(
        "add_me.md"
    )  # create the prompts csv file from the add_me markdown file (only needs to be run once)
    # extract_prompts("readme_other.md", TOPICS)
    populate_files_from_csv()  # populate the markdown files in the "./data/prompts/specific_topics" folder with the prompts from the csv file


if __name__ == "__main__":
    main()
