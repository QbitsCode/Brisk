'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { X } from 'lucide-react';

export default function NewTopicPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real app, you would send this to an API
    // This is a mock implementation that just redirects back
    setTimeout(() => {
      router.push('/quantum-talk');
    }, 1000);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Create New Topic</h1>
        <Link href="/quantum-talk">
          <Button variant="ghost" size="icon">
            <X className="h-5 w-5" />
          </Button>
        </Link>
      </div>
      
      <div className="max-w-2xl mx-auto bg-card rounded-lg shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Enter a descriptive title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Share your thoughts, questions, or insights with the quantum community..."
              required
            ></textarea>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="tags" className="block text-sm font-medium">
              Tags
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Add tags separated by commas (e.g., QKD, Error Correction, Beginner)"
            />
            <p className="text-xs text-muted-foreground">
              Tags help others find your topic and connect with those interested in similar subjects.
            </p>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <Link href="/quantum-talk">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={!title.trim() || !content.trim() || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Topic'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
