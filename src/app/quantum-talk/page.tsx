'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth';
import Link from 'next/link';
import { 
  ThumbsUp, 
  MessageSquare, 
  ChevronRight, 
  Send,
  MoreHorizontal,
  CalendarIcon,
  Bell,
  Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TopicList } from '@/components/quantum-talk/TopicList';
import { UserList, User } from '@/components/quantum-talk/UserList';
import { TopicView } from '@/components/quantum-talk/TopicView';
import { MeetingScheduler } from '@/components/quantum-talk/MeetingScheduler';
import userService from '@/services/UserService';

export default function QuantumTalkPage() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [userInbox, setUserInbox] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);
  
  // Fetch user inbox data
  useEffect(() => {
    if (user) {
      const inbox = userService.getUserInbox(user.id);
      setUserInbox(inbox);
      setUnreadCount(inbox.filter((item: any) => !item.read).length);
    }
  }, [user]);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">QuantumTalk</h1>
        <div className="flex items-center gap-3">
          {user && (
            <>
              {/* Notification indicator */}
              {unreadCount > 0 && (
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      // Mark all as read (in a real app, this would open a notification panel)
                      if (user) {
                        userInbox.forEach((item, index) => {
                          if (!item.read) {
                            userService.markInboxItemAsRead(user.id, index);
                          }
                        });
                        setUnreadCount(0);
                      }
                    }}
                  >
                    <Inbox className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  </Button>
                </div>
              )}
              
              {/* Meeting scheduler */}
              <MeetingScheduler 
                currentUserId={user.id} 
              />
            </>
          )}
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Users sidebar */}
        <div className="w-64 bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-medium">Community Members</h2>
          </div>
          <UserList />
        </div>

        {/* Topic list */}
        <div className="flex-1 bg-card rounded-lg shadow-sm overflow-hidden">
          {!selectedTopicId ? (
            <>
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h2 className="font-medium">Topics</h2>
                <Link 
                  href="/quantum-talk/new-topic" 
                  className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md"
                >
                  New Topic
                </Link>
              </div>
              <TopicList onSelectTopic={setSelectedTopicId} />
            </>
          ) : (
            <TopicView 
              topicId={selectedTopicId} 
              onBack={() => setSelectedTopicId(null)} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
