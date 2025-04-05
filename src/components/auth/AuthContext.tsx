'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useSession, signIn, signOut } from 'next-auth/react';

export interface User {
  id: string;
  email: string;
  name: string;
  projects: Project[];
  isVerified: boolean;
  verificationToken?: string;
  meetings?: Meeting[];
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

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  duration: number;
  hostId: string;
  invitees: string[];
  meetingLink: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
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

  // Helper function to generate a random string token
  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Helper function to simulate sending an email
  const sendVerificationEmail = async (email: string, token: string) => {
    // In a real app, this would call an API endpoint to send an email
    console.log(`Sending verification email to ${email} with token ${token}`);
    
    // For demo purposes, we'll just show a toast
    toast({
      title: "Verification Email Sent",
      description: `A verification email has been sent to ${email}. In this demo, use token: ${token} to verify.`,
    });
    
    return true;
  };

  // Get NextAuth session
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('Session state changed:', status, session);
    
    // First check if user is logged in with NextAuth
    if (status === 'authenticated' && session?.user) {
      // Convert NextAuth session user to our User type
      const nextAuthUser: User = {
        id: session.user.id || session.user.email || '',
        email: session.user.email || '',
        name: session.user.name || '',
        projects: [], // We'll need to fetch projects from API in a real app
        isVerified: true, // Social logins are considered verified
      };
      
      console.log('Setting authenticated user:', nextAuthUser);
      setUser(nextAuthUser);
      
      // Update localStorage to keep user state persistent
      localStorage.setItem('brisk_user', JSON.stringify(nextAuthUser));
      
      setIsLoading(false);
      return;
    } else if (status === 'loading') {
      // Still loading NextAuth session
      console.log('Loading NextAuth session...');
      setIsLoading(true);
      return;
    } else if (status === 'unauthenticated') {
      console.log('User is not authenticated with NextAuth');
      // Clear user state if logged out from NextAuth
      localStorage.removeItem('brisk_user');
      setUser(null);
    }
    
    // If not logged in with NextAuth, check localStorage
    const storedUser = localStorage.getItem('brisk_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Found stored user:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('brisk_user');
      }
    }
    setIsLoading(false);
  }, [session, status]);

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
      
      // Check if user is verified
      if (!matchedUser.isVerified) {
        toast({
          title: "Email Verification Required",
          description: `Please verify your email first. A verification email was sent to ${email}.`,
        });
        
        // Resend verification email if needed
        await sendVerificationEmail(email, matchedUser.verificationToken);
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
      
      // Generate verification token
      const verificationToken = generateToken();
      
      // Create new user with verification token and unverified status
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        projects: [],
        isVerified: false,
        verificationToken,
        meetings: []
      };
      
      // In a real app, we'd hash the password
      const userWithPassword = { ...newUser, password };
      
      // Add to users array
      storedUsers.push(userWithPassword);
      localStorage.setItem('brisk_users', JSON.stringify(storedUsers));
      
      // Log user in
      setUser(newUser);
      localStorage.setItem('brisk_user', JSON.stringify(newUser));
      
      // Send verification email
      await sendVerificationEmail(email, verificationToken);
      
      toast({
        title: "Signup Successful",
        description: `Welcome, ${name}! Please check your email to verify your account.`
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

  const logout = async () => {
    // Clear local storage
    localStorage.removeItem('brisk_user');
    setUser(null);
    
    // Use NextAuth signOut to clear session cookies
    await signOut({ redirect: true, callbackUrl: '/' });
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
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

  // Add verification functions
  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // In a real app, we would call an API endpoint here
      const storedUsers = JSON.parse(localStorage.getItem('brisk_users') || '[]');
      
      // Find user with this verification token
      const userIndex = storedUsers.findIndex((u: any) => u.verificationToken === token);
      
      if (userIndex === -1) {
        toast({
          title: "Verification Failed",
          description: "Invalid verification token. Please try again or request a new verification email.",
          variant: "destructive"
        });
        return false;
      }
      
      // Mark user as verified
      storedUsers[userIndex].isVerified = true;
      storedUsers[userIndex].verificationToken = undefined; // Clear the token
      
      // Update localStorage
      localStorage.setItem('brisk_users', JSON.stringify(storedUsers));
      
      // If this is the current user, update their state too
      if (user && user.id === storedUsers[userIndex].id) {
        const updatedUser = { ...user, isVerified: true, verificationToken: undefined };
        setUser(updatedUser);
        localStorage.setItem('brisk_user', JSON.stringify(updatedUser));
      }
      
      toast({
        title: "Email Verified",
        description: "Your email has been verified successfully. You can now log in.",
      });
      
      return true;
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const resendVerification = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const storedUsers = JSON.parse(localStorage.getItem('brisk_users') || '[]');
      const userIndex = storedUsers.findIndex((u: any) => u.email === email);
      
      if (userIndex === -1) {
        toast({
          title: "Resend Failed",
          description: "User not found. Please check your email or sign up.",
          variant: "destructive"
        });
        return false;
      }
      
      if (storedUsers[userIndex].isVerified) {
        toast({
          title: "Already Verified",
          description: "Your email is already verified. You can log in.",
        });
        return true;
      }
      
      // Generate new token if needed
      const verificationToken = storedUsers[userIndex].verificationToken || generateToken();
      storedUsers[userIndex].verificationToken = verificationToken;
      
      // Update localStorage
      localStorage.setItem('brisk_users', JSON.stringify(storedUsers));
      
      // Send verification email
      await sendVerificationEmail(email, verificationToken);
      
      toast({
        title: "Verification Email Sent",
        description: "A new verification email has been sent. Please check your inbox.",
      });
      
      return true;
    } catch (error) {
      console.error('Resend verification error:', error);
      toast({
        title: "Resend Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
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
        verifyEmail,
        resendVerification,
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
