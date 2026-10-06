/**
 * Sukalp AI Chatbot Widget
 * Embed this script on your website to add AI-powered database chatbot
 * 
 * Usage:
 * <script src="https://yourdomain.com/widget/sukalp-widget.js"></script>
 * <script>
 *   new SukalpWidget('your_api_key', {
 *     apiUrl: 'https://yourdomain.com/api',
 *     position: 'bottom-right',
 *     theme: 'light'
 *   });
 * </script>
 */

(function() {
    'use strict';

    class SukalpWidget {
        constructor(apiKey, options = {}) {
            this.apiKey = apiKey;
            this.apiUrl = options.apiUrl || window.location.origin + '/api';
            this.position = options.position || 'bottom-right';
            this.theme = options.theme || 'light';
            this.title = options.title || 'Ask AI';
            this.placeholder = options.placeholder || 'Ask a question about your data...';
            this.primaryColor = options.primaryColor || '#667eea';
            this.isOpen = false;
            this.messages = [];
            
            this.init();
        }

        init() {
            this.createWidget();
            this.attachEventListeners();
            this.loadStyles();
        }

        loadStyles() {
            if (document.getElementById('sukalp-widget-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'sukalp-widget-styles';
            style.textContent = `
                .sukalp-widget-container {
                    position: fixed;
                    z-index: 9999;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                .sukalp-widget-bottom-right { bottom: 24px; right: 24px; }
                .sukalp-widget-bottom-left { bottom: 24px; left: 24px; }
                .sukalp-widget-top-right { top: 24px; right: 24px; }
                .sukalp-widget-top-left { top: 24px; left: 24px; }
                
                .sukalp-chat-button {
                    width: 64px;
                    height: 64px;
                    border-radius: 20px;
                    background: linear-gradient(135deg, ${this.primaryColor} 0%, ${this.adjustColor(this.primaryColor, -20)} 100%);
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15), 0 0 0 0 rgba(${this.hexToRgb(this.primaryColor)}, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    animation: sukalp-pulse 2s infinite;
                }
                .sukalp-chat-button:hover {
                    transform: scale(1.1) translateY(-2px);
                    box-shadow: 0 12px 32px rgba(0,0,0,0.2), 0 0 0 8px rgba(${this.hexToRgb(this.primaryColor)}, 0.1);
                }
                .sukalp-chat-button svg {
                    width: 32px;
                    height: 32px;
                    fill: white;
                }
                
                @keyframes sukalp-pulse {
                    0% { box-shadow: 0 8px 24px rgba(0,0,0,0.15), 0 0 0 0 rgba(${this.hexToRgb(this.primaryColor)}, 0.4); }
                    70% { box-shadow: 0 8px 24px rgba(0,0,0,0.15), 0 0 0 12px rgba(${this.hexToRgb(this.primaryColor)}, 0); }
                    100% { box-shadow: 0 8px 24px rgba(0,0,0,0.15), 0 0 0 0 rgba(${this.hexToRgb(this.primaryColor)}, 0); }
                }
                
                .sukalp-chat-window {
                    position: absolute;
                    bottom: 90px;
                    width: 400px;
                    max-width: calc(100vw - 48px);
                    height: 550px;
                    max-height: calc(100vh - 140px);
                    background: white;
                    border-radius: 24px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .sukalp-widget-bottom-right .sukalp-chat-window { right: 0; }
                .sukalp-widget-bottom-left .sukalp-chat-window { left: 0; }
                .sukalp-widget-top-right .sukalp-chat-window { bottom: auto; top: 90px; right: 0; }
                .sukalp-widget-top-left .sukalp-chat-window { bottom: auto; top: 90px; left: 0; }
                
                .sukalp-chat-window.hidden {
                    opacity: 0;
                    transform: scale(0.85) translateY(20px);
                    pointer-events: none;
                }
                
                .sukalp-chat-header {
                    padding: 20px 24px;
                    background: linear-gradient(135deg, ${this.primaryColor} 0%, ${this.adjustColor(this.primaryColor, -20)} 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }
                .sukalp-chat-header-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .sukalp-chat-header-avatar {
                    width: 40px;
                    height: 40px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }
                .sukalp-chat-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    letter-spacing: -0.5px;
                }
                .sukalp-chat-header-status {
                    font-size: 12px;
                    opacity: 0.9;
                    margin-top: 2px;
                }
                .sukalp-close-button {
                    background: rgba(255,255,255,0.15);
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 20px;
                    line-height: 1;
                    padding: 0;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    transition: all 0.2s;
                }
                .sukalp-close-button:hover {
                    background: rgba(255,255,255,0.25);
                    transform: rotate(90deg);
                }
                
                .sukalp-chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
                }
                .sukalp-chat-messages::-webkit-scrollbar {
                    width: 6px;
                }
                .sukalp-chat-messages::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sukalp-chat-messages::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                
                .sukalp-message {
                    margin-bottom: 16px;
                    display: flex;
                    align-items: flex-start;
                    animation: sukalp-fadeIn 0.3s ease-out;
                }
                @keyframes sukalp-fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .sukalp-message.user {
                    justify-content: flex-end;
                }
                .sukalp-message-content {
                    max-width: 85%;
                    padding: 14px 18px;
                    border-radius: 18px;
                    line-height: 1.6;
                    word-wrap: break-word;
                    font-size: 15px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                }
                .sukalp-message.user .sukalp-message-content {
                    background: linear-gradient(135deg, ${this.primaryColor} 0%, ${this.adjustColor(this.primaryColor, -15)} 100%);
                    color: white;
                    border-bottom-right-radius: 6px;
                }
                .sukalp-message.bot .sukalp-message-content {
                    background: white;
                    color: #1e293b;
                    border: 1px solid #e2e8f0;
                    border-bottom-left-radius: 6px;
                }
                
                .sukalp-chat-input {
                    padding: 20px 24px;
                    background: white;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                .sukalp-chat-input-wrapper {
                    flex: 1;
                    position: relative;
                }
                .sukalp-chat-input input {
                    width: 100%;
                    padding: 14px 18px;
                    padding-right: 50px;
                    border: 2px solid #e2e8f0;
                    border-radius: 16px;
                    font-size: 15px;
                    outline: none;
                    transition: all 0.2s;
                    background: #f8fafc;
                }
                .sukalp-chat-input input:focus {
                    border-color: ${this.primaryColor};
                    background: white;
                    box-shadow: 0 0 0 4px rgba(${this.hexToRgb(this.primaryColor)}, 0.1);
                }
                .sukalp-chat-input input::placeholder {
                    color: #94a3b8;
                }
                .sukalp-send-button {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    background: linear-gradient(135deg, ${this.primaryColor} 0%, ${this.adjustColor(this.primaryColor, -20)} 100%);
                    border: none;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .sukalp-send-button:hover:not(:disabled) {
                    transform: scale(1.05);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
                }
                .sukalp-send-button:disabled {
                    background: #cbd5e1;
                    cursor: not-allowed;
                    box-shadow: none;
                }
                .sukalp-send-button svg {
                    width: 22px;
                    height: 22px;
                    fill: white;
                }
                
                .sukalp-typing-indicator {
                    display: flex;
                    gap: 6px;
                    padding: 14px 18px;
                }
                .sukalp-typing-dot {
                    width: 10px;
                    height: 10px;
                    background: ${this.primaryColor};
                    border-radius: 50%;
                    animation: sukalp-bounce 1.4s infinite ease-in-out;
                }
                .sukalp-typing-dot:nth-child(1) { animation-delay: -0.32s; }
                .sukalp-typing-dot:nth-child(2) { animation-delay: -0.16s; }
                
                @keyframes sukalp-bounce {
                    0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
                    40% { transform: scale(1); opacity: 1; }
                }
                
                .sukalp-error-message {
                    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                    color: #dc2626;
                    padding: 14px 18px;
                    border-radius: 12px;
                    margin-bottom: 12px;
                    font-size: 14px;
                    border: 1px solid #fca5a5;
                }
            `;
            document.head.appendChild(style);
        }

        createWidget() {
            const container = document.createElement('div');
            container.className = `sukalp-widget-container sukalp-widget-${this.position}`;
            container.id = 'sukalp-widget';
            
            // Chat button
            const button = document.createElement('button');
            button.className = 'sukalp-chat-button';
            button.innerHTML = `
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
            `;
            
            // Chat window
            const window = document.createElement('div');
            window.className = 'sukalp-chat-window hidden';
            window.innerHTML = `
                <div class="sukalp-chat-header">
                    <div class="sukalp-chat-header-content">
                        <div class="sukalp-chat-header-avatar">🤖</div>
                        <div>
                            <h3>${this.title}</h3>
                            <div class="sukalp-chat-header-status">Online</div>
                        </div>
                    </div>
                    <button class="sukalp-close-button">×</button>
                </div>
                <div class="sukalp-chat-messages"></div>
                <div class="sukalp-chat-input">
                    <div class="sukalp-chat-input-wrapper">
                        <input type="text" placeholder="${this.placeholder}" />
                    </div>
                    <button class="sukalp-send-button" disabled>
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15-2-15-2z"/>
                        </svg>
                    </button>
                </div>
            `;
            
            container.appendChild(button);
            container.appendChild(window);
            document.body.appendChild(container);
            
            this.button = button;
            this.window = window;
            this.messagesContainer = window.querySelector('.sukalp-chat-messages');
            this.input = window.querySelector('input');
            this.sendButton = window.querySelector('.sukalp-send-button');
            this.closeButton = window.querySelector('.sukalp-close-button');
        }

        attachEventListeners() {
            this.button.addEventListener('click', () => this.toggle());
            this.closeButton.addEventListener('click', () => this.toggle());
            
            this.input.addEventListener('input', () => {
                this.sendButton.disabled = !this.input.value.trim();
            });
            
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && this.input.value.trim()) {
                    this.sendMessage();
                }
            });
            
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }

        toggle() {
            this.isOpen = !this.isOpen;
            this.window.classList.toggle('hidden', !this.isOpen);
            if (this.isOpen) {
                this.input.focus();
            }
        }

        async sendMessage() {
            const message = this.input.value.trim();
            if (!message) return;
            
            this.input.value = '';
            this.sendButton.disabled = true;
            
            this.addMessage(message, 'user');
            this.showTypingIndicator();
            
            try {
                const response = await fetch(`${this.apiUrl}/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                    },
                    body: JSON.stringify({ 
                        question: message,
                        mode: 'basic'  // Always use basic mode for accurate results
                    }),
                });
                
                const data = await response.json();
                
                this.hideTypingIndicator();
                
                if (response.ok && data.success) {
                    this.addMessage(data.answer, 'bot');
                } else {
                    this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
                    console.error('API Error:', data);
                }
            } catch (error) {
                this.hideTypingIndicator();
                this.addMessage('Sorry, I encountered a network error. Please check your connection.', 'bot');
                console.error('Network Error:', error);
            }
        }

        addMessage(content, type) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `sukalp-message ${type}`;
            messageDiv.innerHTML = `<div class="sukalp-message-content">${this.escapeHtml(content)}</div>`;
            this.messagesContainer.appendChild(messageDiv);
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }

        showTypingIndicator() {
            const indicator = document.createElement('div');
            indicator.className = 'sukalp-message bot';
            indicator.innerHTML = `
                <div class="sukalp-message-content">
                    <div class="sukalp-typing-indicator">
                        <div class="sukalp-typing-dot"></div>
                        <div class="sukalp-typing-dot"></div>
                        <div class="sukalp-typing-dot"></div>
                    </div>
                </div>
            `;
            indicator.id = 'sukalp-typing';
            this.messagesContainer.appendChild(indicator);
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }

        hideTypingIndicator() {
            const indicator = document.getElementById('sukalp-typing');
            if (indicator) {
                indicator.remove();
            }
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? 
                `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
                '102, 126, 234';
        }

        adjustColor(hex, amount) {
            const num = parseInt(hex.slice(1), 16);
            const r = Math.min(255, Math.max(0, (num >> 16) + amount));
            const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
            const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
            return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
        }
    }

    // Export to global scope
    window.SukalpWidget = SukalpWidget;
})();
