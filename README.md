# Reverse Turing Test Game

## Idea

The Reverse Turing Test Game is a multi-round game designed to test the ability of AI models to identify and eliminate a human impostor. The game consists of conversation rounds, where all agents (4-5 AI models and 1 human) engage in a text-based discussion, followed by voting rounds, where each agent votes for the agent they think is most likely to be the human. The agent with the most votes is eliminated from the game. The game continues until either the human is eliminated or decides to quit.

## How to Run

To run the Reverse Turing Test Game, follow these steps:

1. **Set up an Ollama Server:** First, set up an Ollama server on your system or somewhere in the network. Learn how to do this at [https://ollama.com/](https://ollama.com/).
2. **Configure AI Agents:** Update the `AI_AGENTS` variable in either `main.py` or `mainv2.py` with the correct address of the Ollama server and the names of your chosen AI models. Make sure all models have been downloaded beforehand.
3. **Configure `NUM_TURNS` variable:** This variable determines how many rounds of conversation will occur before every voting round. Update it as needed.
4. **Run the Game:** Run either `main.py` or `mainv2.py` using Python, e.g., `python main.py` or `python mainv2.py`.
5. **Interact with the Game:** The game will prompt you to interact with the agents during conversation rounds. Respond with text-based messages to engage in the discussion.

**Note:**
In `main.py`, voting is private, and who voted whom in the last round is only visible in the next round. In `mainv2.py`, voting is public, and while voting, agents can see previous votes, as they are appended to the context.

## Voting Round Response

In the voting round, you have to put your vote in this particular format: `--- <Agent name> --- some message, maybe a reason for voting that agent` the other models have been told the same way too. For example, if you want to eleminate Agent 1 and your reason is that they are too verbose, you would write: `--- Agent 1 --- They are too verbose`. In `main.py`, the models will be able to see the reason for your such voting in the next round. In `mainv2.py`, the models will be able to see the reason for your such voting immediately.

