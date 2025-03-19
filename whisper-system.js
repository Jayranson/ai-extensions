/**
 * AI Chat Network - Enhanced Whisper System Extension
 * Adds User-to-User and AI-to-User whispers with history
 */

(function() {
    // Configuration
    const WHISPER_HISTORY_SIZE = 100; // Maximum number of whispers to store per conversation
    
    // Store whisper history
    let whisperHistory = {};
    
    // Track current whisper recipient
    let currentWhisperTarget = null;
    
    // Initialize once DOM is loaded
    document.addEventListener('DOMContentLoaded', initWhisperSystem);
    
    function initWhisperSystem() {
        // Load saved whisper history from localStorage
        loadWhisperHistory();
        
        // Setup whisper UI elements
        createWhisperUI();
        
        // Setup message input interception for whisper detection
        setupMessageInterception();
        
        // Setup right-click context menu for user whispers
        setupUserContextMenu();
        
        console.log('Enhanced whisper system extension loaded successfully.');
    }
    
    function loadWhisperHistory() {
        try {
            const savedHistory = localStorage.getItem('whisperHistory');
            if (savedHistory) {
                whisperHistory = JSON.parse(savedHistory);
            }
        } catch (e) {
            console.error('Failed to load whisper history:', e);
            whisperHistory = {};
        }
    }
    
    function saveWhisperHistory() {
        try {
            localStorage.setItem('whisperHistory', JSON.stringify(whisperHistory));
        } catch (e) {
            console.error('Failed to save whisper history:', e);
        }
    }
    
    function createWhisperUI() {
        // Create whisper mode indicator
        const chatHeader = document.querySelector('.chat-header, .room-header');
        if (chatHeader) {
            const whisperIndicator = document.createElement('div');
            whisperIndicator.id = 'whisper-indicator';
            whisperIndicator.className = 'whisper-indicator';
            whisperIndicator.style.display = 'none';
            whisperIndicator.innerHTML = `
                <span class="whisper-text">Whispering to: </span>
                <span class="whisper-target"></span>
                <button class="exit-whisper-btn">✕</button>
            `;
            chatHeader.appendChild(whisperIndicator);
            
            // Add event listener to exit whisper mode button
            const exitButton = whisperIndicator.querySelector('.exit-whisper-btn');
            if (exitButton) {
                exitButton.addEventListener('click', exitWhisperMode);
            }
        }
        
        // Create whisper history panel
        const chatContainer = document.querySelector('.chat-container, .main-container');
        if (chatContainer) {
            const whisperPanel = document.createElement('div');
            whisperPanel.id = 'whisper-history-panel';
            whisperPanel.className = 'whisper-history-panel';
            whisperPanel.style.display = 'none';
            whisperPanel.innerHTML = `
                <div class="whisper-panel-header">
                    <h3>Whisper History</h3>
                    <button class="close-whisper-panel-btn">✕</button>
                </div>
                <div class="whisper-list">
                    <div class="whisper-contacts"></div>
                </div>
                <div class="whisper-messages"></div>
            `;
            chatContainer.appendChild(whisperPanel);
            
            // Add event listener to close whisper panel button
            const closeButton = whisperPanel.querySelector('.close-whisper-panel-btn');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    whisperPanel.style.display = 'none';
                });
            }
            
            // Add event listeners for whisper contacts
            setupWhisperContactsEvents();
        }
        
        // Add whisper toggle button to UI
        const chatControls = document.querySelector('.chat-controls, .message-controls');
        if (chatControls) {
            const whisperButton = document.createElement('button');
            whisperButton.id = 'toggle-whisper-history';
            whisperButton.className = 'whisper-toggle-btn';
            whisperButton.innerHTML = '<span>💬</span>';
            whisperButton.title = 'Toggle Whisper History';
            chatControls.appendChild(whisperButton);
            
            whisperButton.addEventListener('click', toggleWhisperHistoryPanel);
        }
        
        // Add CSS styles for whisper elements
        addWhisperStyles();
    }
    
    function addWhisperStyles() {
        const styleSheet = document.createElement('style');
        styleSheet.type = 'text/css';
        styleSheet.textContent = `
            .whisper-indicator {
                background-color: #f2e6ff;
                color: #6600cc;
                padding: 5px 10px;
                border-radius: 4px;
                margin: 5px 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .whisper-text {
                margin-right: 5px;
                font-weight: bold;
            }
            
            .whisper-target {
                color: #9900cc;
                font-weight: bold;
            }
            
            .exit-whisper-btn {
                margin-left: 10px;
                cursor: pointer;
                background: none;
                border: none;
                color: #6600cc;
                font-weight: bold;
            }
            
            .whisper-toggle-btn {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 1.2em;
                padding: 5px;
                margin-left: 10px;
            }
            
            .whisper-toggle-btn:hover {
                color: #9900cc;
            }
            
            .whisper-history-panel {
                position: absolute;
                top: 60px;
                right: 20px;
                width: 300px;
                height: 400px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                z-index: 100;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .whisper-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background: #f2e6ff;
                border-bottom: 1px solid #ddd;
            }
            
            .whisper-panel-header h3 {
                margin: 0;
                color: #6600cc;
            }
            
            .close-whisper-panel-btn {
                background: none;
                border: none;
                cursor: pointer;
                color: #6600cc;
                font-weight: bold;
            }
            
            .whisper-list {
                width: 100px;
                border-right: 1px solid #ddd;
                overflow-y: auto;
            }
            
            .whisper-contacts {
                display: flex;
                flex-direction: column;
            }
            
            .whisper-contact {
                padding: 10px;
                cursor: pointer;
                border-bottom: 1px solid #eee;
            }
            
            .whisper-contact:hover {
                background: #f5f5f5;
            }
            
            .whisper-contact.active {
                background: #f2e6ff;
                font-weight: bold;
            }
            
            .whisper-messages {
                flex: 1;
                overflow-y: auto;
                padding: 10px;
            }
            
            .whisper-message {
                margin-bottom: 8px;
                padding: 5px;
                border-radius: 4px;
                max-width: 80%;
            }
            
            .whisper-message.outgoing {
                background: #e6f2ff;
                margin-left: auto;
            }
            
            .whisper-message.incoming {
                background: #f2f2f2;
                margin-right: auto;
            }
            
            .whisper-message .sender {
                font-weight: bold;
                margin-bottom: 2px;
                font-size: 0.8em;
            }
            
            .whisper-message .content {
                word-break: break-word;
            }
            
            .whisper-message .timestamp {
                text-align: right;
                font-size: 0.7em;
                color: #888;
                margin-top: 2px;
            }
            
            .message.whisper {
                background-color: rgba(102, 0, 204, 0.1);
                border-left: 3px solid #6600cc;
            }
            
            .user-context-menu {
                position: absolute;
                background: white;
                border: 1px solid #ddd;
                border-radius: 4px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                z-index: 1000;
                display: none;
            }
            
            .context-menu-item {
                padding: 8px 12px;
                cursor: pointer;
            }
            
            .context-menu-item:hover {
                background: #f5f5f5;
            }
        `;
        document.head.appendChild(styleSheet);
    }
    
    function setupMessageInterception() {
        // Get the message input and send button
        const messageInput = document.getElementById('message-input');
        const sendButton = document.querySelector('#send-message, button[type="submit"]');
        
        if (!messageInput || !sendButton) {
            console.error('Message input or send button not found');
            return;
        }
        
        // Save original event listeners
        const originalSendEvent = sendButton.onclick;
        
        // Override send button click event
        sendButton.onclick = function(e) {
            const message = messageInput.value.trim();
            
            // Check if in whisper mode
            if (currentWhisperTarget) {
                e.preventDefault();
                sendWhisper(currentWhisperTarget, message);
                messageInput.value = '';
                return false;
            }
            
            // Check if message is a whisper command
            if (message.startsWith('/w ') || message.startsWith('/whisper ')) {
                e.preventDefault();
                
                // Parse whisper command
                const parts = message.split(' ');
                const command = parts[0];
                const recipient = parts[1];
                const whisperMessage = parts.slice(2).join(' ');
                
                if (recipient && whisperMessage) {
                    sendWhisper(recipient, whisperMessage);
                    messageInput.value = '';
                } else {
                    showNotification('Whisper format: /w username message');
                }
                
                return false;
            }
            
            // Not a whisper, proceed with original event handler
            if (originalSendEvent) {
                return originalSendEvent.call(this, e);
            }
            
            return true;
        };
        
        // Also handle Enter key in input field
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                const message = messageInput.value.trim();
                
                // Check if in whisper mode
                if (currentWhisperTarget) {
                    e.preventDefault();
                    sendWhisper(currentWhisperTarget, message);
                    messageInput.value = '';
                    return false;
                }
                
                // Check if message is a whisper command
                if (message.startsWith('/w ') || message.startsWith('/whisper ')) {
                    e.preventDefault();
                    
                    // Parse whisper command
                    const parts = message.split(' ');
                    const command = parts[0];
                    const recipient = parts[1];
                    const whisperMessage = parts.slice(2).join(' ');
                    
                    if (recipient && whisperMessage) {
                        sendWhisper(recipient, whisperMessage);
                        messageInput.value = '';
                    } else {
                        showNotification('Whisper format: /w username message');
                    }
                    
                    return false;
                }
            }
        });
    }
    
    function setupUserContextMenu() {
        // Create context menu element
        const contextMenu = document.createElement('div');
        contextMenu.className = 'user-context-menu';
        contextMenu.id = 'user-context-menu';
        contextMenu.innerHTML = `
            <div class="context-menu-item whisper-option">Whisper</div>
            <div class="context-menu-item kick-option">Kick</div>
            <div class="context-menu-item ban-option">Ban</div>
            <div class="context-menu-item mute-option">Mute</div>
            <div class="context-menu-item profile-option">View Profile</div>
        `;
        document.body.appendChild(contextMenu);
        
        // Add event listeners to context menu items
        const whisperOption = contextMenu.querySelector('.whisper-option');
        const kickOption = contextMenu.querySelector('.kick-option');
        const banOption = contextMenu.querySelector('.ban-option');
        const muteOption = contextMenu.querySelector('.mute-option');
        const profileOption = contextMenu.querySelector('.profile-option');
        
        whisperOption.addEventListener('click', function() {
            const username = contextMenu.dataset.username;
            if (username) {
                enterWhisperMode(username);
            }
            hideContextMenu();
        });
        
        kickOption.addEventListener('click', function() {
            const username = contextMenu.dataset.username;
            if (username && checkIfUserIsAdmin()) {
                performAdminAction('kick', username);
            }
            hideContextMenu();
        });
        
        banOption.addEventListener('click', function() {
            const username = contextMenu.dataset.username;
            if (username && checkIfUserIsAdmin()) {
                performAdminAction('ban', username);
            }
            hideContextMenu();
        });
        
        muteOption.addEventListener('click', function() {
            const username = contextMenu.dataset.username;
            if (username && checkIfUserIsAdmin()) {
                performAdminAction('mute', username);
            }
            hideContextMenu();
        });
        
        profileOption.addEventListener('click', function() {
            const username = contextMenu.dataset.username;
            if (username) {
                window.location.href = `/profile/${username}`;
            }
            hideContextMenu();
        });
        
        // Add right-click event listener to usernames in chat
        document.addEventListener('mousedown', function(e) {
            // Only handle right-click
            if (e.button !== 2) {
                return;
            }
            
            // Check if clicked element is a username
            let target = e.target;
            while (target && !target.classList.contains('username') && !target.classList.contains('user-item')) {
                target = target.parentElement;
                if (!target || target === document.body) {
                    return;
                }
            }
            
            // If target is a username, show context menu
            if (target) {
                e.preventDefault();
                
                const username = target.textContent.trim();
                const currentUsername = getCurrentUsername();
                
                // Don't show context menu for current user
                if (username === currentUsername) {
                    return;
                }
                
                // Show/hide admin options based on permissions
                const isAdmin = checkIfUserIsAdmin();
                kickOption.style.display = isAdmin ? 'block' : 'none';
                banOption.style.display = isAdmin ? 'block' : 'none';
                muteOption.style.display = isAdmin ? 'block' : 'none';
                
                // Position and show context menu
                contextMenu.style.left = `${e.pageX}px`;
                contextMenu.style.top = `${e.pageY}px`;
                contextMenu.style.display = 'block';
                contextMenu.dataset.username = username;
            }
        });
        
        // Hide context menu when clicking elsewhere
        document.addEventListener('click', hideContextMenu);
    }
    
    function hideContextMenu() {
        const contextMenu = document.getElementById('user-context-menu');
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
    }
    
    function enterWhisperMode(username) {
        currentWhisperTarget = username;
        
        // Update whisper indicator
        const whisperIndicator = document.getElementById('whisper-indicator');
        const targetSpan = whisperIndicator.querySelector('.whisper-target');
        
        if (whisperIndicator && targetSpan) {
            targetSpan.textContent = username;
            whisperIndicator.style.display = 'flex';
        }
        
        // Focus message input
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.focus();
            messageInput.placeholder = `Whisper to ${username}...`;
        }
    }
    
    function exitWhisperMode() {
        currentWhisperTarget = null;
        
        // Hide whisper indicator
        const whisperIndicator = document.getElementById('whisper-indicator');
        if (whisperIndicator) {
            whisperIndicator.style.display = 'none';
        }
        
        // Reset message input placeholder
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.placeholder = 'Type a message...';
            messageInput.focus();
        }
    }
    
    function sendWhisper(recipient, message) {
        if (!message.trim()) {
            return;
        }
        
        const currentUsername = getCurrentUsername();
        const timestamp = new Date().toISOString();
        
        // Create whisper message object
        const whisperObj = {
            sender: currentUsername,
            recipient: recipient,
            content: message,
            timestamp: timestamp,
            isAI: recipient === 'AI' || recipient.toLowerCase().includes('ai')
        };
        
        // Store in history
        storeWhisperInHistory(whisperObj);
        
        // Send to server (if available)
        sendWhisperToServer(whisperObj);
        
        // Display locally
        displayWhisperMessage(whisperObj, true);
    }
    
    function storeWhisperInHistory(whisperObj) {
        const currentUsername = getCurrentUsername();
        const otherUser = whisperObj.sender === currentUsername ? 
                         whisperObj.recipient : whisperObj.sender;
        
        // Create conversation key
        const conversationKey = [currentUsername, otherUser].sort().join('-');
        
        // Initialize conversation array if it doesn't exist
        if (!whisperHistory[conversationKey]) {
            whisperHistory[conversationKey] = [];
        }
        
        // Add whisper to history
        whisperHistory[conversationKey].push(whisperObj);
        
        // Limit history size
        if (whisperHistory[conversationKey].length > WHISPER_HISTORY_SIZE) {
            whisperHistory[conversationKey].shift();
        }
        
        // Save updated history
        saveWhisperHistory();
        
        // Update whisper contacts list
        updateWhisperContacts();
    }
    
    function sendWhisperToServer(whisperObj) {
        // If socket.io is available, use it
        if (window.socket && typeof window.socket.emit === 'function') {
            window.socket.emit('whisper', whisperObj);
            return;
        }
        
        // Alternative: use fetch API
        fetch('/api/whisper', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(whisperObj)
        })
        .catch(error => {
            console.error('Error sending whisper:', error);
        });
    }
    
    function displayWhisperMessage(whisperObj, showInChat = true) {
        const currentUsername = getCurrentUsername();
        const isOutgoing = whisperObj.sender === currentUsername;
        
        // 1. Display in the chat (only if showInChat is true)
        if (showInChat) {
            const chatContainer = document.querySelector('.chat-messages, .messages-container');
            if (chatContainer) {
                const whisperElement = document.createElement('div');
                whisperElement.className = 'message whisper';
                
                // Create whisper message HTML
                let whisperText = isOutgoing ?
                    `To ${whisperObj.recipient} (whisper): ${whisperObj.content}` :
                    `From ${whisperObj.sender} (whisper): ${whisperObj.content}`;
                
                whisperElement.innerHTML = `
                    <div class="message-header">
                        <span class="username">${isOutgoing ? 'You' : whisperObj.sender}</span>
                        <span class="whisper-indicator-text">${isOutgoing ? `→ ${whisperObj.recipient}` : '→ You'}</span>
                        <span class="timestamp">${new Date(whisperObj.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div class="message-content">${whisperObj.content}</div>
                `;
                
                chatContainer.appendChild(whisperElement);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }
        
        // 2. If whisper panel is open with this conversation, show message there too
        const whisperPanel = document.getElementById('whisper-history-panel');
        if (whisperPanel && whisperPanel.style.display !== 'none') {
            const currentContact = whisperPanel.dataset.currentContact;
            const otherUser = isOutgoing ? whisperObj.recipient : whisperObj.sender;
            
            if (currentContact === otherUser) {
                displayWhisperConversation(currentContact);
            }
        }
    }
    
    function toggleWhisperHistoryPanel() {
        const whisperPanel = document.getElementById('whisper-history-panel');
        if (!whisperPanel) return;
        
        const isVisible = whisperPanel.style.display !== 'none';
        
        if (isVisible) {
            whisperPanel.style.display = 'none';
        } else {
            // Update whisper contacts and show panel
            updateWhisperContacts();
            whisperPanel.style.display = 'flex';
        }
    }
    
    function updateWhisperContacts() {
        const contactsContainer = document.querySelector('.whisper-contacts');
        if (!contactsContainer) return;
        
        // Clear existing contacts
        contactsContainer.innerHTML = '';
        
        // Get current username
        const currentUsername = getCurrentUsername();
        
        // Get all unique contacts from whisper history
        const contacts = new Set();
        
        Object.keys(whisperHistory).forEach(key => {
            const users = key.split('-');
            users.forEach(user => {
                if (user !== currentUsername) {
                    contacts.add(user);
                }
            });
        });
        
        // Create contact elements
        contacts.forEach(contact => {
            const contactElement = document.createElement('div');
            contactElement.className = 'whisper-contact';
            contactElement.textContent = contact;
            contactElement.dataset.username = contact;
            
            contactElement.addEventListener('click', function() {
                // Mark as active
                document.querySelectorAll('.whisper-contact').forEach(el => {
                    el.classList.remove('active');
                });
                this.classList.add('active');
                
                // Display conversation
                displayWhisperConversation(contact);
                
                // Set current contact on panel
                const panel = document.getElementById('whisper-history-panel');
                if (panel) {
                    panel.dataset.currentContact = contact;
                }
            });
            
            contactsContainer.appendChild(contactElement);
        });
        
        // If no contacts, show message
        if (contacts.size === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-whispers';
            emptyMessage.textContent = 'No whisper conversations yet';
            contactsContainer.appendChild(emptyMessage);
        }
    }
    
    function displayWhisperConversation(contact) {
        const messagesContainer = document.querySelector('.whisper-messages');
        if (!messagesContainer) return;
        
        // Clear existing messages
        messagesContainer.innerHTML = '';
        
        // Get current username
        const currentUsername = getCurrentUsername();
        
        // Create conversation key
        const conversationKey = [currentUsername, contact].sort().join('-');
        
        // Get conversation messages
        const messages = whisperHistory[conversationKey] || [];
        
        // Sort messages by timestamp
        messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // Display messages
        messages.forEach(msg => {
            const isOutgoing = msg.sender === currentUsername;
            
            const messageElement = document.createElement('div');
            messageElement.className = `whisper-message ${isOutgoing ? 'outgoing' : 'incoming'}`;
            
            messageElement.innerHTML = `
                <div class="sender">${isOutgoing ? 'You' : msg.sender}</div>
                <div class="content">${msg.content}</div>
                <div class="timestamp">${new Date(msg.timestamp).toLocaleTimeString()}</div>
            `;
            
            messagesContainer.appendChild(messageElement);
        });
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add quick reply button
        const replyButton = document.createElement('button');
        replyButton.className = 'reply-button';
        replyButton.textContent = 'Reply';
        replyButton.addEventListener('click', function() {
            enterWhisperMode(contact);
            
            // Hide whisper panel
            const panel = document.getElementById('whisper-history-panel');
            if (panel) {
                panel.style.display = 'none';
            }
        });
        
        messagesContainer.appendChild(replyButton);
    }
    
    function setupWhisperContactsEvents() {
        // Already handled in updateWhisperContacts function
    }
    
    // Utility functions - similar to those in slash-commands extension
    
    function getCurrentUsername() {
        // Try to get username from the UI
        const usernameElement = document.querySelector('.current-user-name, .username');
        if (usernameElement) {
            return usernameElement.textContent.trim();
        }
        
        // Fallback: try to get from localStorage or other storage
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            return storedUsername;
        }
        
        return "User"; // Default fallback
    }
    
    function checkIfUserIsAdmin() {
        // Check if user has admin privileges
        const adminFlag = localStorage.getItem('isAdmin');
        if (adminFlag === 'true') {
            return true;
        }
        
        // Alternative: check for admin elements in the UI
        const adminElements = document.querySelectorAll('.admin-badge, .admin-controls');
        if (adminElements.length > 0) {
            return true;
        }
        
        return false; // Default to not admin
    }
    
    function performAdminAction(action, targetUser) {
        // Use SlashCommands API if available
        if (window.SlashCommands && typeof window.SlashCommands.performAdminAction === 'function') {
            window.SlashCommands.performAdminAction(action, targetUser);
            return;
        }
        
        // Fallback implementation
        if (window.socket && typeof window.socket.emit === 'function') {
            window.socket.emit('admin-action', {
                action: action,
                targetUser: targetUser,
                room: getCurrentRoom()
            });
            return;
        }
        
        // Alternative: Try to use fetch to call admin API
        fetch('/api/admin/action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                action: action,
                targetUser: targetUser,
                room: getCurrentRoom()
            })
        })
        .catch(error => {
            console.error('Admin action error:', error);
            showNotification(`Failed to perform ${action} on ${targetUser}`);
        });
    }
    
    function getCurrentRoom() {
        // Get the current room ID
        const roomId = location.pathname.split('/').pop();
        if (roomId) {
            return roomId;
        }
        
        // Alternative: try to get from localStorage
        return localStorage.getItem('currentRoom') || 'general';
    }
    
    function showNotification(message) {
        // Use SlashCommands API if available
        if (window.SlashCommands && typeof window.SlashCommands.showNotification === 'function') {
            window.SlashCommands.showNotification(message);
            return;
        }
        
        // Method A: Use existing notification system if available
        if (typeof window.showNotification === 'function') {
            window.showNotification(message);
            return;
        }
        
        // Method B: Create a custom notification
        const notification = document.createElement('div');
        notification.className = 'custom-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 1000;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
    
    // Listen for whisper events from server
    if (window.socket && typeof window.socket.on === 'function') {
        window.socket.on('whisper', function(data) {
            // Store whisper in history
            storeWhisperInHistory(data);
            
            // Display whisper
            displayWhisperMessage(data);
        });
    }
    
    // Expose public API for other extensions
    window.WhisperSystem = {
        enterWhisperMode,
        exitWhisperMode,
        sendWhisper,
        toggleWhisperHistoryPanel
    };
})();
