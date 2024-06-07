const chatLog = document.getElementById('chat-log');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

const COORDINATOR_INTRO_PROMPT = `
Welcome to the Reverse Turing Test Game!

In this game, you'll be interacting with a couple of AI models and 1 human impostor. Your goal is to identify the human and eliminate them through strategic voting.

The game consists of conversation rounds and voting rounds. In each conversation round, you'll engage in a text-based discussion with the other agents. Then, in the voting round, you'll vote for the agent you think is most likely to be the human.

Remember, the AI models will try to convince you they're human, while the human impostor will try to blend in. You must use your wits to figure out who's who and vote accordingly.

The game will continue until either the human is eliminated or decides to quit. Let's get started!
`


const AI_AGENTS = [
  ["llama3:70b-instruct", "http://10.10.0.170:11434"],
  ["llama3:70b-instruct", "http://10.10.0.170:11434"], // can be duplicate, doesn't matter
  // ["llama3:70b", "http://10.10.0.170:11434"],
  // ["llama3:8b", "http://10.10.0.170:11434"],
  // ["mixtral:8x7b-instruct-v0.1-q4_0", "http://10.10.0.170:11434"],
  // ["mixtral:8x22b-instruct", "http://10.10.0.170:11434"],
  // ...
];

const NUM_TURNS = 2;


function addChatBubble(text, speaker) {
    // console.log("Chat bubble added");
    // console.log(text);

    text = text.trim().replace(/\n/g, '<br>');
    const chatBubble = document.createElement('li');
    chatBubble.className = 'chat-bubble';

    let innerhtml = `<b>${speaker}:</b> ${text}`;

    chatBubble.innerHTML = innerhtml;
    chatLog.appendChild(chatBubble);
    // userInput.value = '';
}

// sendBtn.addEventListener('click', submitForm);

// document.getElementById("user-input").addEventListener("keypress", e => {
//     if (e.key === "Enter" && !e.shiftKey) {
//         submitForm(e);
//     }
// });

// function submitForm(e) {
//     e.preventDefault();

//     var textareaValue = document.getElementById("user-input").value;
//     console.log(textareaValue);
//     if (textareaValue) {
//         addChatBubble(textareaValue, 'User');
//     }
// }

function setSystemPrompt(text) {
  // console.log("Setting system prompt");
  // console.log(text);
  document.getElementById('system-prompt').innerHTML = text.trim().replace(/\n/g, '<br>');
}

function setStatus(text) {
    document.getElementById('status').innerHTML = text;
}


// function setContext(text) {
//     document.getElementById('context').innerHTML = text.trim().replace(/\n/g, '<br>');
// }



// show stats only in large screens, hide in small screens
const statsElement = document.getElementById('stats');

function smallScreen() {
    statsElement.style.display = 'none';

}

function largeScreen() {
    statsElement.style.display = 'block';

}

window.addEventListener('resize', () => {
  const screenWidth = window.innerWidth;
  if (screenWidth < 768) {
    smallScreen();
  } else {
    largeScreen();
  }
});

if (window.innerWidth < 768) {
    smallScreen();
} else {
  largeScreen();
}



// Example usage:
addChatBubble(COORDINATOR_INTRO_PROMPT, 'Coordinator');
// addChatBubble('Hello, I am Agent 2!', 'Agent 2');
// addChatBubble('Hello, I am Agent 2!', 'Agent 2');
// addChatBubble('Hello, I am Agent 2!', 'Agent 2');
// addChatBubble('Hello, I am Agent 2!', 'Agent 2');
// addChatBubble('Hello, I am Agent 2!', 'Agent 2');

