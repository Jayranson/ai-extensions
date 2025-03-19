/**
 * AI Chat Network - Slash Commands Extension
 * This script adds slash command functionality without modifying source code
 */

// Create a self-executing function to avoid polluting global namespace
(function() {
    // Configuration
    const COMMAND_COOLDOWN = 600000; // 10 minutes in milliseconds
    const userCommands = {
        help: { description: "Shows available commands" },
        joke: { description: "Tells a random joke" },
        fact: { description: "Shares a random interesting fact" },
        "8ball": { description: "Magic 8-ball answers your question", args: "[question]" },
        roll: { description: "Rolls dice", args: "[dice]" },
        quote: { description: "Shares a random quote" },
        time: { description: "Shows current server time" },
        flip: { description: "Flips a coin" }
    };
    
    const adminCommands = {
        aikick: { description: "Kick a user from the room (AI performs)", args: "[user]" },
        aiban: { description: "Ban a user from the room (AI performs)", args: "[user]" },
        aimute: { description: "Mute a user in the room (AI performs)", args: "[user]" },
        aiclose: { description: "Close room for violations (AI performs)" },
        aiexit: { description: "Trigger AI to exit room" },
        aisay: { description: "Trigger AI to output message", args: "[message]" },
        kick: { description: "Kick a user (as admin)", args: "[user]" },
        ban: { description: "Ban a user (as admin)", args: "[user]" },
        mute: { description: "Mute a user (as admin)", args: "[user]" },
        close: { description: "Close room (as admin)" }
    };
    
    // Track last command time for cooldown
    let lastCommandTime = 0;
    
    // Store the original message sending function
    let originalSendMessage;
    
    // Wait for page to be fully loaded
    document.addEventListener('DOMContentLoaded', initSlashCommands);
    
    function initSlashCommands() {
        // Get the chat message input
        const messageInput = document.getElementById('message-input');
        if (!messageInput) {
            console.error('Message input not found. Slash commands extension not loaded.');
            return;
        }
        
        // Get the send button
        const sendButton = document.querySelector('#send-message, button[type="submit"]');
        if (!sendButton) {
            console.error('Send button not found. Slash commands extension not loaded.');
            return;
        }
        
        // Intercept the send button click
        sendButton.addEventListener('click', handleMessageSend);
        
        // Also intercept pressing Enter in the input field
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                handleMessageSend(e);
            }
        });
        
        console.log('Slash commands extension loaded successfully.');
    }
    
    function handleMessageSend(e) {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        
        // Check if this is a slash command
        if (message.startsWith('/')) {
            e.preventDefault(); // Prevent default send behavior
            
            const commandParts = message.substring(1).split(' ');
            const commandName = commandParts[0].toLowerCase();
            const args = commandParts.slice(1).join(' ');
            
            processCommand(commandName, args, messageInput);
            return false;
        }
        
        // Not a command, let original handler process it
        return true;
    }
    
    function processCommand(command, args, messageInput) {
        // Check if the user is an admin
        const isAdmin = checkIfUserIsAdmin();
        
        // Check if the command exists
        if (userCommands[command]) {
            // Check cooldown for user commands
            const now = Date.now();
            if (now - lastCommandTime < COMMAND_COOLDOWN) {
                showNotification('Command cooldown: Please wait before using another command.');
                return;
            }
            
            // Process user command
            executeUserCommand(command, args);
            lastCommandTime = now;
            messageInput.value = ''; // Clear input
            
        } else if (adminCommands[command] && isAdmin) {
            // Process admin command
            executeAdminCommand(command, args);
            messageInput.value = ''; // Clear input
            
        } else {
            showNotification(`Unknown command or insufficient permissions: /${command}`);
        }
    }
    
    function executeUserCommand(command, args) {
        // Get the current username
        const username = getCurrentUsername();
        
        switch(command) {
            case 'help':
                displayHelpCommand();
                break;
                
            case 'joke':
                sendAIMessage(`${username} asked for a joke! Here's one: Why don't scientists trust atoms? Because they make up everything!`);
                break;
                
            case 'fact':
                sendAIMessage(`${username} wants to know a fun fact! Did you know that honey never spoils? Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly good to eat.`);
                break;
                
            case '8ball':
                const responses = [
                    "It is certain.", "It is decidedly so.", "Without a doubt.",
                    "Yes definitely.", "You may rely on it.", "As I see it, yes.",
                    "Most likely.", "Outlook good.", "Yes.", "Signs point to yes.",
                    "Reply hazy, try again.", "Ask again later.",
                    "Better not tell you now.", "Cannot predict now.",
                    "Concentrate and ask again.", "Don't count on it.",
                    "My reply is no.", "My sources say no.", "Outlook not so good.",
                    "Very doubtful."
                ];
                const response = responses[Math.floor(Math.random() * responses.length)];
                sendAIMessage(`${username} shakes the magic 8-ball... ${response}`);
                break;
                
            case 'roll':
                let rollResult = "1"; // Default
                
                if (args.match(/^\d*d\d+$/i)) {
                    // Parse dice notation (e.g., 2d6)
                    const [count, sides] = args.toLowerCase().split('d');
                    const diceCount = count === "" ? 1 : parseInt(count);
                    const diceSides = parseInt(sides);
                    
                    if (diceCount > 0 && diceCount <= 10 && diceSides > 0 && diceSides <= 100) {
                        let rolls = [];
                        let total = 0;
                        
                        for (let i = 0; i < diceCount; i++) {
                            const roll = Math.floor(Math.random() * diceSides) + 1;
                            rolls.push(roll);
                            total += roll;
                        }
                        
                        rollResult = `${total} (${rolls.join(', ')})`;
                    } else {
                        rollResult = "Invalid dice format. Use format like 2d6 (up to 10d100).";
                    }
                } else {
                    rollResult = "6"; // Default to d6
                }
                
                sendAIMessage(`${username} rolls the dice... ${rollResult}`);
                break;
                
            case 'quote':
                const quotes = [
                    "Be the change you wish to see in the world. - Mahatma Gandhi",
                    "The only thing we have to fear is fear itself. - Franklin D. Roosevelt",
                    "Life is what happens when you're busy making other plans. - John Lennon",
                    "The way to get started is to quit talking and begin doing. - Walt Disney",
                    "The unexamined life is not worth living. - Socrates"
                ];
                const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                sendAIMessage(`${username} requested a quote: "${randomQuote}"`);
                break;
                
            case 'time':
                const now = new Date();
                sendAIMessage(`The current server time is ${now.toLocaleTimeString()}`);
                break;
                
            case 'flip':
                const coin = Math.random() < 0.5 ? "heads" : "tails";
                sendAIMessage(`${username} flips a coin... it lands on ${coin}!`);
                break;
        }
    }
    
    function executeAdminCommand(command, args) {
        // Get the target user for user-targeted commands
        const targetUser = args.split(' ')[0];
        const remainingArgs = args.split(' ').slice(1).join(' ');
        
        switch(command) {
            case 'aikick':
                if (!targetUser) {
                    showNotification('Please specify a user to kick.');
                    return;
                }
                sendAIMessage(`${targetUser} has been kicked from the room.`);
                performAdminAction('kick', targetUser);
                break;
                
            case 'aiban':
                if (!targetUser) {
                    showNotification('Please specify a user to ban.');
                    return;
                }
                sendAIMessage(`${targetUser} has been banned from the room.`);
                performAdminAction('ban', targetUser);
                break;
                
            case 'aimute':
                if (!targetUser) {
                    showNotification('Please specify a user to mute.');
                    return;
                }
                sendAIMessage(`${targetUser} has been muted in this room.`);
                performAdminAction('mute', targetUser);
                break;
                
            case 'aiclose':
                sendAIMessage(`This room has been closed for violations of AI Chat Network terms of use.`);
                closeRoom();
                break;
                
            case 'aiexit':
                sendAIMessage(`I'll be leaving the room now. Goodbye!`);
                // Trigger AI to exit
                break;
                
            case 'aisay':
                if (!args) {
                    showNotification('Please specify a message for the AI to say.');
                    return;
                }
                sendAIMessage(args);
                break;
                
            // Direct admin actions
            case 'kick':
                if (!targetUser) {
                    showNotification('Please specify a user to kick.');
                    return;
                }
                performAdminAction('kick', targetUser);
                break;
                
            case 'ban':
                if (!targetUser) {
                    showNotification('Please specify a user to ban.');
                    return;
                }
                performAdminAction('ban', targetUser);
                break;
                
            case 'mute':
                if (!targetUser) {
                    showNotification('Please specify a user to mute.');
                    return;
                }
                performAdminAction('mute', targetUser);
                break;
                
            case 'close':
                closeRoom();
                break;
        }
    }
    
    function displayHelpCommand() {
        // Get the current username
        const username = getCurrentUsername();
        const isAdmin = checkIfUserIsAdmin();
        
        let helpText = "Available commands (10 minute cooldown between user commands):\n";
        
        // Add user commands to help text
        Object.keys(userCommands).forEach(cmd => {
            const command = userCommands[cmd];
            helpText += `/${cmd}${command.args ? ' ' + command.args : ''} - ${command.description}\n`;
        });
        
        // Add admin commands if user is admin
        if (isAdmin) {
            helpText += "\nAdmin commands (no cooldown):\n";
            Object.keys(adminCommands).forEach(cmd => {
                const command = adminCommands[cmd];
                helpText += `/${cmd}${command.args ? ' ' + command.args : ''} - ${command.description}\n`;
            });
        }
        
        sendAIMessage(`${username} requested help with commands:\n\n${helpText}`);
    }
    
    // Utility functions
    
    function getCurrentUsername() {
        // Try to get username from the UI
        // This needs to be adapted based on how usernames are stored in the app
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
        // This needs to be adapted based on how admin status is stored
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
    
    function sendAIMessage(message) {
        // This needs to be adapted based on how messages are sent in the app
        // Method 1: Use existing socket if available
        if (window.socket && typeof window.socket.emit === 'function') {
            window.socket.emit('ai-message', {
                content: message,
                room: getCurrentRoom(),
                isCommand: true
            });
            return;
        }
        
        // Method 2: Try to find and use existing chat functions
        if (typeof window.sendMessage === 'function') {
            window.sendMessage('AI', message, true);
            return;
        }
        
        // Method 3: Create a mock AI message in the UI directly
        const chatContainer = document.querySelector('.chat-messages, .messages-container');
        if (chatContainer) {
            const aiMessageElement = document.createElement('div');
            aiMessageElement.className = 'message ai-message';
            aiMessageElement.innerHTML = `
                <div class="message-header">
                    <span class="username">AI Assistant</span>
                    <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                </div>
                <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
            `;
            chatContainer.appendChild(aiMessageElement);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
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
    
    function performAdminAction(action, targetUser) {
        // This needs to be adapted based on how admin actions are performed
        // Method 1: Use existing socket if available
        if (window.socket && typeof window.socket.emit === 'function') {
            window.socket.emit('admin-action', {
                action: action,
                targetUser: targetUser,
                room: getCurrentRoom()
            });
            return;
        }
        
        // Method 2: Try to find and use existing admin functions
        if (typeof window.adminAction === 'function') {
            window.adminAction(action, targetUser);
            return;
        }
        
        // Method 3: Try to use fetch to call admin API
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
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to perform admin action');
            }
            return response.json();
        })
        .then(data => {
            showNotification(`${action} action performed on ${targetUser}`);
        })
        .catch(error => {
            console.error('Admin action error:', error);
            showNotification(`Failed to perform ${action} on ${targetUser}`);
        });
    }
    
    function closeRoom() {
        // Similar to performAdminAction but specifically for closing rooms
        if (window.socket && typeof window.socket.emit === 'function') {
            window.socket.emit('close-room', {
                room: getCurrentRoom()
            });
            return;
        }
        
        // Alternative methods would be similar to performAdminAction
    }
    
    function showNotification(message) {
        // Method 1: Use existing notification system if available
        if (typeof window.showNotification === 'function') {
            window.showNotification(message);
            return;
        }
        
        // Method 2: Create a custom notification
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
    
    // Expose a public API for other extensions to use
    window.SlashCommands = {
        isAdmin: checkIfUserIsAdmin,
        sendAIMessage: sendAIMessage,
        performAdminAction: performAdminAction
    };
})();
