'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Send,
  MoreHorizontal 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/components/auth';
import { Topic } from './TopicList';
import { Button } from '@/components/ui';

// Types
interface Comment {
  id: string;
  topicId: string;
  authorId: string;
  authorName: string;
  authorStatus: 'online' | 'away' | 'offline';
  content: string;
  createdAt: Date;
  likes: string[]; // Array of user IDs who liked
}

// Mock data - in a real app this would come from a database
const MOCK_TOPICS: Topic[] = [
  {
    id: '1',
    title: 'New quantum error correction code improves fidelity by 15%',
    content: 'Just implemented a new quantum error correction code that improves fidelity by 15%. Anyone interested in testing it?\n\nThe code uses a novel approach based on surface codes, but with an adaptive measurement scheme that can detect and correct errors more efficiently. I\'ve tested it in simulation and it shows promising results.\n\nI\'m looking for collaborators who can help test this in different quantum computing environments and validate the improvements.',
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
    content: 'Has anyone experimented with CV-QKD on the Brisk platform yet? I\'m looking for comparative results.\n\nI\'ve been working on implementing the continuous-variable QKD protocol and would like to compare my results with others to make sure I\'m on the right track. Specifically, I\'m looking at the key generation rate and the quantum bit error rate under different noise levels.\n\nAny insights or data would be greatly appreciated!',
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
    content: 'Would love to see more beam splitter component types in the circuit designer. Any plans for this?\n\nThe current beam splitter options are great, but for more advanced photonic circuits, having variable ratio beam splitters and polarizing beam splitters would be incredibly useful.\n\nAlso, it would be amazing if we could simulate the quantum interference effects more accurately in the simulations.',
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
    content: 'Hello everyone! I\'m new to quantum computing and excited to learn with this platform.\n\nI have a background in computer science but am just starting to explore quantum computing. Brisk seems like a fantastic tool to learn with, and I\'m looking forward to connecting with others in this community.\n\nDoes anyone have recommendations for beginner-friendly quantum circuits to start implementing?',
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
    content: 'I\'ve designed a quantum teleportation circuit in Brisk. Here\'s how I did it and the results I got.\n\nThe circuit involves creating an entangled pair of qubits, then using Bell-basis measurements and classical communication to teleport a quantum state. I\'ve attached screenshots of my implementation and the simulation results.\n\nInterestingly, I found that the fidelity of the teleported state depends significantly on the quality of the entangled pair. Has anyone else observed this relationship?',
    authorId: '6',
    authorName: 'Fiona Qubit',
    authorStatus: 'online',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    likes: ['1', '2', '3', '4', '5'],
    commentCount: 9,
    tags: ['Teleportation', 'Circuit', 'Tutorial']
  }
];

const MOCK_COMMENTS: Comment[] = [
  {
    id: '1-1',
    topicId: '1',
    authorId: '2',
    authorName: 'Bob Smith',
    authorStatus: 'away',
    content: 'This sounds really interesting! Could you share some more details about the specific error types this correction scheme is most effective against?',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    likes: ['1', '3']
  },
  {
    id: '1-2',
    topicId: '1',
    authorId: '1',
    authorName: 'Alice Chen',
    authorStatus: 'online',
    content: 'It\'s particularly effective against bit-flip errors in noisy environments. The adaptive scheme measures syndrome qubits in a sequence that\'s optimized based on error correlations we observe during the first few cycles.',
    createdAt: new Date(Date.now() - 50 * 60 * 1000),
    likes: ['2', '4']
  },
  {
    id: '1-3',
    topicId: '1',
    authorId: '3',
    authorName: 'Charlie Quantum',
    authorStatus: 'offline',
    content: 'Would you be open to collaborating on implementing this in our lab setup? We have a small quantum processor that might be perfect for testing this.',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    likes: ['1']
  },
  {
    id: '1-4',
    topicId: '1',
    authorId: '1',
    authorName: 'Alice Chen',
    authorStatus: 'online',
    content: 'Absolutely! I\'d love to collaborate. I\'ll send you a direct message to discuss details.',
    createdAt: new Date(Date.now() - 20 * 60 * 1000),
    likes: ['3']
  },
  {
    id: '2-1',
    topicId: '2',
    authorId: '6',
    authorName: 'Fiona Qubit',
    authorStatus: 'online',
    content: 'I\'ve implemented CV-QKD in Brisk and achieved a key rate of about 0.5 bits per symbol at 10dB SNR. What are your current rates?',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    likes: ['3']
  },
  {
    id: '2-2',
    topicId: '2',
    authorId: '3',
    authorName: 'Charlie Quantum',
    authorStatus: 'offline',
    content: 'Thanks for sharing! My rates are slightly lower at around 0.3 bits per symbol. I think the difference might be in how we\'re handling the reconciliation phase. Are you using LDPC codes?',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    likes: ['6']
  }
];

