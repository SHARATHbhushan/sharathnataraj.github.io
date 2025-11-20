import { GEMINI_API_KEY } from './config.js';

class RobotChat {
    constructor() {
        this.chatContainer = null;
        this.messagesContainer = null;
        this.inputField = null;
        this.isProcessing = false;

        this.initUI();
    }

    initUI() {
        // Create Chat Container
        this.chatContainer = document.createElement('div');
        this.chatContainer.id = 'robot-chat-container';
        Object.assign(this.chatContainer.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '350px',
            height: '500px',
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Inter', sans-serif",
            zIndex: '1000',
            overflow: 'hidden',
            transition: 'transform 0.3s ease'
        });

        // Header
        const header = document.createElement('div');
        Object.assign(header.style, {
            padding: '15px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer'
        });
        header.innerHTML = '<span style="color: #fff; font-weight: 600;">🤖 Robot Assistant</span>';

        // Minimize button
        const minBtn = document.createElement('button');
        minBtn.innerHTML = '−';
        Object.assign(minBtn.style, {
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer'
        });
        let isMinimized = false;
        header.onclick = () => {
            isMinimized = !isMinimized;
            this.chatContainer.style.transform = isMinimized ? 'translateY(440px)' : 'translateY(0)';
        };
        header.appendChild(minBtn);
        this.chatContainer.appendChild(header);

