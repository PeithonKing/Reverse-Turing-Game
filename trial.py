from main import Agent

newAgent = Agent(
    "Trial Agent",
    "llama3:70b-instruct",
    "http://10.10.0.170:11434"
)

# newAgent = Agent(
#     "Trial Agent",
#     "human",
#     "http://10.10.0.170:11434"
# )

newAgent.respond_to_prompt("Say something random, just testing.")
