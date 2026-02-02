/**
 * Chat Widget Embed Script
 * Lightweight loader for embedding the chat widget on any website
 * 
 * Usage:
 * <script 
 *   src="https://your-cdn.com/embed.js"
 *   data-webhook-url="https://your-webhook-endpoint.com/chat"
 *   data-welcome-message="Hi, how can I help?"
 * ></script>
 */

(function () {
    'use strict';

    // Get configuration from script tag attributes
    const currentScript = document.currentScript || document.querySelector('script[src*="embed.js"]');
    const config = {
        webhookUrl: currentScript?.getAttribute('data-webhook-url') || 'https://your-webhook-endpoint.com/chat',
        welcomeMessage: currentScript?.getAttribute('data-welcome-message') || 'Hi, how can I help?',
        primaryColor: currentScript?.getAttribute('data-primary-color') || '#F03E3E'
    };

    // Base URL for assets (same directory as embed.js)
    const baseUrl = currentScript?.src.substring(0, currentScript.src.lastIndexOf('/')) || '';

    // Inject CSS
    function injectCSS() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `${baseUrl}/widget.css`;
        document.head.appendChild(link);
    }

    // Inject HTML
    function injectHTML() {
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
        document.body.appendChild(container);
    }

    // Inject JavaScript
    function injectJS() {
        const script = document.createElement('script');
        script.src = `${baseUrl}/widget.js`;
        script.onload = function () {
            // Configure widget with custom settings
            if (window.ChatWidget) {
                window.ChatWidget.config({
                    webhookUrl: config.webhookUrl,
                    welcomeMessage: config.welcomeMessage
                });
            }
        };
        document.body.appendChild(script);
    }

    // Initialize when DOM is ready
    function init() {
        injectCSS();
        injectHTML();
        injectJS();
    }

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
