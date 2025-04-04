'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export interface User {
  id: string;
  email: string;
  name: string;
  projects: Project[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  components: any[];
  connections: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  saveProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  setProjectPublic: (projectId: string, isPublic: boolean) => Promise<boolean>;
  getPublicProjects: () => Promise<Project[]>;
  deleteProject: (projectId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// For demo purposes, we're using localStorage, in production this would connect to a real backend
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('brisk_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('brisk_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would call an API endpoint here
      // For demo, we'll check if email exists in localStorage
      const storedUsers = JSON.parse(localStorage.getItem('brisk_users') || '[]');
      const matchedUser = storedUsers.find((u: any) => u.email === email);
      
      if (!matchedUser) {
        toast({
          title: "Login Failed",
          description: "User not found. Please check your email or sign up.",
          variant: "destructive"
        });
        return false;
      }
      
      // In a real app, we'd verify password hash
      // For demo, we're just checking the raw password (not secure!)
      if (matchedUser.password !== password) {
        toast({
          title: "Login Failed",
          description: "Incorrect password. Please try again.",
          variant: "destructive"
        });
        return false;
      }
      
      // Remove password before storing in state/localStorage
      const { password: _, ...userWithoutPassword } = matchedUser;
      setUser(userWithoutPassword);
      localStorage.setItem('brisk_user', JSON.stringify(userWithoutPassword));
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userWithoutPassword.name}!`,
      });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would call an API endpoint here
      // For demo, we'll store in localStorage
      const storedUsers = JSON.parse(localStorage.getItem('brisk_users') || '[]');
      
      // Check if email already exists
      if (storedUsers.some((u: any) => u.email === email)) {
        toast({
          title: "Signup Failed",
          description: "This email is already registered. Please login instead.",
          variant: "destructive"
        });
        return false;
      }
      
      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        name,
        email,
        password, // In a real app, we'd hash this
        projects: []
      };
      
      // Add to stored users
      storedUsers.push(newUser);
      localStorage.setItem('brisk_users', JSON.stringify(storedUsers));
      
      // Remove password before storing in state/localStorage
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('brisk_user', JSON.stringify(userWithoutPassword));
      
      toast({
        title: "Signup Successful",
        description: `Welcome to Brisk, ${name}!`,
      });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('brisk_user');
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const saveProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    if (!user) {
      throw new Error('User not logged in');
    }
    
    try {
      // Check if we're updating an existing project
      let existingProjectIndex = -1;
      if ('id' in project) {
        existingProjectIndex = user.projects.findIndex(p => p.id === (project as Project).id);
      }
      
      const now = new Date();
      let newProject: Project;
      
      if (existingProjectIndex >= 0) {
        // Update existing project
        newProject = {
          ...user.projects[existingProjectIndex],
          ...project,
          updatedAt: now
        };
        user.projects[existingProjectIndex] = newProject;
      } else {
        // Create new project
        newProject = {
          ...(project as any),
          id: `project_${Date.now()}`,
          createdAt: now,
          updatedAt: now
        };
        user.projects.push(newProject);
      }
      
      // Update user in localStorage
      setUser({ ...user });
      localStorage.setItem('brisk_user', JSON.stringify(user));
      
      // Update user in users array
      const storedUsers = JSON.parse(localStorage.getItem('brisk_users') || '[]');
      const userIndex = storedUsers.findIndex((u: any) => u.id === user.id);
      if (userIndex >= 0) {
        storedUsers[userIndex] = { ...storedUsers[userIndex], ...user };
        localStorage.setItem('brisk_users', JSON.stringify(storedUsers));
      }
      
      toast({
        title: "Project Saved",
        description: "Your quantum circuit project has been saved successfully.",
      });
      
      return newProject;
    } catch (error) {
      console.error('Save project error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your project. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const setProjectPublic = async (projectId: string, isPublic: boolean): Promise<boolean> => {
    if (!user) {
      throw new Error('User not logged in');
    }
    
    try {
      const projectIndex = user.projects.findIndex(p => p.id === projectId);
      if (projectIndex < 0) {
        throw new Error('Project not found');
      }
      
      user.projects[projectIndex].isPublic = isPublic;
      user.projects[projectIndex].updatedAt = new Date();
      
      // Update user in localStorage
      setUser({ ...user });
      localStorage.setItem('brisk_user', JSON.stringify(user));
      
      // Update user in users array
      const storedUsers = JSON.parse(localStorage.getItem('brisk_users') || '[]');
      const userIndex = storedUsers.findIndex((u: any) => u.id === user.id);
      if (userIndex >= 0) {
        storedUsers[userIndex] = { ...storedUsers[userIndex], ...user };
        localStorage.setItem('brisk_users', JSON.stringify(storedUsers));
      }
      
      toast({
        title: "Sharing Updated",
        description: `Project is now ${isPublic ? 'public' : 'private'}.`,
      });
      
      return true;
    } catch (error) {
      console.error('Set project public error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update project sharing settings.",
        variant: "destructive"
      });
      return false;
    }
  };

  const getPublicProjects = async (): Promise<Project[]> => {
    try {
      // Get all users
      const storedUsers = JSON.parse(localStorage.getItem('brisk_users') || '[]');
      
      // Get all public projects from all users
      const publicProjects: Project[] = storedUsers.flatMap((u: any) => 
        (u.projects || []).filter((p: Project) => p.isPublic)
      );
      
      return publicProjects;
    } catch (error) {
      console.error('Get public projects error:', error);
      toast({
        title: "Error Loading Projects",
        description: "Failed to load public projects. Please try again.",
        variant: "destructive"
      });
      return [];
    }
  };

  const deleteProject = async (projectId: string): Promise<boolean> => {
    if (!user) {
      throw new Error('User not logged in');
    }
    
    try {
      const projectIndex = user.projects.findIndex(p => p.id === projectId);
      if (projectIndex < 0) {
        throw new Error('Project not found');
      }
      
      // Remove project
      user.projects.splice(projectIndex, 1);
      
      // Update user in localStorage
      setUser({ ...user });
      localStorage.setItem('brisk_user', JSON.stringify(user));
      
      // Update user in users array
      const storedUsers = JSON.parse(localStorage.getItem('brisk_users') || '[]');
      const userIndex = storedUsers.findIndex((u: any) => u.id === user.id);
      if (userIndex >= 0) {
        storedUsers[userIndex] = { ...storedUsers[userIndex], ...user };
        localStorage.setItem('brisk_users', JSON.stringify(storedUsers));
      }
      
      toast({
        title: "Project Deleted",
        description: "Your project has been deleted successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('Delete project error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete your project. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        saveProject,
        setProjectPublic,
        getPublicProjects,
        deleteProject
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
