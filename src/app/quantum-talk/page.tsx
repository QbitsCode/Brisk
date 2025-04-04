'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth';
import Link from 'next/link';
import { 
  ThumbsUp, 
  MessageSquare, 
  ChevronRight, 
  Send,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui';
import { TopicList } from '@/components/quantum-talk/TopicList';
import { UserList } from '@/components/quantum-talk/UserList';
import { TopicView } from '@/components/quantum-talk/TopicView';

export default function QuantumTalkPage() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">QuantumTalk</h1>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
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
