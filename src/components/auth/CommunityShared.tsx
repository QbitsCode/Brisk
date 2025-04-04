'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, Project } from './AuthContext';
import { FolderOpen, Heart, MessageSquare, Share2, Users, MessagesSquare } from 'lucide-react';
// Import all UI components from the index file
import { 
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Skeleton
} from '@/components/ui';



export function CommunityShared({ onLoadProject }: { onLoadProject?: (project: Project) => void }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [publicProjects, setPublicProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const { getPublicProjects, user } = useAuth();

  const loadPublicProjects = async () => {
    setIsLoading(true);
    try {
      const projects = await getPublicProjects();
      setPublicProjects(projects);
    } catch (error) {
      console.error('Failed to load public projects', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load public projects when the component mounts
    loadPublicProjects();
  }, []);

  const handleLoadProject = (project: Project) => {
    if (onLoadProject) {
      onLoadProject(project);
    }
  };

  // Format date nicely
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 relative group overflow-hidden">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity rounded-full blur"></div>
          <div className="relative flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span>Community</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quantum Community</DialogTitle>
          <DialogDescription>
            Discover and learn from quantum circuits shared by the Brisk community
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-between items-center mb-4">
          <Tabs defaultValue="featured" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            className="flex items-center gap-1 ml-4 whitespace-nowrap"
            onClick={() => {
              setOpen(false); // Close the dialog first
              setTimeout(() => {
                router.push('/quantum-talk'); // Then navigate
              }, 100); // Small delay to ensure smooth transition
            }}
          >
            <MessagesSquare className="h-4 w-4" />
            QuantumTalk
          </Button>
        </div>
          
        <Tabs defaultValue="featured" className="w-full">
          <TabsContent value="featured" className="space-y-4 mt-4">
            {isLoading ? (
              // Loading state
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <Skeleton className="h-5 w-2/5" />
                  <Skeleton className="h-4 w-4/5" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
                </div>
              ))
            ) : publicProjects.length > 0 ? (
              // Projects list
              publicProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="border rounded-lg p-4 transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Heart className="h-3 w-3 mr-1" /> 12
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" /> 3
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Shared {formatDate(project.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleLoadProject(project)}
                      >
                        <FolderOpen className="h-4 w-4 mr-1" /> Open
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty state
              <div className="p-8 text-center">
                <Share2 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No Shared Projects Yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Be the first to share your quantum circuit with the community!
                </p>
                {user && (
                  <Button className="mt-4" variant="outline">
                    Share Your Work
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent" className="space-y-4 mt-4">
            {/* Similar content as 'featured' but sorted by date */}
            {isLoading ? (
              <div className="p-8 text-center">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <Skeleton className="h-5 w-40 mx-auto mt-4" />
                <Skeleton className="h-4 w-60 mx-auto mt-2" />
              </div>
            ) : (
              <div className="p-8 text-center">
                <Share2 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Coming Soon</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  This feature is under development. Check back soon!
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="popular" className="space-y-4 mt-4">
            {/* Similar content as 'featured' but sorted by popularity */}
            {isLoading ? (
              <div className="p-8 text-center">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <Skeleton className="h-5 w-40 mx-auto mt-4" />
                <Skeleton className="h-4 w-60 mx-auto mt-2" />
              </div>
            ) : (
              <div className="p-8 text-center">
                <Share2 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Coming Soon</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  This feature is under development. Check back soon!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
