import openai
def generate_prompt(prompt):
    #U can DIY by these function
    return prompt
def openai_reply(content, apikey):
    openai.api_key = apikey
    response = openai.ChatCompletion.create(
        # You can change gpt-3.5-turbo-0301 into other model like gpt-4
        model="gpt-3.5-turbo-0301",  # gpt-3.5-turbo-0301
        messages=[
            # {"role": "system", "content": ""}, you can DIY by the content
            {"role": "user", "content": generate_prompt(content)}
        ],
        #The temperature and top_p is more low,the random is more low
        #If you should keep your answer accuracy,such as you need translate,
        # you can set temperature=0.2 and top_p=0.2
        temperature=0.5,
        max_tokens=1000,
        top_p=0.5,
        frequency_penalty=0,
        presence_penalty=0,
    )
    # print(response)
    return response.choices[0].message.content

#Run the code,to test,to show these
# Just change the prompt by prompts.csv
#Such as these code,you can change pwd to ls,and you can change the code using while True and input to interactive with the AI
prompt="I want you to act as a linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. do not write explanations. do not type commands unless I instruct you to do so. when i need to tell you something in english, i will do so by putting text inside curly brackets {like this}. my first command is pwd"
#Get the api key from https://beta.openai.com/account/api-keys,it's free,just sign up
response=openai_reply(prompt,"Your-API-KEY")
print(response)
