/**
 * AI Chat Network - Profile Page Fix Extension
 * Fixes the issue where clicking on a user's profile goes to admin page
 */

(function() {
    // Initialize once DOM is loaded
    document.addEventListener('DOMContentLoaded', initProfileFix);
    
    function initProfileFix() {
        // Fix profile links in chat room
        fixProfileLinksInChat();
        
        // Fix admin crown display
        fixAdminCrownDisplay();
        
        // Add admin features to profile page if needed
        addAdminFeaturesToProfile();
        
        console.log('Profile fix extension loaded successfully.');
    }
    
    function fixProfileLinksInChat() {
        // Get all username elements that should be clickable
        const usernameElements = document.querySelectorAll('.username:not(.message-input .username)');
        
        usernameElements.forEach(el => {
            // Remove any existing click handlers by cloning and replacing
            const newEl = el.cloneNode(true);
            
            // Add custom click handler
            newEl.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const username = this.textContent.trim();
                navigateToUserProfile(username);
            });
            
            // Make sure it looks clickable
            newEl.style.cursor = 'pointer';
            
            // Replace original element
            if (el.parentNode) {
                el.parentNode.replaceChild(newEl, el);
            }
        });
    }
    
    function navigateToUserProfile(username) {
        // Navigate to the correct profile page
        window.location.href = `/profile/${encodeURIComponent(username)}`;
    }
    
    function fixAdminCrownDisplay() {
        // Get all username elements
        const usernameElements = document.querySelectorAll('.username');
        
        // Check if we're on the profile page
        const isProfilePage = window.location.pathname.includes('/profile');
        
        // Get admins list (from local storage or other source)
        const admins = getAdminsList();
        
        usernameElements.forEach(el => {
            const username = el.textContent.trim();
            
            // Check if this username is an admin
            if (admins.includes(username)) {
                // Add crown if not already present
                if (!el.querySelector('.admin-crown')) {
                    const crown = document.createElement('span');
                    crown.className = 'admin-crown';
                    crown.innerHTML = '👑 ';
                    crown.title = 'Admin';
                    el.prepend(crown);
                }
            }
        });
        
        // If we're on the profile page, check if it's an admin profile
        if (isProfilePage) {
            const profileUsername = window.location.pathname.split('/').pop();
            if (admins.includes(profileUsername)) {
                addAdminBadgeToProfile();
            }
        }
    }
    
    function addAdminBadgeToProfile() {
        const profileHeader = document.querySelector('.profile-header, .user-info');
        if (profileHeader) {
            const adminBadge = document.createElement('div');
            adminBadge.className = 'admin-badge';
            adminBadge.innerHTML = '👑 Administrator';
            adminBadge.style.cssText = `
                background-color: #ffd700;
                color: #000;
                padding: 5px 10px;
                border-radius: 4px;
                display: inline-block;
                margin: 10px 0;
                font-weight: bold;
            `;
            profileHeader.appendChild(adminBadge);
        }
    }
    
    function addAdminFeaturesToProfile() {
        // Check if current user is an admin and on their own profile
        const isAdmin = checkIfUserIsAdmin();
        const currentUsername = getCurrentUsername();
        const profileUsername = window.location.pathname.split('/').pop();
        
        if (isAdmin && currentUsername === profileUsername) {
            // Add admin controls to own profile
            addAdminControlsToProfile();
        }
    }
    
    function addAdminControlsToProfile() {
        const profileContent = document.querySelector('.profile-content, .user-info');
        if (!profileContent) return;
        
        // Create admin controls section
        const adminSection = document.createElement('div');
        adminSection.className = 'admin-controls-section';
        adminSection.innerHTML = `
            <h3>Admin Controls</h3>
            <div class="admin-control-buttons">
                <button class="admin-btn view-reports-btn">View Reports</button>
                <button class="admin-btn manage-rooms-btn">Manage Rooms</button>
                <button class="admin-btn manage-users-btn">Manage Users</button>
                <button class="admin-btn admin-settings-btn">Admin Settings</button>
            </div>
        `;
        
        // Apply some styling
        const style = document.createElement('style');
        style.textContent = `
            .admin-controls-section {
                margin-top: 20px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #ddd;
            }
            
            .admin-controls-section h3 {
                margin-top: 0;
                color: #333;
            }
            
            .admin-control-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 10px;
            }
            
            .admin-btn {
                padding: 8px 12px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            }
            
            .admin-btn:hover {
                background-color: #0069d9;
            }
        `;
        
        document.head.appendChild(style);
        profileContent.appendChild(adminSection);
        
        // Add event listeners to buttons
        const viewReportsBtn = adminSection.querySelector('.view-reports-btn');
        const manageRoomsBtn = adminSection.querySelector('.manage-rooms-btn');
        const manageUsersBtn = adminSection.querySelector('.manage-users-btn');
        const adminSettingsBtn = adminSection.querySelector('.admin-settings-btn');
        
        viewReportsBtn.addEventListener('click', function() {
            window.location.href = '/admin/reports';
        });
        
        manageRoomsBtn.addEventListener('click', function() {
            window.location.href = '/admin/rooms';
        });
        
        manageUsersBtn.addEventListener('click', function() {
            window.location.href = '/admin/users';
        });
        
        adminSettingsBtn.addEventListener('click', function() {
            window.location.href = '/admin/settings';
        });
    }
    
    // Utility functions
    
    function getAdminsList() {
        // Try to get from localStorage
        const storedAdmins = localStorage.getItem('admins');
        if (storedAdmins) {
            try {
                return JSON.parse(storedAdmins);
            } catch (e) {
                console.error('Failed to parse admins list:', e);
            }
        }
        
        // If we have a current user who is admin, add them to the list
        const currentUsername = getCurrentUsername();
        const isAdmin = checkIfUserIsAdmin();
        
        if (isAdmin) {
            return [currentUsername];
        }
        
        return [];
    }
    
    function getCurrentUsername() {
        // Try to get username from the UI
        const usernameElement = document.querySelector('.current-user-name, .username.current-user');
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
})();
