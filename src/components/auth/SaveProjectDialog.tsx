'use client';

import { useState } from 'react';
import { useAuth, Project } from './AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Save, Loader2 } from 'lucide-react';
import { AuthModal } from './AuthModal';

interface SaveProjectDialogProps {
  projectData: {
    components: any[];
    connections: any[];
  };
  currentProject?: Project;
  onSaved?: (project: Project) => void;
}

export function SaveProjectDialog({ 
  projectData, 
  currentProject,
  onSaved 
}: SaveProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(currentProject?.name || '');
  const [description, setDescription] = useState(currentProject?.description || '');
  const [isPublic, setIsPublic] = useState(currentProject?.isPublic || false);
  const { user, saveProject } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const projectToSave = {
        ...(currentProject || {}),
        name,
        description,
        isPublic,
        components: projectData.components,
        connections: projectData.connections
      };
      
      const savedProject = await saveProject(projectToSave);
      
      if (onSaved) {
        onSaved(savedProject);
      }
      
      setOpen(false);
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // If not logged in, wrap with AuthModal
  if (!user) {
    return (
      <AuthModal>
        <Button variant="outline" className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Project
        </Button>
      </AuthModal>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Save Quantum Circuit</DialogTitle>
            <DialogDescription>
              Save your quantum circuit design to your account for future use or to share with others.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Quantum Circuit"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your quantum circuit design..."
                rows={3}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="public">Share Publicly</Label>
                <div className="text-sm text-muted-foreground">
                  Make your quantum circuit visible to other Brisk users
                </div>
              </div>
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
