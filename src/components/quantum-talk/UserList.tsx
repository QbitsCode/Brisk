'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth';

// Types
interface User {
  id: string;
  name: string;
  status: 'online' | 'away' | 'offline';
  lastActive: Date;
  avatar?: string;
}

// Mock data - in a real app this would come from a database or API
const MOCK_USERS: User[] = [
  { id: '1', name: 'Alice Chen', status: 'online', lastActive: new Date() },
  { id: '2', name: 'Bob Smith', status: 'away', lastActive: new Date(Date.now() - 15 * 60 * 1000) },
  { id: '3', name: 'Charlie Quantum', status: 'offline', lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { id: '4', name: 'Diana Heisenberg', status: 'online', lastActive: new Date() },
  { id: '5', name: 'Ethan Bell', status: 'offline', lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  { id: '6', name: 'Fiona Qubit', status: 'online', lastActive: new Date() },
];

export function UserList() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const { user: currentUser } = useAuth();
  
  // In a real app, you would fetch users and their status from an API or WebSocket
  useEffect(() => {
    // Simulate periodic status updates
    const interval = setInterval(() => {
      // Randomly change one user's status for demonstration
      if (Math.random() > 0.7) {
        const randomIndex = Math.floor(Math.random() * users.length);
        const statuses: ('online' | 'away' | 'offline')[] = ['online', 'away', 'offline'];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        setUsers(prevUsers => {
          const newUsers = [...prevUsers];
          newUsers[randomIndex] = {
            ...newUsers[randomIndex],
            status: newStatus,
            lastActive: newStatus === 'offline' ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : new Date()
          };
          return newUsers;
        });
      }
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [users]);
  
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