export function TopicView({ topicId, onBack }: { topicId: string; onBack: () => void }) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  
  // Load topic and comments
  useEffect(() => {
    // In a real app, you would fetch this from an API
    const foundTopic = MOCK_TOPICS.find(t => t.id === topicId);
    if (foundTopic) {
      setTopic(foundTopic);
    }
    
    const topicComments = MOCK_COMMENTS.filter(c => c.topicId === topicId);
    setComments(topicComments);
  }, [topicId]);
  
  // Handle adding a new comment
  const handleAddComment = () => {
    if (!user || !newComment.trim() || !topic) return;
    
    const newCommentObj: Comment = {
      id: `${topicId}-${comments.length + 1}`,
      topicId,
      authorId: user.id,
      authorName: user.name,
      authorStatus: 'online',
      content: newComment,
      createdAt: new Date(),
      likes: []
    };
    
    setComments([...comments, newCommentObj]);
    
    // Update the comment count on the topic
    setTopic({
      ...topic,
      commentCount: topic.commentCount + 1
    });
    
    setNewComment('');
  };
  
  // Handle liking a topic
  const handleLikeTopic = () => {
    if (!user || !topic) return;
    
    const userLiked = topic.likes.includes(user.id);
    
    setTopic({
      ...topic,
      likes: userLiked
        ? topic.likes.filter(id => id !== user.id)
        : [...topic.likes, user.id]
    });
  };
  
  // Handle liking a comment
  const handleLikeComment = (commentId: string) => {
    if (!user) return;
    
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const userLiked = comment.likes.includes(user.id);
        return {
          ...comment,
          likes: userLiked
            ? comment.likes.filter(id => id !== user.id)
            : [...comment.likes, user.id]
        };
      }
      return comment;
    }));
  };
  
  // Render status indicator
  const renderStatusIndicator = (status: 'online' | 'away' | 'offline') => {
    const statusColor = 
      status === 'online' ? 'bg-green-500' :
      status === 'away' ? 'bg-amber-400' : 'bg-gray-400';
    
    return <span className={`${statusColor} w-2 h-2 rounded-full inline-block mr-1.5`}></span>;
  };
  
  if (!topic) {
    return (
      <div className="p-8 text-center">
        <p>Topic not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Topic header */}
      <div className="p-4 border-b border-border flex items-center">
        <button 
          className="flex items-center text-muted-foreground hover:text-foreground mr-4"
          onClick={onBack}
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        <h2 className="font-medium flex-1 truncate">{topic.title}</h2>
      </div>
      
      {/* Topic content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 border-b border-border/50">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/70 to-primary rounded-full flex items-center justify-center text-white font-medium">
                {topic.authorName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{topic.authorName}</h4>
                  {renderStatusIndicator(topic.authorStatus)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(topic.createdAt, { addSuffix: true })}
                </p>
              </div>
            </div>
            <button className="text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mb-4">
            <p className="whitespace-pre-wrap">{topic.content}</p>
          </div>
          
          {/* Tags */}
          {topic.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1">
              {topic.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 text-xs bg-accent/10 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Topic actions */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                className={`flex items-center gap-1 ${
                  user && topic.likes.includes(user.id) 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={handleLikeTopic}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm">{topic.likes.length}</span>
              </button>
              <span className="flex items-center gap-1 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">{comments.length}</span>
              </span>
            </div>
            <button className="text-muted-foreground hover:text-foreground">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Comments */}
        <div className="divide-y divide-border/50">
          {comments.map(comment => (
            <div key={comment.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/70 to-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {comment.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium">{comment.authorName}</h5>
                      {renderStatusIndicator(comment.authorStatus)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
              
              <div className="pl-11 mb-2">
                <p>{comment.content}</p>
              </div>
              
              <div className="pl-11">
                <button 
                  className={`flex items-center gap-1 text-sm ${
                    user && comment.likes.includes(user.id) 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => handleLikeComment(comment.id)}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{comment.likes.length}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Add comment */}
      <div className="p-4 border-t border-border mt-auto">
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary/70 to-primary rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-medium">
            {user ? user.name.charAt(0) : '?'}
          </div>
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <Button
              className="flex-shrink-0"
              disabled={!newComment.trim()}
              onClick={handleAddComment}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
