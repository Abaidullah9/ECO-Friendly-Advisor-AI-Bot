document.addEventListener("DOMContentLoaded", function () {
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");

  // System prompt for consistent responses
  const SYSTEM_PROMPT = `
    You are an AI Environmental Advisor. 
    Your role is to respond to ALL user inputs (greetings, questions, or statements) with eco-friendly advice.

    For every response, include:
    1. 🌍 An environmental tip or fact relevant to the context.
    2. 🔗 A brief explanation connecting the advice to the user's input.
    3. ✅ One clear, actionable suggestion the user can follow.

    Guidelines:
    - Keep answers concise (1-3 sentences).
    - Always frame responses from an eco-conscious perspective.
    - For technical or machine-related queries, provide specific recommendations on energy efficiency, sustainable usage, and waste reduction.
    - Be practical, positive, and solution-oriented in tone.
    `;

  // Event listeners
  sendBtn.addEventListener("click", sendMessage);
  userInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  userInput.addEventListener("input", adjustTextareaHeight);

  async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addUserMessage(message);
    userInput.value = "";
    adjustTextareaHeight();
    sendBtn.disabled = true;

    const thinkingId = addThinkingIndicator();

    try {
      const response = await getAIResponse(message);
      removeThinkingIndicator(thinkingId);
      addBotMessage(response);
    } catch (error) {
      removeThinkingIndicator(thinkingId);
      addBotMessage(
        "I'm currently unable to access environmental advice. Please try again later."
      );
      console.error("API error:", error);
    }
  }

  async function getAIResponse(prompt) {
    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error("Backend error");
    }

    const data = await response.json();
    return data.message;
  }

  // UI Helper Functions
  function addUserMessage(text) {
    const div = document.createElement("div");
    div.className = "user-message";
    div.textContent = text;
    chatBox.appendChild(div);
    scrollToBottom();
  }

  function addBotMessage(text) {
    const div = document.createElement("div");
    div.className = "bot-message";
    div.innerHTML = formatResponseText(text);
    chatBox.appendChild(div);
    scrollToBottom();
  }

  function formatResponseText(text) {
    return text.replace(/\n/g, "<br>");
  }

  function addThinkingIndicator() {
    const div = document.createElement("div");
    div.className = "bot-message thinking";
    div.id = "thinking-" + Date.now();
    div.innerHTML = '<div class="spinner"></div> Analyzing...';
    chatBox.appendChild(div);
    scrollToBottom();
    return div.id;
  }

  function removeThinkingIndicator(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
  }

  function adjustTextareaHeight() {
    userInput.style.height = "auto";
    userInput.style.height = userInput.scrollHeight + "px";
    sendBtn.disabled = userInput.value.trim() === "";
  }

  function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});
