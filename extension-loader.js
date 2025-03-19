/**
 * AI Chat Network - Extension Loader
 * This script loads all extensions without modifying the original source code
 */

// Create a self-executing function
(function() {
    // Configuration - Enable/disable extensions
    const config = {
        slashCommands: true,
        whisperSystem: true,
        profileFix: true
    };
    
    // Extension paths
    const extensionPaths = {
        slashCommands: '/extensions/slash-commands.js',
        whisperSystem: '/extensions/whisper-system.js',
        profileFix: '/extensions/profile-fix.js'
    };
    
    // Initialize extensions once DOM is loaded
    document.addEventListener('DOMContentLoaded', loadExtensions);
    
    function loadExtensions() {
        // Create extensions directory if needed
        createExtensionsDirectory();
        
        // Only load extensions relevant to current page
        const currentPage = getCurrentPage();
        
        switch(currentPage) {
            case 'chat-room':
                if (config.slashCommands) loadScript(extensionPaths.slashCommands);
                if (config.whisperSystem) loadScript(extensionPaths.whisperSystem);
                break;
                
            case 'profile':
                if (config.profileFix) loadScript(extensionPaths.profileFix);
                break;
                
            default:
                // No extensions for this page
                break;
        }
        
        console.log('Extension loader initialized for page:', currentPage);
    }
    
    function getCurrentPage() {
        const path = window.location.pathname;
        
        if (path.includes('/chat-room') || path.includes('/room/')) {
            return 'chat-room';
        } else if (path.includes('/profile')) {
            return 'profile';
        } else if (path.includes('/login') || path.includes('/register')) {
            return 'auth';
        } else if (path === '/') {
            return 'home';
        } else {
            return 'other';
        }
    }
    
    function loadScript(path) {
        const script = document.createElement('script');
        script.src = path;
        script.async = true;
        script.onerror = function() {
            console.error(`Failed to load extension: ${path}`);
        };
        document.head.appendChild(script);
    }
    
    function createExtensionsDirectory() {
        // This is a client-side function, so we can't actually create a directory
        // This function would be for documentation purposes only
        console.log('Note: You need to create an /extensions directory on your server');
    }
})();
