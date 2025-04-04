'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Send, 
  MoreHorizontal,
  ThumbsUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Types
interface UserStatus {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastActive: Date;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  likes: string[]; // Array of user IDs who liked
  comments: Comment[];
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  likes: string[]; // Array of user IDs who liked
}

// Mock data - in a real app this would come from a database
const MOCK_USER_STATUSES: UserStatus[] = [
  { userId: '1', status: 'online', lastActive: new Date() },
  { userId: '2', status: 'away', lastActive: new Date(Date.now() - 15 * 60 * 1000) },
  { userId: '3', status: 'offline', lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
];

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Alice Chen',
    content: 'Just implemented a new quantum error correction code that improves fidelity by 15%. Anyone interested in testing it?',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: ['2', '3'],
    comments: [
      {
        id: '1-1',
        userId: '2',
        userName: 'Bob Smith',
        content: 'That sounds amazing! Could you share more details about the implementation?',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        likes: ['1'],
      }
    ]
  },
  {
    id: '2',
    userId: '3',
    userName: 'Charlie Quantum',
    content: 'Has anyone experimented with CV-QKD on the Brisk platform yet? I\'m looking for comparative results.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    likes: ['1'],
    comments: []
  }
];

export function CommunityDiscussions() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [newPostContent, setNewPostContent] = useState('');
  const [userStatuses, setUserStatuses] = useState<UserStatus[]>(MOCK_USER_STATUSES);
  const { user } = useAuth();

  // Function to handle creating a new post
  const handleCreatePost = () => {
    if (!user || !newPostContent.trim()) return;
    
    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      content: newPostContent,
      createdAt: new Date(),
      likes: [],
      comments: []
    };
    
    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  // Function to handle liking a post
  const handleLikePost = (postId: string) => {
    if (!user) return;
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const userLiked = post.likes.includes(user.id);
        return {
          ...post,
          likes: userLiked
            ? post.likes.filter(id => id !== user.id)
            : [...post.likes, user.id]
        };
      }
      return post;
    }));
  };

  // Function to handle adding a comment
  const handleAddComment = (postId: string, commentContent: string) => {
    if (!user || !commentContent.trim()) return;
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newComment: Comment = {
          id: `comment-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          content: commentContent,
          createdAt: new Date(),
          likes: []
        };
        
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
  };

  // Function to render user status indicator
  const renderStatusIndicator = (userId: string) => {
    const userStatus = userStatuses.find(status => status.userId === userId);
    if (!userStatus) return null;
    
    let statusColor = 'bg-gray-400'; // Default for offline (gray)
    let statusText = 'Offline';
    
    if (userStatus.status === 'online') {
      statusColor = 'bg-green-500'; // Live green for online
      statusText = 'Online';
    } else if (userStatus.status === 'away') {
      statusColor = 'bg-amber-400'; // Light orange for away
      statusText = 'Away';
    }
    
    return (
      <span className="flex items-center text-xs text-gray-400">
        <span className={`${statusColor} w-2 h-2 rounded-full mr-1`}></span>
        {statusText}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto pt-6">
      {/* Create new post */}
      <div className="bg-card rounded-lg p-4 mb-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Start a Discussion</h3>
        <div className="space-y-4">
          <textarea
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Share your quantum ideas, questions, or discoveries..."
            rows={3}
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              onClick={handleCreatePost}
              disabled={!newPostContent.trim()}
            >
              <Send className="h-4 w-4" />
              Post
            </button>
          </div>
        </div>
      </div>
      
      {/* Posts list */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-card rounded-lg shadow-sm overflow-hidden">
            {/* Post header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {post.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{post.userName}</h4>
                      {renderStatusIndicator(post.userId)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Post content */}
            <div className="p-4">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>
            
            {/* Post actions */}
            <div className="px-4 py-2 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <button 
                  className={`flex items-center gap-1 ${
                    user && post.likes.includes(user.id) 
                      ? 'text-blue-500' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => handleLikePost(post.id)}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm">{post.likes.length}</span>
                </button>
                <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">{post.comments.length}</span>
                </button>
              </div>
              <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
            
            {/* Comments */}
            {post.comments.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="py-3 border-t border-gray-200 dark:border-gray-700 first:border-0">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {comment.userName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-medium">{comment.userName}</h5>
                          {renderStatusIndicator(comment.userId)}
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <button 
                            className={`flex items-center gap-1 text-xs ${
                              user && comment.likes.includes(user.id) 
                                ? 'text-blue-500' 
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                            {comment.likes.length > 0 && <span>{comment.likes.length}</span>}
                          </button>
                          <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add comment */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                  {user ? user.name.charAt(0) : '?'}
                </div>
                <CommentForm postId={post.id} onAddComment={handleAddComment} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Component for adding a comment
function CommentForm({ postId, onAddComment }: { postId: string; onAddComment: (postId: string, content: string) => void }) {
  const [content, setContent] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    onAddComment(postId, content);
    setContent('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex-1 flex">
      <input
        type="text"
        placeholder="Write a comment..."
        className="flex-1 bg-background border border-gray-300 dark:border-gray-700 rounded-l-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        type="submit"
        className="bg-primary text-primary-foreground px-3 py-1.5 rounded-r-lg hover:bg-primary/90 transition-colors"
        disabled={!content.trim()}
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
