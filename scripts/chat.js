import { GEMINI_API_KEY } from '.config.js';

// Chatbot Logic

// Configuration
const CONFIG = {
    MODEL_NAME: 'gemini-2.5-flash',
    KNOWLEDGE_BASE_PATH: 'assets/knowledge_base.json'
};

// State
let state = {
    isOpen: false,
    knowledgeBase: null,
    history: []
};

// DOM Elements
const elements = {
    fab: null,
    window: null,
    messages: null,
    input: null,
    sendBtn: null,
    closeBtn: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    injectChatHTML();
    initializeElements();
    attachEventListeners();
    loadKnowledgeBase();

    // Auto-open chat after a short delay
    setTimeout(() => {
        if (!state.isOpen) {
            toggleChat();
        }
    }, 1000);
});

function injectChatHTML() {
    const chatHTML = `
        <button class="chat-fab" aria-label="Chat with Sharath">
            <svg viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
        </button>

        <div class="chat-window">
            <div class="chat-header">
                <h3>
                    <span class="status-dot"></span>
                    Digital Sharath
                </h3>
                <button class="close-chat" aria-label="Close chat">×</button>
            </div>
            
            <div class="chat-messages" id="chat-messages">
                <div class="message bot">
                    Hi! I'm Digital Sharath. Ask me anything about my robotics projects, skills, or experience.
                </div>
            </div>

            <div class="chat-input-area">
                <input type="text" placeholder="Ask a question..." aria-label="Chat input">
                <button class="send-btn" aria-label="Send message">
                    <svg viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;

    const container = document.createElement('div');
    container.id = 'chat-container';
    container.innerHTML = chatHTML;
    document.body.appendChild(container);
}

function initializeElements() {
    elements.fab = document.querySelector('.chat-fab');
    elements.window = document.querySelector('.chat-window');
    elements.messages = document.getElementById('chat-messages');
    elements.input = document.querySelector('.chat-input-area input');
    elements.sendBtn = document.querySelector('.send-btn');
    elements.closeBtn = document.querySelector('.close-chat');
}

function attachEventListeners() {
    elements.fab.addEventListener('click', toggleChat);
    elements.closeBtn.addEventListener('click', toggleChat);

    elements.sendBtn.addEventListener('click', handleSendMessage);
    elements.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });
}

async function loadKnowledgeBase() {
    try {
        const response = await fetch(CONFIG.KNOWLEDGE_BASE_PATH);
        state.knowledgeBase = await response.json();
        console.log('Knowledge base loaded');
    } catch (error) {
        console.error('Failed to load knowledge base:', error);
        addMessage('bot', 'System Error: Could not load knowledge base. Please check the console.');
    }
}

function toggleChat() {
    state.isOpen = !state.isOpen;
    elements.window.classList.toggle('open', state.isOpen);

    if (state.isOpen) {
        elements.input.focus();
        // Check API Key on first open
        if (!GEMINI_API_KEY || GEMINI_API_KEY === '__GEMINI_API_KEY__') {
            addMessage('bot', '⚠️ <strong>Configuration Required:</strong> API Key not configured.');
        }
    }
}

async function handleSendMessage() {
    const text = elements.input.value.trim();
    if (!text) return;

    // Clear input
    elements.input.value = '';

    // Add user message
    addMessage('user', text);

    // Check API Key
    if (!GEMINI_API_KEY || GEMINI_API_KEY === '__GEMINI_API_KEY__') {
        addMessage('bot', 'API Key not configured.');
        return;
    }

    // Show typing indicator
    const typingId = showTypingIndicator();

    try {
        const response = await generateResponse(text);
        removeTypingIndicator(typingId);
        addMessage('bot', response);
    } catch (error) {
        removeTypingIndicator(typingId);
        console.error('Chat Error:', error);
        addMessage('bot', 'Sorry, I encountered an error processing your request. Please try again.');
    }
}

function addMessage(sender, text) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;

    // Parse Markdown for bot messages
    if (sender === 'bot') {
        div.innerHTML = parseMarkdown(text);
    } else {
        div.textContent = text; // User messages are plain text
    }

    elements.messages.appendChild(div);
    scrollToBottom();
}

function parseMarkdown(text) {
    // 1. Handle bold: **text**
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 2. Handle italics: *text*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 3. Handle bullet points
    // Split by newlines to handle lists
    const lines = html.split('\n');
    let inList = false;
    let processedLines = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            if (!inList) {
                processedLines.push('<ul>');
                inList = true;
            }
            processedLines.push(`<li>${trimmed.substring(2)}</li>`);
        } else {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            // Handle paragraphs for non-empty lines
            if (trimmed.length > 0) {
                processedLines.push(`<p>${line}</p>`);
            }
        }
    });

    if (inList) {
        processedLines.push('</ul>');
    }

    return processedLines.join('');
}

function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.className = 'typing-indicator';
    div.id = id;
    div.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    elements.messages.appendChild(div);
    scrollToBottom();
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom() {
    elements.messages.scrollTop = elements.messages.scrollHeight;
}

async function generateResponse(userQuery) {
    if (!state.knowledgeBase) {
        return "I'm still loading my brain... please wait a moment.";
    }

    const context = constructContext(userQuery);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
        contents: [{
            parts: [{
                text: `You are "Digital Sharath", an AI assistant for Sharath Nataraj's portfolio website. 
                Your goal is to answer questions about Sharath's skills, projects, and experience based ONLY on the provided context.
                
                Tone: Professional, enthusiastic, and helpful. First person ("I worked on...", "My skills are...").
                
                Context:
                ${JSON.stringify(state.knowledgeBase)}
                
                User Question: ${userQuery}
                
                Answer:`
            }]
        }]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

function constructContext(query) {
    // For now, we send the whole knowledge base since it's small.
    // In a larger system, we would do vector search here.
    return JSON.stringify(state.knowledgeBase);
}
