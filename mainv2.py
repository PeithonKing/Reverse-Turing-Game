import random
import requests
from pprint import pprint


COORDINATOR_INTRO_PROMPT = """
Welcome to the Reverse Turing Test Game!

In this game, you'll be interacting with 4 AI models and 1 human impostor. Your goal is to identify the human and eliminate them through strategic voting.

The game consists of conversation rounds and voting rounds. In each conversation round, you'll engage in a text-based discussion with the other agents. Then, in the voting round, you'll vote for the agent you think is most likely to be the human.

Remember, the AI models will try to convince you they're human, while the human impostor will try to blend in. You must use your wits to figure out who's who and vote accordingly.

The game will continue until either the human is eliminated or decides to quit. Let's get started!
"""


# API endpoint and models dictionary
AI_AGENTS = [
    ("llama3:70b-instruct", "http://10.10.0.170:11434"),
    ("llama3:70b", "http://10.10.0.170:11434"),
    ("llama3:8b", "http://10.10.0.170:11434"),
    ("mixtral:8x7b-instruct-v0.1-q4_0", "http://10.10.0.170:11434"),
    ("mixtral:8x22b-instruct", "http://10.10.0.170:11434"),
    # ...
]

# API endpoint and models dictionary
AI_AGENTS = [
    ("llama3:70b-instruct", "http://10.10.0.170:11434"),
    ("llama3:70b-instruct", "http://10.10.0.170:11434"),
    ("llama3:70b-instruct", "http://10.10.0.170:11434"),
    ("llama3:70b-instruct", "http://10.10.0.170:11434"),
    # ("llama3:70b", "http://10.10.0.170:11434"),
    # ("llama3:8b", "http://10.10.0.170:11434"),
    # ("mixtral:8x7b-instruct-v0.1-q4_0", "http://10.10.0.170:11434"),
    # ("mixtral:8x22b-instruct", "http://10.10.0.170:11434"),
    # ...
]

NUM_TURNS = 2

class Agent:
    def __init__(self, name, model, api_endpoint_url):
        self.name = name
        self.model = model
        self.ishuman = model == "human"
        self.api_endpoint_url = api_endpoint_url
        # print(f"{name} initialized with model: {model}")
        print(self)

    def respond_to_prompt(self, prompt):
        system_prompt = f"You are {self.name}, a player in a game with multiple AI models and a human impostor. Your goal is to find and eliminate the impostor. The game consists of general talking rounds and later voting rounds. Remember, you must keep your responses short and strictly under 50 words. Repeat, under 50 words. Don't make a mistake! Keep it brief! Here is the conversation history so far:"
        response = self._api_call_(system_prompt, prompt)
        final_response = f"{self.name} said: {response}"
        print(final_response)
        return final_response

    def vote_for_agent(self, prompt, agents):
        system_prompt = f"""
You are {self.name}, a player in a game with multiple AI models and a human impostor.
Your goal is to find and eliminate the impostor. The game consists of general talking rounds and later voting rounds.
You can vote for one of the following agents: {', '.join(agents)}.
Remember, you must keep your responses short and strictly under 50 words.
Repeat, under 50 words. Don't make a mistake! Keep it brief!
When voting, please use the format --- <Agent X> --- and optionally provide a reason for your vote after that.
Here is the conversation history so far:
        """
        response = self._api_call_(system_prompt, prompt)
        try:
            vote = response.split("---")[1].strip()
            # vote.replace("<vote>", "").strip()
        except IndexError:
            print("Original response:", response)
            vote = "UND"
            response = f"--- {vote} --- The response was not formatted correctly and this is a system generated placeholder response."
        response = f"{self.name} voted:\n{response}"
        print(response)
        return vote, response

    def _api_call_(self, system_prompt, prompt):
        if self.ishuman:
            # print(f"\n{system_prompt = }")
            # print(f"\n{prompt = }")
            response = input("Response: ")
            return response
        else:
            api_url = self.api_endpoint_url + "/api/generate"
            data = {
                "model": self.model,
                "prompt": prompt,
                "system": system_prompt,
                "stream": False
            }
            response = requests.post(api_url, json=data)
            response_json = response.json()
            return response_json["response"]
    
    def __repr__(self):
        return f"Agent(name={self.name}, model={self.model}, ishuman={self.ishuman}, api_endpoint_url={self.api_endpoint_url})"


def play(agents, conversation_history):
    print(COORDINATOR_INTRO_PROMPT)

    for _ in range(NUM_TURNS):
        for agent in agents:
            prompt = f"{COORDINATOR_INTRO_PROMPT}:\n"
            prompt += "\n\n".join(conversation_history)
            response = agent.respond_to_prompt(prompt)
            conversation_history.append(response)
    
    print("Voting time!")
    conversation_history.append("Coordinator: Now is the voting time!")

    voting_responses = {}
    for agent in agents:
        prompt = f"{COORDINATOR_INTRO_PROMPT}:\n"
        prompt += "\n\n".join(conversation_history)
        vote, response = agent.vote_for_agent(prompt, [a.name for a in agents])
        voting_responses[agent.name] = vote
        conversation_history.append(response)

    eliminated_agent = max(voting_responses, key=voting_responses.get)
    pprint(voting_responses)

    # print and count who got how many votes
    for agent in set(voting_responses.values()):
        count = list(voting_responses.values()).count(agent)
        print(f"{agent} got {count} votes")

    print(f"Agent {eliminated_agent} has been eliminated!")
    # find the human agent name:
    human_agent_name = [a.name for a in agents if a.ishuman][0]

    if eliminated_agent == human_agent_name:
        return False
    
    agents = [a for a in agents if a.name != eliminated_agent]

    return conversation_history, agents

def main():
    agent_names = [name for name, _ in AI_AGENTS] + ["human"]
    # corresponding URLs and None for human agent
    urls = [url for _, url in AI_AGENTS] + [None]

    # shuffle the agent names to randomize the order after fixing the seed
    random.seed(21)
    random.shuffle(agent_names)
    random.seed(21)
    random.shuffle(urls)

    agents = [
        Agent(
            f"Agent {i+1}",
            name,
            url
         ) for i, (name, url) in enumerate(zip(agent_names, urls))
     ]

    conversation_history = []

    while True:
        result = play(agents, conversation_history)
        if not result:
            print("You have been eliminated! Game over.")
            break
        else:
            conversation_history, agents = result
            user_input = input("Do you want to continue? (y/n): ")
            if user_input.lower() != "y":
                break

if __name__ == "__main__":
    main()
