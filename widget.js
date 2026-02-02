/**
 * ChatPulse - Lightweight Chat Widget
 * Embeddable chat widget with webhook integration
 */

(function () {
    'use strict';

    // ========================================
    // Configuration
    // ========================================
    const CONFIG = {
        // This should be your Cloudflare Worker URL, NOT your n8n/direct backend URL
        webhookUrl: 'https://chatpulse-worker.your-subdomain.workers.dev',
        storagePrefix: 'chatbot_',
        welcomeMessage: 'Hi, how can I help?',
        primaryColor: '#F03E3E',
        maxRetries: 3,
        retryDelay: 1000,
        typingDelay: 500
    };

    // ========================================
    // State Management
    // ========================================
    const state = {
        isOpen: false,
        sessionId: null,
        messages: [],
        isTyping: false
    };

    // ========================================
    // DOM Elements
    // ========================================
    let elements = {};

    // ========================================
    // Asset Injection
    // ========================================
    function getBaseUrl() {
        const script = document.querySelector('script[src*="widget.js"]');
        if (script) {
            return script.src.substring(0, script.src.lastIndexOf('/'));
        }
        return '';
    }

    function injectHTML() {
        if (document.getElementById('chat-widget-container')) return;

        const baseUrl = getBaseUrl();
        const widgetHTML = `
            <!-- Floating Chat Button -->
            <div id="chat-widget-button" class="chat-button" aria-label="Open chat">
                <svg class="chat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="white"/>
                    <path d="M7 9H17V11H7V9ZM7 12H14V14H7V12Z" fill="white"/>
                </svg>
                <svg class="close-icon hidden" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="white"/>
                </svg>
            </div>

            <!-- Chat Window -->
            <div id="chat-widget-window" class="chat-window hidden">
                <!-- Header -->
                <div class="chat-header">
                    <div class="chat-header-content">
                        <div class="chat-avatar">
                            <img src="${baseUrl}/avatar.png" alt="Social Masla" />
                        </div>
                        <div class="chat-header-text">
                            <h3>Social Masla</h3>
                            <span class="chat-status">Online</span>
                        </div>
                    </div>
                    <button id="chat-header-close" class="chat-header-close" aria-label="Close chat">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>

                <!-- Messages Container -->
                <div class="chat-messages" id="chat-messages"></div>

                <!-- Typing Indicator -->
                <div class="typing-indicator hidden" id="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>

                <!-- Input Area -->
                <div class="chat-input-container">
                    <div class="chat-input-wrapper">
                        <textarea 
                            id="chat-input" 
                            class="chat-input" 
                            placeholder="Type your message..."
                            rows="1"
                            maxlength="2000"
                        ></textarea>
                        <button id="chat-send-button" class="chat-send-button" aria-label="Send message">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="white"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        const container = document.createElement('div');
        container.id = 'chat-widget-container';
        container.innerHTML = widgetHTML;
        document.body.appendChild(container); // Inject into body
    }

    // ========================================
    // Initialization
    // ========================================
    function init() {
        injectHTML();

        if (CONFIG.primaryColor) {
            document.documentElement.style.setProperty('--color-primary', CONFIG.primaryColor);
        }

        // Cache DOM elements
        elements = {
            button: document.getElementById('chat-widget-button'),
            window: document.getElementById('chat-widget-window'),
            messages: document.getElementById('chat-messages'),
            input: document.getElementById('chat-input'),
            sendButton: document.getElementById('chat-send-button'),
            typingIndicator: document.getElementById('typing-indicator'),
            chatIcon: document.querySelector('.chat-icon'),
            closeIcon: document.querySelector('.close-icon'),
            headerCloseButton: document.getElementById('chat-header-close')
        };

        // Load session and messages from localStorage
        loadSession();
        loadMessages();

        // Show welcome message if first time
        if (state.messages.length === 0) {
            addMessage('bot', CONFIG.welcomeMessage);
        } else {
            renderMessages();
        }

        // Event listeners
        elements.button.addEventListener('click', toggleChat);
        elements.headerCloseButton.addEventListener('click', toggleChat);
        elements.sendButton.addEventListener('click', handleSend);
        elements.input.addEventListener('keydown', handleKeyDown);
        elements.input.addEventListener('input', handleInputResize);

        console.log('Chat widget initialized');
    }

    // ========================================
    // Chat Toggle
    // ========================================
    function toggleChat() {
        state.isOpen = !state.isOpen;

        if (state.isOpen) {
            elements.window.classList.remove('hidden');
            elements.chatIcon.classList.add('hidden');
            elements.closeIcon.classList.remove('hidden');
            elements.input.focus();
            scrollToBottom();
        } else {
            elements.window.classList.add('hidden');
            elements.chatIcon.classList.remove('hidden');
            elements.closeIcon.classList.add('hidden');
        }
    }

    // ========================================
    // Message Handling
    // ========================================
    function handleSend() {
        const message = elements.input.value.trim();

        if (!message) return;

        // Add user message
        addMessage('user', message);

        // Clear input
        elements.input.value = '';
        elements.input.style.height = 'auto';

        // Send to webhook
        sendToWebhook(message);
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    function handleInputResize() {
        elements.input.style.height = 'auto';
        elements.input.style.height = elements.input.scrollHeight + 'px';
    }

    // ========================================
    // Webhook Communication
    // ========================================
    async function sendToWebhook(message, retryCount = 0) {
        showTypingIndicator();

        const payload = {
            message: message,
            sessionId: state.sessionId,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch(CONFIG.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            hideTypingIndicator();

            // Extract response message (adjust based on your webhook response structure)
            const botMessage = data.message || data.response || data.text || 'Sorry, I could not process your request.';

            addMessage('bot', botMessage);

        } catch (error) {
            console.error('Webhook error:', error);

            hideTypingIndicator();

            // Retry logic
            if (retryCount < CONFIG.maxRetries) {
                setTimeout(() => {
                    sendToWebhook(message, retryCount + 1);
                }, CONFIG.retryDelay * (retryCount + 1));
            } else {
                addMessage('bot', 'Sorry, I\'m having trouble connecting. Please try again later.');
            }
        }
    }

    // ========================================
    // Message Management
    // ========================================
    function addMessage(type, content) {
        const message = {
            id: generateId(),
            type: type,
            content: content,
            timestamp: new Date().toISOString()
        };

        state.messages.push(message);
        saveMessages();
        renderMessage(message);
        scrollToBottom();
    }

    function renderMessages() {
        elements.messages.innerHTML = '';
        state.messages.forEach(message => renderMessage(message));
    }

    function renderMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.type}`;
        messageEl.dataset.id = message.id;

        const contentEl = document.createElement('div');
        contentEl.className = 'message-content';
        contentEl.innerHTML = parseMarkdown(message.content);

        const timestampEl = document.createElement('div');
        timestampEl.className = 'message-timestamp';
        timestampEl.textContent = formatTimestamp(message.timestamp);

        messageEl.appendChild(contentEl);
        messageEl.appendChild(timestampEl);
        elements.messages.appendChild(messageEl);
    }

    // ========================================
    // Typing Indicator
    // ========================================
    function showTypingIndicator() {
        state.isTyping = true;
        setTimeout(() => {
            if (state.isTyping) {
                elements.typingIndicator.classList.remove('hidden');
                scrollToBottom();
            }
        }, CONFIG.typingDelay);
    }

    function hideTypingIndicator() {
        state.isTyping = false;
        elements.typingIndicator.classList.add('hidden');
    }

    // ========================================
    // Lightweight Markdown Parser
    // ========================================
    function parseMarkdown(text) {
        // Escape HTML to prevent XSS
        text = escapeHtml(text);

        // Code blocks (must be before inline code)
        text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code>${code.trim()}</code></pre>`;
        });

        // Inline code
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Bold
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');

        // Italic
        text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
        text = text.replace(/_(.+?)_/g, '<em>$1</em>');

        // Links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

        // Unordered lists
        text = text.replace(/^\* (.+)$/gm, '<li>$1</li>');
        text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
        text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        // Ordered lists
        text = text.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

        // Blockquotes
        text = text.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

        // Tables (basic support)
        text = text.replace(/\|(.+)\|/g, (match, content) => {
            const cells = content.split('|').map(cell => cell.trim());
            const cellTags = cells.map(cell => `<td>${cell}</td>`).join('');
            return `<tr>${cellTags}</tr>`;
        });
        text = text.replace(/(<tr>.*<\/tr>)/s, '<table>$1</table>');

        // Line breaks
        text = text.replace(/\n\n/g, '</p><p>');
        text = text.replace(/\n/g, '<br>');

        // Wrap in paragraph
        text = `<p>${text}</p>`;

        // Clean up empty paragraphs
        text = text.replace(/<p><\/p>/g, '');
        text = text.replace(/<p>\s*<\/p>/g, '');

        return text;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================
    // LocalStorage Management
    // ========================================
    function loadSession() {
        const sessionId = localStorage.getItem(CONFIG.storagePrefix + 'session_id');

        if (sessionId) {
            state.sessionId = sessionId;
        } else {
            state.sessionId = generateSessionId();
            localStorage.setItem(CONFIG.storagePrefix + 'session_id', state.sessionId);
        }
    }

    function loadMessages() {
        const messagesJson = localStorage.getItem(CONFIG.storagePrefix + 'messages');

        if (messagesJson) {
            try {
                state.messages = JSON.parse(messagesJson);
            } catch (e) {
                console.error('Failed to load messages:', e);
                state.messages = [];
            }
        }
    }

    function saveMessages() {
        try {
            localStorage.setItem(CONFIG.storagePrefix + 'messages', JSON.stringify(state.messages));
        } catch (e) {
            console.error('Failed to save messages:', e);
        }
    }

    // ========================================
    // Utility Functions
    // ========================================
    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function generateId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        // Less than 1 minute
        if (diff < 60000) {
            return 'Just now';
        }

        // Less than 1 hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes} min ago`;
        }

        // Today
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }

        // This week
        if (diff < 604800000) {
            return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
        }

        // Older
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function scrollToBottom() {
        setTimeout(() => {
            elements.messages.scrollTop = elements.messages.scrollHeight;
        }, 100);
    }

    // ========================================
    // Public API (for configuration)
    // ========================================
    window.ChatWidget = {
        config: function (options) {
            Object.assign(CONFIG, options);
        },
        open: function () {
            if (!state.isOpen) toggleChat();
        },
        close: function () {
            if (state.isOpen) toggleChat();
        },
        clearHistory: function () {
            state.messages = [];
            saveMessages();
            renderMessages();
            addMessage('bot', CONFIG.welcomeMessage);
        }
    };

    // ========================================
    // Auto-initialize on DOM ready
    // ========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
