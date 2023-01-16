import re
import os
from tqdm.auto import tqdm
import pandas as pd
import csv

# topics is a list of strings, each string is a topic which comes from the list of file names in the "specific_topics" folder
TOPICS = os.listdir(
    "specific_topics"
)  # get the list of file names in the "specific_topics" folder
TOPICS = [
    topic.replace(".md", "") for topic in TOPICS
]  # remove the ".md" from the file names
TOPICS = [
    topic.replace("_", " ") for topic in TOPICS
]  # replace the underscores with spaces
prompts_df = pd.read_csv("prompts.csv")
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
    prompts_df.to_csv("prompts.csv", index=False)


def extract_prompts(markdown_file, TOPICS):
    # assert that the markdown file exists, and that the topics are a list of strings.
    assert os.path.exists(markdown_file), "The markdown file does not exist."
    assert isinstance(TOPICS, list), "The topics must be a list of strings."

    with open(markdown_file, "r") as f:
        markdown_text = f.read()
    for topic in tqdm(TOPICS, total=len(TOPICS)):
        # write the prompts to the file "topic.md" in the "specific_topics" folder
        with open(f"specific_topics/{topic.replace(' ', '_')}.md", "w") as f:
            f.write("\n".join(topic_prompts))


def populate_files_from_csv():
    # code to read csv file and create prompts_df here
    # make sure the topics are in the TOPICS list

    for topic_string in tqdm(TOPICS, total=len(TOPICS)):
        with open(
            f"specific_topics/{str(topic_string).replace(' ', '_')}.md", "a+"
        ) as f:  # open the file in append mode, create it only if it doesn't exist
            # convert the topic_string topic back to a normal word (e.g. "specific_topic" -> "specific topic")
            topic = topic_string.replace("_", " ")

            # define a small data frame with only the rows where the topic matches the topic_string
            prompts_df_sub = prompts_df[prompts_df["topic"] == topic_string]
            # iterate through the rows of the data frame
            for _, row in prompts_df_sub.iterrows():
                if not pd.isna(row["contributor"]):
                    contributor = row["contributor"]
                else:
                    contributor = "None"
                try:
                    if (
                        str(row["topic"]).strip().lower() == topic.strip().lower()
                    ):  # if the topic of the prompt is the same as the topic of the file
                        # print("topic: ", row['topic'], " vs topic_string: ", topic_string)
                        prompt = row["prompt"]
                        print(prompt)
                        f.write(f"## {topic}\n")
                        f.write(f"Contributed by: [@f]({contributor})\n")
                        f.write(f"> {prompt}\n")
                    else:
                        # print("topic: ", row['topic'], " vs topic_string: ", topic_string)
                        pass
                except Exception as e:
                    print(e)
                    continue
        print(f"Finished populating {topic}.md")


######## Fresh Start ########
# Starting with a csv already created and populated with prompts
# we want to distribute those prompts into markdown files that are named by the topic. To do this we need to categorize the prompts by topic.
# We can make a new column in the csv file that is the topic, and then we can use that to populate the markdown files.
# We can also use the topic column to make sure that the prompts are only added to the markdown files that are named after the topic.
# Step 1: Create a new column in the csv file that is the topic
# open the csv file
prompts_df = pd.read_csv("prompts.csv")


# Step 2: Populate the markdown files with the prompts from the csv file


def main():
    create_prompts_csv("readme_other.md")
    # extract_prompts("readme_other.md", TOPICS)
    #!populate_files_from_csv() # populate the markdown files in the "specific_topics" folder with the prompts from the csv file


if __name__ == "__main__":
    main()
