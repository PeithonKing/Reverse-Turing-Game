function getResponseSystemPrompt(name) {
	return `You are ${name}, a player in a game with multiple AI models and a human impostor. Your goal is to find and eliminate the impostor. The game consists of general talking rounds and later voting rounds. Remember, you must keep your responses short and strictly under 50 words. Repeat, under 50 words. Don't make a mistake! Keep it brief! Here is the conversation history so far:`;
}

function getVotingSystemPrompt(name, agents) {
	return `
You are ${name}, a player in a game with multiple AI models and one human impostor.
Your goal is to find and eliminate the human impostor. The game consists of general talking rounds and voting rounds.
You can vote for one of the following agents: ${agents.join(", ")}.  
Remember, you must keep your responses short and strictly under 50 words.
Repeat, under 50 words. Don't make a mistake! Keep it brief!
When voting, please use the format --- Agent X --- and optionally provide a reason for your vote after that.
Here is the conversation history so far so that u can vote the human out:
`;
}


class Agent {
	constructor(name, model, apiEndpointUrl) {
		this.name = name;
		this.model = model;
		this.isHuman = model === "human";
		this.apiEndpointUrl = apiEndpointUrl;
		addChatBubble(`Agent ${name} (${model}) has joined the game!`, "Coordinator");
		//   console.log(this); // print the agent object
	}

	async respondToPrompt(prompt) {
		const systemPrompt = getResponseSystemPrompt(this.name);
		const response = await this._apiCall_(systemPrompt, prompt);
		const finalResponse = `${this.name} said: ${response} `;
		console.log(finalResponse);
		return finalResponse;
	}

	async voteForAgent(prompt, agents) {
		const systemPrompt = getVotingSystemPrompt(this.name, agents);
		const response = await this._apiCall_(systemPrompt, prompt);

		console.log("Voting response:", response)

		let vote;
		try {
			vote = response.split("---")[1].trim();
		} catch (error) {
			console.log("Original response:", response);
			vote = "UND";
			response = `--- ${vote} --- The response was not formatted correctly and this is a system generated placeholder response.`;
		}
		const finalResponse = `${this.name} voted:\n${response}`;
		console.log(finalResponse);
		return [vote, finalResponse];
	}

	async _apiCall_(systemPrompt, prompt) {
		// console.log(`Trying to respond to prompt: ${prompt}\n\nSystem prompt: ${systemPrompt}`);
		setSystemPrompt(systemPrompt);
		setStatus(`${this.model} is thinking...`)
		if (this.isHuman) {
			document.getElementById("user-input-form").style.display = "block";

			return new Promise((resolve) => {
				const sendBtn = document.getElementById("send-btn");
				const userInput = document.getElementById("user-input");

				function handleSubmit(name) {
					const textareaValue = userInput.value;
					if (textareaValue) {
						addChatBubble(textareaValue, name);
						document.getElementById('user-input').value = '';
						document.getElementById("user-input-form").style.display = "none";
						resolve(textareaValue);
					}
				}

				sendBtn.addEventListener('click', (e) => {
					e.preventDefault();
					handleSubmit(this.name);
				});
				userInput.addEventListener('keypress', (e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						handleSubmit(this.name);
					}
				});
			});
		} else {
			try {
				const apiUrl = this.apiEndpointUrl + "/api/generate";
				const data = {
					model: this.model,
					prompt: prompt,
					system: systemPrompt,
					stream: false
				};
				const response = await fetch(apiUrl, { method: "POST", body: JSON.stringify(data) });
				const responseJson = await response.json();
				addChatBubble(responseJson.response, this.name);
				return responseJson.response;
			} catch (error) {
				alert(`OLLAMA server error: ${error}`);
				console.error(error);
				return "";
			}
		}
	}
}

/*
aiAgent = new Agent(
	"Trial Agent",
	"llama3:70b-instruct",
	"http://10.10.0.170:11434"
)


// humanAgent = new Agent(
// 	"Trial Agent",
// 	"human",
// 	"http://10.10.0.170:11434"
// )


aiAgent.respondToPrompt("Say something random, just testing.")
// humanAgent.respondToPrompt("Say something random, just testing.")

// // wait 2 seconds and call the same function again
// setTimeout(() => {
// 	aiAgent.respondToPrompt("Say something random, just testing.")
// }, 10000);

// // wait 2 seconds and call the same function again
// setTimeout(() => {
// 	humanAgent.respondToPrompt("Say something random, just testing.")
// }, 20000);

*/


async function play(agents, conversationHistory) {
	console.log("Game started!");

	for (let i = 0; i < NUM_TURNS; i++) {
		for (const agent of agents) {
			const prompt = `${COORDINATOR_INTRO_PROMPT}:\n${conversationHistory.join("\n")}`
			const response = await agent.respondToPrompt(prompt);
			conversationHistory.push(response);
		}
	}

	addChatBubble("Voting time!", "Coordinator");
	conversationHistory.push("Coordinator: Now is the voting time!");

	const votingResponses = {};
	for (const agent of agents) {
		const prompt = `${COORDINATOR_INTRO_PROMPT}:\n${conversationHistory.join("\n")}`
		const [vote, response] = await agent.voteForAgent(prompt, agents.map((a) => a.name));
		votingResponses[agent.name] = vote;
		conversationHistory.push(response);
		console.log(`Agent ${agent.name} voted for ${vote}`)
	}

	console.log(votingResponses);

	const eliminatedAgent = Object.keys(votingResponses).reduce((a, b) => votingResponses[a] > votingResponses[b] ? a : b);
	console.log(votingResponses);

	// print and count who got how many votes
	for (const agent of new Set(Object.values(votingResponses))) {
		const count = Object.values(votingResponses).filter((v) => v === agent).length;
		console.log(`${agent} got ${count} votes`);
	}

	console.log(`Agent ${eliminatedAgent} has been eliminated!`);
	addChatBubble(`Agent ${eliminatedAgent} has been eliminated!`, "Coordinator");
	// find the human agent name:
	const humanAgentName = agents.find((a) => a.isHuman).name;

	if (eliminatedAgent === humanAgentName) {
		return false;
	}

	agents = agents.filter((a) => a.name !== eliminatedAgent);

	return [conversationHistory, agents];
}




async function main() {
	const agentNames = AI_AGENTS.map(([name]) => name).concat("human");
	// corresponding URLs and None for human agent
	const urls = AI_AGENTS.map(([, url]) => url).concat(null);

	console.log(agentNames);
	console.log(urls);

	// shuffle the agent names to randomize the order after fixing the seed
	// random.seed(21)
	// random.shuffle(agentNames)
	// random.seed(21)
	// random.shuffle(urls)

	// Math.random(seed = 21);
	// agentNames = shuffleArray(agentNames);
	// Math.random(seed = 21);
	// urls = shuffleArray(urls);

	const agents = agentNames.map((name, i) => new Agent(`Agent ${i + 1}`, name, urls[i]));
	console.log(agents);

	let conversationHistory = [];

	while (true) {
		const result = await play(agents, conversationHistory);
		if (!result) {
			console.log("You have been eliminated! Game over.");
			addChatBubble("You have been eliminated! Game over.", "Coordinator");
			break;
		} else {
			[conversationHistory, agents] = result;
			const user_input = prompt("Do you want to continue? (y/n): ");
			if (user_input.toLowerCase() !== "y") {
				break;
			}
		}
	}
}

main();


/* TODO:
- [x] hide form in the begining
- [ ] players chat bubble not showing up
- [ ] Shuffle
- [ ] System Prompt changing everytime, fix to this player
- [ ] update player stats (ovals) dynamically


*/