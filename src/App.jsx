import { useState } from 'react'
import './App.css'
import './NavBar.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import React from 'react';

const API_KEY = process.env.OPENAI_API_KEY

const systemMessage = {
  "role": "system", "content": "Explain things like you're a product manager with experience as product owner and full stack developer talking to a software professional with 2 years of experience. include acceptance criteria"
}

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm TaskGPT! Lets create tasks for your project!",
      sentTime: "just now",
      sender: "TaskGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [includeAcceptanceCriteria, setIncludeAcceptanceCriteria] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(false);
  const [stepsToBuild, setStepsToBuild] = useState(false);
  const [teamMembers, setTeamMembers] = useState(1);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      let ac = includeAcceptanceCriteria ? 'include acceptance criteria' : ',';
      let et = estimatedTime ? 'include etimated time' : ',';
      let sb = stepsToBuild ? 'include steps to build':',';

      let fullMessage = "give me full detailed Jira like tasks for this project details:" + messageObject.message  + ac + et + sb + 'team mebers ='+teamMembers

      return { role: role, content: fullMessage}
    });

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      }).then((data) => {
        return data.json();
      }).then((data) => {
        console.log(data);
        setMessages([...chatMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT"
        }]);
        setIsTyping(false);
      });
  }

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    switch (name) {
      case 'includeAcceptanceCriteria':
        setIncludeAcceptanceCriteria(checked);
        break;
      case 'estimatedTime':
        setEstimatedTime(checked);
        break;
      case 'stepsToBuild':
        setStepsToBuild(checked);
        break;
      default:
        break;
    }
  }

  const handleTeamMembersChange = (e) => {
    setTeamMembers(e.target.value);
  }

  return (
    <div className="App">
  <div style={{ position:"relative", height: "800px", width: "900px"  }}>
      
    <div>
    <ul className="nav-links">
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/about">About</a>
        </li>
      </ul>
    </div>

      <nav>
        <div className="logo">
          <a href="/">TasksGPT</a>
        </div>
        <div>
                 <h1>New verison is available <a href="https://abdelhakmokri26-taskgpt-v2-taskgpt-h5oml4.streamlit.app/">here</a></h1>
       
    </div>
        <div className="checkboxes">
        <label htmlFor="includeAcceptanceCriteria">
        <input
          type="checkbox"
          id="includeAcceptanceCriteria"
          name="includeAcceptanceCriteria"
          checked={includeAcceptanceCriteria}
          onChange={handleCheckboxChange}
        />
        Include Acceptance Criteria
      </label>
      <label htmlFor="estimatedTime">
        <input
          type="checkbox"
          id="estimatedTime"
          name="estimatedTime"
          checked={estimatedTime}
          onChange={handleCheckboxChange}
        />
        Estimated Time
      </label>
      <label htmlFor="stepsToBuild">
        <input
          type="checkbox"
          id="stepsToBuild"
          name="stepsToBuild"
          checked={stepsToBuild}
          onChange={handleCheckboxChange}
        />
        Steps to Build
      </label>
    </div>
    <div className="teamMembers">
      <label htmlFor="teamMembers">
        Team Members:
        <input
          type="number"
          id="teamMembers"
          name="teamMembers"
          value={teamMembers}
          onChange={handleTeamMembersChange}
        />
      </label>
    </div>
  </nav>

  <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="TaskGPT is typing" /> : null}
            >
              {messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Enter your project details here" onSend={handleSend} />        
          </ChatContainer>
        </MainContainer>
        </div>
</div>
);
}

export default App;
