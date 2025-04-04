'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, MessageSquare, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Types
export interface Topic {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorStatus: 'online' | 'away' | 'offline';
  createdAt: Date;
  likes: string[]; // Array of user IDs who liked
  commentCount: number;
  tags: string[];
}

// Mock data - in a real app this would come from a database
const MOCK_TOPICS: Topic[] = [
  {
    id: '1',
    title: 'New quantum error correction code improves fidelity by 15%',
    content: 'Just implemented a new quantum error correction code that improves fidelity by 15%. Anyone interested in testing it?',
    authorId: '1',
    authorName: 'Alice Chen',
    authorStatus: 'online',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: ['2', '3', '5'],
    commentCount: 4,
    tags: ['Error Correction', 'Fidelity', 'Research']
  },
  {
    id: '2',
    title: 'CV-QKD Protocol Implementation Results',
    content: 'Has anyone experimented with CV-QKD on the Brisk platform yet? I\'m looking for comparative results.',
    authorId: '3',
    authorName: 'Charlie Quantum',
    authorStatus: 'offline',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    likes: ['1', '4', '6'],
    commentCount: 2,
    tags: ['CV-QKD', 'Protocol', 'Benchmarks']
  },
  {
    id: '3',
    title: 'Quantum Circuit Designer Feature Request',
    content: 'Would love to see more beam splitter component types in the circuit designer. Any plans for this?',
    authorId: '4',
    authorName: 'Diana Heisenberg',
    authorStatus: 'online',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    likes: ['1', '2'],
    commentCount: 7,
    tags: ['Features', 'Circuit Designer', 'Components']
  },
  {
    id: '4',
    title: 'Introducing myself to the Brisk community',
    content: 'Hello everyone! I\'m new to quantum computing and excited to learn with this platform.',
    authorId: '5',
    authorName: 'Ethan Bell',
    authorStatus: 'offline',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    likes: ['1', '2', '3', '4', '6'],
    commentCount: 12,
    tags: ['Introduction', 'Beginner']
  },
  {
    id: '5',
    title: 'Simulating a Quantum Teleportation Circuit',
    content: 'I\'ve designed a quantum teleportation circuit in Brisk. Here\'s how I did it and the results I got.',
    authorId: '6',
    authorName: 'Fiona Qubit',
    authorStatus: 'online',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    likes: ['1', '2', '3', '4', '5'],
    commentCount: 9,
    tags: ['Teleportation', 'Circuit', 'Tutorial']
  }
];

export function TopicList({ onSelectTopic }: { onSelectTopic: (topicId: string) => void }) {
  const [topics, setTopics] = useState<Topic[]>(MOCK_TOPICS);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  
  // Get all unique tags from topics
  const allTags = Array.from(new Set(topics.flatMap(topic => topic.tags)));
  
  // Sort and filter topics
  const filteredAndSortedTopics = [...topics]
    .filter(topic => !filterTag || topic.tags.includes(filterTag))
    .sort((a, b) => {
      if (sortBy === 'latest') {
        return b.createdAt.getTime() - a.createdAt.getTime();
      } else {
        return b.likes.length - a.likes.length;
      }
    });
  
  // Render status indicator for author
  const renderStatusIndicator = (status: 'online' | 'away' | 'offline') => {
    const statusColor = 
      status === 'online' ? 'bg-green-500' :
      status === 'away' ? 'bg-amber-400' : 'bg-gray-400';
    
    return <span className={`${statusColor} w-2 h-2 rounded-full inline-block mr-1.5`}></span>;
  };

  return (
    <div className="divide-y divide-border">
      {/* Sort and filter options */}
      <div className="p-4 bg-accent/5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button 
            className={`px-2 py-1 text-sm rounded-md ${sortBy === 'latest' ? 'bg-primary text-primary-foreground' : 'bg-accent/20 hover:bg-accent/30'}`}
            onClick={() => setSortBy('latest')}
          >
            Latest
          </button>
          <button 
            className={`px-2 py-1 text-sm rounded-md ${sortBy === 'popular' ? 'bg-primary text-primary-foreground' : 'bg-accent/20 hover:bg-accent/30'}`}
            onClick={() => setSortBy('popular')}
          >
            Popular
          </button>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {filterTag && (
            <button 
              className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full flex items-center gap-1"
              onClick={() => setFilterTag(null)}
            >
              {filterTag} ×
            </button>
          )}
          {!filterTag && allTags.slice(0, 5).map(tag => (
            <button 
              key={tag}
              className="px-2 py-1 text-xs bg-accent/10 hover:bg-accent/20 rounded-full"
              onClick={() => setFilterTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      
      {/* Topics list */}
      {filteredAndSortedTopics.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No topics found</p>
        </div>
      ) : (
        filteredAndSortedTopics.map(topic => (
          <div 
            key={topic.id}
            className="p-4 hover:bg-accent/5 transition-colors cursor-pointer"
            onClick={() => onSelectTopic(topic.id)}
          >
            <h3 className="text-lg font-medium mb-1">{topic.title}</h3>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {topic.content}
            </p>
            
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="flex items-center text-sm text-muted-foreground">
                  <ThumbsUp className="h-4 w-4 mr-1" /> 
                  <span>{topic.likes.length}</span>
                </span>
                <span className="flex items-center text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4 mr-1" /> 
                  <span>{topic.commentCount}</span>
                </span>
                <span className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" /> 
                  <span>{formatDistanceToNow(topic.createdAt, { addSuffix: true })}</span>
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-sm">
                {renderStatusIndicator(topic.authorStatus)}
                <span>{topic.authorName}</span>
              </div>
            </div>
            
            {/* Tags */}
            {topic.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {topic.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="px-2 py-0.5 text-xs bg-accent/10 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterTag(tag);
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