        // Messages Area
        this.messagesContainer = document.createElement('div');
        Object.assign(this.messagesContainer.style, {
            flex: '1',
            padding: '15px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        });
        this.chatContainer.appendChild(this.messagesContainer);

        // Suggestions Area
        this.suggestionsContainer = document.createElement('div');
        Object.assign(this.suggestionsContainer.style, {
            padding: '10px 15px',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none' // IE/Edge
        });
        // Hide scrollbar for Chrome/Safari
        const style = document.createElement('style');
        style.textContent = `#robot-chat-container ::-webkit-scrollbar { display: none; }`;
        this.chatContainer.appendChild(style);
        this.chatContainer.appendChild(this.suggestionsContainer);

        // Input Area
        const inputArea = document.createElement('div');
        Object.assign(inputArea.style, {
            padding: '15px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            gap: '10px'
        });

        this.inputField = document.createElement('input');
        this.inputField.placeholder = 'Ask me to pick a ball...';
        Object.assign(this.inputField.style, {
            flex: '1',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            color: '#fff',
            outline: 'none'
        });
        this.inputField.onkeypress = (e) => {
            if (e.key === 'Enter' && !this.isProcessing) this.handleSend();
        };

        const sendBtn = document.createElement('button');
        sendBtn.innerHTML = '➤';
        Object.assign(sendBtn.style, {
            padding: '0 15px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#ba45a3',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold'
        });
        sendBtn.onclick = () => { if (!this.isProcessing) this.handleSend(); };

        inputArea.appendChild(this.inputField);
        inputArea.appendChild(sendBtn);
        this.chatContainer.appendChild(inputArea);

        document.body.appendChild(this.chatContainer);

        // Welcome Message
        this.addMessage("Hello! I can help you control the robot arm. Try saying 'Pick the red ball' or 'Pick 2 random balls'.", 'bot');
        this.renderSuggestions(["Pick a red ball", "Pick 2 random balls", "Dance", "Clear the table"]);
    }

    addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        Object.assign(msgDiv.style, {
            maxWidth: '80%',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '14px',
            lineHeight: '1.4',
            alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: sender === 'user' ? '#ba45a3' : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            borderBottomRightRadius: sender === 'user' ? '2px' : '12px',
            borderBottomLeftRadius: sender === 'bot' ? '2px' : '12px'
        });
        msgDiv.textContent = text;
        this.messagesContainer.appendChild(msgDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    renderSuggestions(suggestions) {
        this.suggestionsContainer.innerHTML = '';
        suggestions.forEach(text => {
            const chip = document.createElement('button');
            chip.textContent = text;
            Object.assign(chip.style, {
                padding: '6px 12px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
            });
            chip.onmouseover = () => {
                chip.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                chip.style.transform = 'translateY(-1px)';
            };
            chip.onmouseout = () => {
                chip.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                chip.style.transform = 'translateY(0)';
            };
            chip.onclick = () => {
                this.inputField.value = text;
                this.handleSend();
            };
            this.suggestionsContainer.appendChild(chip);
        });
    }

    async handleSend() {
        const text = this.inputField.value.trim();
        if (!text) return;

        this.addMessage(text, 'user');
        this.inputField.value = '';
        this.isProcessing = true;
        this.suggestionsContainer.innerHTML = ''; // Clear suggestions while processing

        // Show typing indicator
        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = typingId;
        typingDiv.textContent = 'Thinking...';
        Object.assign(typingDiv.style, {
            alignSelf: 'flex-start',
            color: '#aaa',
            fontSize: '12px',
            marginLeft: '10px'
        });
        this.messagesContainer.appendChild(typingDiv);

        try {
            const intent = await this.getGeminiIntent(text);
            const responseMsg = await this.executeIntent(intent);
            this.messagesContainer.removeChild(typingDiv);
            this.addMessage(responseMsg, 'bot');

            // Show new suggestions based on context or random
            this.renderSuggestions([
                "Pick another ball",
                "Dance",
                "Clear the table",
                "Pick a blue ball"
            ].sort(() => Math.random() - 0.5));

        } catch (error) {
            console.error(error);
            this.messagesContainer.removeChild(typingDiv);
            this.addMessage("Sorry, I encountered an error processing your request.", 'bot');
            this.renderSuggestions(["Try again", "Pick a ball"]);
        }

        this.isProcessing = false;
    }

    async getGeminiIntent(userText) {
        // Using gemini-1.5-flash for better availability and speed
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const systemPrompt = `
        You are a robot arm controller in a scene with ONLY colorful balls.
        Analyze the user's command and output a JSON object representing the intent.
        
        Scene Context:
        - Objects: Only "balls" exist. No squares, cubes, cups, etc.
        - Colors: "red", "blue", "green", "yellow", "purple", "cyan", "orange", "magenta", "pink".
        
        Output Format:
        {
            "action": "pick" | "dance" | "reject",
            "target": {
                "color": string (mapped to closest available color, or null),
                "count": number (default 1),
                "strategy": "specific" | "random" | "all"
            },
            "reason": string (only if action is "reject")
        }

        Rules:
        1. If user asks for a non-existent object (e.g., "pick a square"), set action to "reject" and reason to "I can only pick balls."
        2. If user asks for a color NOT in the list (e.g., "white", "black", "brown"), set action to "reject" and reason to "I don't see any [color] balls."
        3. If user asks for a generic "ball", set strategy to "random".
        4. If user asks for "all" or "clear", set strategy to "all".
        5. If user asks to "dance", "spin", "wave", set action to "dance".

        Example Inputs -> Outputs:
        "Pick the red ball" -> {"action": "pick", "target": {"color": "red", "count": 1, "strategy": "specific"}}
        "Pick a square" -> {"action": "reject", "reason": "I can only pick balls."}
        "Dance for me" -> {"action": "dance"}
        "Pick a white ball" -> {"action": "reject", "reason": "I don't see any white balls."}
        "Pick a ball" -> {"action": "pick", "target": {"count": 1, "strategy": "random"}}
        
        Return ONLY the JSON object. No markdown.
        User Command: "${userText}"
        `;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", response.status, errorText);
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
            console.error("No candidates returned:", data);
            throw new Error("No response from AI.");
        }

        const resultText = data.candidates[0].content.parts[0].text;

        // Clean up markdown if present
        const jsonStr = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    }

    async executeIntent(intent) {
        if (intent.action === 'reject') {
            return intent.reason || "I can't do that.";
        }

        if (intent.action === 'dance') {
            if (window.robotDance) {
                window.robotDance();
                return "Dancing! 💃🤖";
            } else {
                return "I don't know how to dance yet.";
            }
        }

        if (intent.action === 'pick') {
            const { color, count, strategy } = intent.target;

            let candidates = [];
            let responseMessage = "";

            if (strategy === 'all') {
                candidates = [...window.spheres];
                if (candidates.length > 0) {
                    responseMessage = `Sure! Clearing the table. I found ${candidates.length} balls.`;
                } else {
                    return "The table is already clear!";
                }
            } else if (strategy === 'random') {
                candidates = [...window.spheres];
                if (candidates.length > 0) {
                    responseMessage = `Okay, picking ${count || 1} random ball(s).`;
                } else {
                    return "There are no balls left to pick!";
                }
            } else if (strategy === 'specific' && color) {
                const targetHue = this.getColorHue(color);
                if (targetHue !== null) {
                    candidates = window.spheres.filter(s => {
                        const h = s.userData.color.getHSL({}).h;
                        let diff = Math.abs(h - targetHue);
                        if (diff > 0.5) diff = 1 - diff;
                        return diff < 0.15;
                    });
                } else {
                    return `I'm not sure what color "${color}" looks like.`;
                }

                if (candidates.length === 0) {
                    return `I couldn't find any ${color} balls. I can pick a random one if you like?`;
                }

                responseMessage = `Found ${candidates.length} ${color} ball(s). Picking ${Math.min(candidates.length, count || 1)} of them.`;
            }

            if (strategy !== 'specific') {
                candidates.sort(() => Math.random() - 0.5);
            } else {
                candidates.sort((a, b) => a.position.length() - b.position.length());
            }

            const toPick = strategy === 'all' ? candidates : candidates.slice(0, count || 1);
            this.processQueue(toPick);
            return responseMessage;
        }

        return "I'm not sure how to do that yet. Try asking me to pick a ball.";
    }

    getColorHue(colorName) {
        const colors = {
            'red': 0.0,
            'orange': 0.08,
            'yellow': 0.16,
            'green': 0.33,
            'cyan': 0.5,
            'blue': 0.66,
            'purple': 0.75,
            'magenta': 0.83,
            'pink': 0.9,
        };
        return colors[colorName.toLowerCase()] !== undefined ? colors[colorName.toLowerCase()] : null;
    }

    async processQueue(spheres) {
        for (const sphere of spheres) {
            // Wait until robot is free
            while (window.isRobotBusy) {
                await new Promise(r => setTimeout(r, 500));
            }

            // Check if sphere still exists (might have been picked by another command)
            if (window.spheres.includes(sphere)) {
                window.pickUpSphere(sphere);
            }
        }
    }
}

// Initialize
new RobotChat();
