'use client';

import { useState } from 'react';
import { useAuth, Project } from './AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  LogOut, 
  User, 
  ChevronDown, 
  Save, 
  Share2, 
  Trash2, 
  Eye, 
  EyeOff,
  FolderOpen
} from 'lucide-react';

export function UserProfile() {
  const { user, logout, setProjectPublic, deleteProject } = useAuth();
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Debug log when user info changes to verify image URL
  console.log('User profile rendering with user:', user ? {
    name: user.name,
    email: user.email,
    hasImage: !!user.image,
    imageUrl: user.image
  } : 'No user');

  if (!user) {
    return null;
  }

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDialog(true);
    // In a real implementation, this would load the project into the circuit designer
  };

  const handleDeleteProject = async (projectId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this project? This action cannot be undone.');
    if (confirmed) {
      await deleteProject(projectId);
    }
  };

  const handleTogglePublic = async (project: Project) => {
    await setProjectPublic(project.id, !project.isPublic);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            {user.image ? (
              <div className="relative h-6 w-6 rounded-full overflow-hidden bg-muted">
                <img 
                  src={user.image} 
                  alt={`${user.name}'s profile`}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    console.error('Profile image failed to load:', user.image);
                    e.currentTarget.style.display = 'none';
                    // Show the fallback icon only when image fails
                    const parent = e.currentTarget.parentNode as HTMLElement;
                    const fallback = parent.querySelector('.fallback-icon') as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                {/* Fallback icon that only shows if image fails */}
                <div className="fallback-icon absolute inset-0 hidden items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              </div>
            ) : (
              <User className="h-4 w-4" />
            )}
            {user.name}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center p-2">
            {user.image ? (
              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted mr-3">
                <img 
                  src={user.image} 
                  alt={`${user.name}'s profile`}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    console.error('Profile image failed to load:', user.image);
                    e.currentTarget.style.display = 'none';
                    // Show the fallback icon only when image fails
                    const parent = e.currentTarget.parentNode as HTMLElement;
                    const fallback = parent.querySelector('.fallback-icon') as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                {/* Fallback icon that only shows if image fails */}
                <div className="fallback-icon absolute inset-0 hidden items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
              </div>
            ) : (
              <User className="h-10 w-10 p-2 rounded-full bg-muted mr-3" />
            )}
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowProjectDialog(true)}>
            <FolderOpen className="mr-2 h-4 w-4" />
            <span>My Projects</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>My Quantum Circuit Projects</DialogTitle>
            <DialogDescription>
              View, load, and manage your saved quantum circuit projects.
            </DialogDescription>
          </DialogHeader>
          
          {user.projects.length === 0 ? (
            <div className="p-8 text-center">
              <Save className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No Projects Yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You haven't saved any quantum circuit projects yet.
                <br />
                Create a circuit and click "Save" to store it in your account.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-auto pr-2">
              {user.projects.map((project) => (
                <div 
                  key={project.id} 
                  className="border rounded-lg p-4 flex justify-between items-start"
                >
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      {project.name}
                      {project.isPublic ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full dark:bg-green-800/20 dark:text-green-400">
                          Public
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full dark:bg-gray-800/20 dark:text-gray-400">
                          Private
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Last updated: {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenProject(project)}
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleTogglePublic(project)}
                    >
                      {project.isPublic ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
