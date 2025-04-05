'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth';
import userService, { UserWithStatus } from '@/services/UserService';

// Re-export the UserWithStatus type
export type { UserWithStatus as User };

// Utility function to get real users for other components
export const getUsers = (): UserWithStatus[] => {
  return userService.getUsers();
};

export function UserList() {
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const { user: currentUser } = useAuth();

  // Fetch all users from the service
  const fetchUsers = useCallback(() => {
    const fetchedUsers = userService.getUsers();
    setUsers(fetchedUsers);
  }, []);
  
  // Initial fetch of users
  useEffect(() => {
    fetchUsers();
    
    // Mark current user as online when component mounts
    if (currentUser) {
      userService.updateUserStatus(currentUser.id, 'online');
    }

    // Set up periodic refresh
    const refreshInterval = setInterval(fetchUsers, 10000); // Refresh every 10 seconds
    
    // Set up inactivity tracking
    let inactivityTimer: NodeJS.Timeout;
    
    const resetInactivityTimer = () => {
      if (currentUser) {
        // Clear any existing timer
        if (inactivityTimer) clearTimeout(inactivityTimer);
        
        // Set user to 'away' after 5 minutes of inactivity
        inactivityTimer = setTimeout(() => {
          userService.updateUserStatus(currentUser.id, 'away');
        }, 5 * 60 * 1000);
      }
    };

    // Track user activity
    const trackActivity = () => {
      if (currentUser) {
        userService.updateUserStatus(currentUser.id, 'online');
        resetInactivityTimer();
      }
    };

    // Add event listeners for user activity
    window.addEventListener('mousemove', trackActivity);
    window.addEventListener('keydown', trackActivity);
    window.addEventListener('click', trackActivity);
    
    // Start the inactivity timer
    resetInactivityTimer();

    // Clean up on unmount
    return () => {
      clearInterval(refreshInterval);
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', trackActivity);
      window.removeEventListener('keydown', trackActivity);
      window.removeEventListener('click', trackActivity);
      
      // Set user to offline when component unmounts, if they're the current user
      if (currentUser) {
        userService.updateUserStatus(currentUser.id, 'offline');
      }
    };
  }, [currentUser, fetchUsers]);
  
  // Render a status indicator based on user status
  const renderStatusIndicator = (status: 'online' | 'away' | 'offline') => {
    let statusColor = 'bg-gray-400'; // Default for offline (gray)
    let statusText = 'Offline';
    
    if (status === 'online') {
      statusColor = 'bg-green-500'; // Live green for online
      statusText = 'Online';
    } else if (status === 'away') {
      statusColor = 'bg-amber-400'; // Light orange for away
      statusText = 'Away';
    }
    
    return (
      <span className="flex items-center text-xs text-gray-400">
        <span className={`${statusColor} w-2 h-2 rounded-full mr-1.5`}></span>
        {statusText}
      </span>
    );
  };
  
  // Format time since last active
  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Sort users: online first, then away, then offline
  const sortedUsers = [...users].sort((a, b) => {
    const statusOrder = { online: 0, away: 1, offline: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="overflow-auto max-h-[calc(100vh-200px)]">
      <ul className="divide-y divide-border">
        {sortedUsers.map(user => (
          <li key={user.id} className="p-3 hover:bg-accent/10 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/70 to-primary rounded-full flex items-center justify-center text-white font-medium">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <span 
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-card rounded-full ${
                    user.status === 'online' ? 'bg-green-500' : 
                    user.status === 'away' ? 'bg-amber-400' : 'bg-gray-400'
                  }`}
                ></span>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                {user.status !== 'online' && (
                  <p className="text-xs text-muted-foreground truncate">
                    Last active: {formatLastActive(user.lastActive)}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
