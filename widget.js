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
    // Initialization
    // ========================================
    function init() {
        // Cache DOM elements
        elements = {
            button: document.getElementById('chat-widget-button'),
            window: document.getElementById('chat-widget-window'),
            messages: document.getElementById('chat-messages'),
            input: document.getElementById('chat-input'),
            sendButton: document.getElementById('chat-send-button'),
            typingIndicator: document.getElementById('typing-indicator'),
            chatIcon: document.querySelector('.chat-icon'),
            closeIcon: document.querySelector('.close-icon')
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
