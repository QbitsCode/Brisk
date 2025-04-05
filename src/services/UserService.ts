import { User } from '@/components/auth/AuthContext';

// Enhanced user with status information
export interface UserWithStatus extends User {
  status: 'online' | 'away' | 'offline';
  lastActive: Date;
}

// Meeting structure
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  duration: string;
  hostId: string;
  invitees: string[];
  meetingLink: string;
  createdAt: Date;
}

class UserService {
  // Get all registered users from localStorage
  getUsers(): UserWithStatus[] {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('brisk_users') || '[]');
      
      // Filter out sensitive info and add status
      return storedUsers.map((user: any) => {
        // Remove password and add status if not already present
        const { password, ...userWithoutPassword } = user;
        
        return {
          ...userWithoutPassword,
          status: userWithoutPassword.status || 'offline',
          lastActive: userWithoutPassword.lastActive ? new Date(userWithoutPassword.lastActive) : new Date(),
          // Ensure projects exists
          projects: userWithoutPassword.projects || []
        };
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // Update user status
  updateUserStatus(userId: string, status: 'online' | 'away' | 'offline'): boolean {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('brisk_users') || '[]');
      const userIndex = storedUsers.findIndex((u: any) => u.id === userId);
      
      if (userIndex === -1) return false;
      
      // Update status and lastActive
      storedUsers[userIndex].status = status;
      storedUsers[userIndex].lastActive = new Date();
      
      localStorage.setItem('brisk_users', JSON.stringify(storedUsers));
      
      // Also update current user if it's them
      const currentUser = JSON.parse(localStorage.getItem('brisk_user') || 'null');
      if (currentUser && currentUser.id === userId) {
        currentUser.status = status;
        currentUser.lastActive = new Date();
        localStorage.setItem('brisk_user', JSON.stringify(currentUser));
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  }

  // Schedule a meeting and send invitations
  scheduleMeeting(meeting: Omit<Meeting, 'id' | 'createdAt'>): Meeting | null {
    try {
      const newMeeting: Meeting = {
        ...meeting,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date()
      };

      // Store meeting in localStorage
      const meetings = JSON.parse(localStorage.getItem('brisk_meetings') || '[]');
      meetings.push(newMeeting);
      localStorage.setItem('brisk_meetings', JSON.stringify(meetings));

      // Store invitations in each user's inbox
      this.sendMeetingInvitations(newMeeting);

      return newMeeting;
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      return null;
    }
  }

  // Send meeting invitations to all participants
  private sendMeetingInvitations(meeting: Meeting): void {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('brisk_users') || '[]');
      
      // Get all invited users including the host
      const invitedUserIds = [...meeting.invitees, meeting.hostId];
      
      invitedUserIds.forEach(userId => {
        const userIndex = storedUsers.findIndex((u: any) => u.id === userId);
        if (userIndex === -1) return;
        
        // Initialize user inbox if it doesn't exist
        if (!storedUsers[userIndex].inbox) {
          storedUsers[userIndex].inbox = [];
        }
        
        // Add meeting invitation to inbox
        storedUsers[userIndex].inbox.push({
          type: 'meeting_invitation',
          meetingId: meeting.id,
          timestamp: new Date(),
          read: false,
          title: meeting.title,
          date: meeting.date,
          time: meeting.time,
          hostId: meeting.hostId
        });
      });
      
      localStorage.setItem('brisk_users', JSON.stringify(storedUsers));
      
      // Update current user if needed
      const currentUser = JSON.parse(localStorage.getItem('brisk_user') || 'null');
      if (currentUser && invitedUserIds.includes(currentUser.id)) {
        const userIndex = storedUsers.findIndex((u: any) => u.id === currentUser.id);
        if (userIndex !== -1) {
          // Update the current user with the inbox from stored users
          currentUser.inbox = storedUsers[userIndex].inbox;
          localStorage.setItem('brisk_user', JSON.stringify(currentUser));
        }
      }
    } catch (error) {
      console.error('Error sending meeting invitations:', error);
    }
  }

  // Get all meetings for a specific user
  getUserMeetings(userId: string): Meeting[] {
    try {
      const meetings = JSON.parse(localStorage.getItem('brisk_meetings') || '[]');
      
      // Return meetings where user is host or invitee
      return meetings.filter((meeting: Meeting) => 
        meeting.hostId === userId || meeting.invitees.includes(userId)
      );
    } catch (error) {
      console.error('Error fetching user meetings:', error);
      return [];
    }
  }

  // Get user inbox (notifications, invitations, etc.)
  getUserInbox(userId: string): any[] {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('brisk_users') || '[]');
      const user = storedUsers.find((u: any) => u.id === userId);
      
      if (!user) return [];
      
      return user.inbox || [];
    } catch (error) {
      console.error('Error fetching user inbox:', error);
      return [];
    }
  }

  // Mark inbox item as read
  markInboxItemAsRead(userId: string, itemIndex: number): boolean {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('brisk_users') || '[]');
      const userIndex = storedUsers.findIndex((u: any) => u.id === userId);
      
      if (userIndex === -1 || !storedUsers[userIndex].inbox || !storedUsers[userIndex].inbox[itemIndex]) {
        return false;
      }
      
      storedUsers[userIndex].inbox[itemIndex].read = true;
      localStorage.setItem('brisk_users', JSON.stringify(storedUsers));
      
      // Update current user if needed
      const currentUser = JSON.parse(localStorage.getItem('brisk_user') || 'null');
      if (currentUser && currentUser.id === userId) {
        currentUser.inbox = storedUsers[userIndex].inbox;
        localStorage.setItem('brisk_user', JSON.stringify(currentUser));
      }
      
      return true;
    } catch (error) {
      console.error('Error marking inbox item as read:', error);
      return false;
    }
  }

  // Generate a Google Meet link
  generateMeetingLink(): string {
    const randomString = Math.random().toString(36).substring(2, 10);
    return `https://meet.google.com/${randomString}`;
  }
}

// Singleton instance
const userService = new UserService();
export default userService;
