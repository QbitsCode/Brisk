'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth';
import { format, addMinutes } from 'date-fns';
import { CalendarIcon, Video, X, Users, Copy, Mail } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { User, getUsers } from '@/components/quantum-talk/UserList';
import userService, { Meeting } from '@/services/UserService';

// Meeting invitation schema
const meetingFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  date: z.date({ required_error: 'A date is required' }),
  time: z.string({ required_error: 'A time is required' }),
  duration: z.string({ required_error: 'Duration is required' }),
  description: z.string().optional(),
  invitees: z.array(z.string()).min(1, { message: 'Select at least one invitee' }),
});

type MeetingFormValues = z.infer<typeof meetingFormSchema>;

interface MeetingData extends MeetingFormValues {
  id: string;
  hostId: string;
  hostName: string;
  meetingLink: string;
  createdAt: Date;
}

// Function to send email (simulated for this demo)
const sendInvitationEmail = async (
  recipientEmails: string[],
  meeting: MeetingData
) => {
  console.log(`Sending email to: ${recipientEmails.join(', ')}`);
  console.log(`Meeting details: ${JSON.stringify(meeting)}`);

  // Simulate email being sent
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, this would call your backend API
  // that would use a service like SendGrid, Amazon SES, etc.
  toast({
    title: "Email Invitations Sent",
    description: `Invitations sent to ${recipientEmails.length} participants.`
  });
  
  return true;
};

interface MeetingSchedulerProps {
  currentUserId: string;
}

export function MeetingScheduler({ currentUserId }: MeetingSchedulerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [meetings, setMeetings] = useState<MeetingData[]>([]);
  const [invitationSent, setInvitationSent] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState<MeetingData | null>(null);
  const { user } = useAuth();

  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      title: '',
      time: '10:00',
      duration: '30',
      description: '',
      invitees: [],
    },
  });

  const resetFormState = () => {
    form.reset();
    setInvitationSent(false);
    setCurrentMeeting(null);
  };

  // Fetch users and meetings
  useEffect(() => {
    setUsers(getUsers());
  }, [isOpen]); // Refresh when dialog opens
  
  // Get user details to populate host info
  const currentUser = users.find(user => user.id === currentUserId) || { 
    id: currentUserId, 
    name: 'Current User', 
    status: 'online' as const,
    lastActive: new Date(),
    email: ''
  };

  // Time slot options
  const timeSlots = [];
  for (let i = 9; i <= 17; i++) {
    const hour = i.toString().padStart(2, '0');
    timeSlots.push(`${hour}:00`);
    timeSlots.push(`${hour}:30`);
  }

  // Duration options
  const durationOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
  ];

  async function onSubmit(data: MeetingFormValues) {
    try {
      // Create meeting object
      const meetingLink = userService.generateMeetingLink();
      
      const newMeeting: MeetingData = {
        ...data,
        id: Math.random().toString(36).substring(2, 9),
        hostId: currentUserId,
        hostName: currentUser.name,
        meetingLink,
        createdAt: new Date(),
      };

      // Get emails of invitees from user objects
      const inviteeEmails = data.invitees.map(inviteeId => {
        const user = users.find(u => u.id === inviteeId);
        return user?.email || `${user?.name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
      });

      // Store meeting in database and send invitations
      const scheduledMeeting = userService.scheduleMeeting({
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        duration: data.duration,
        hostId: currentUserId,
        invitees: data.invitees,
        meetingLink: meetingLink
      });

      if (scheduledMeeting) {
        // Send invitation emails
        await sendInvitationEmail(inviteeEmails, newMeeting);
        
        // Update meetings state
        setMeetings(prevMeetings => [...prevMeetings, newMeeting]);
        setCurrentMeeting(newMeeting);
        setInvitationSent(true);
      } else {
        throw new Error('Failed to schedule meeting');
      }

      toast({
        title: "Meeting scheduled!",
        description: "Invitations have been sent to participants.",
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
        variant: "destructive",
      });
    }
  }

  const copyMeetingLink = () => {
    if (currentMeeting?.meetingLink) {
      navigator.clipboard.writeText(currentMeeting.meetingLink);
      toast({
        title: "Link copied",
        description: "Meeting link copied to clipboard.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        resetFormState();
      }
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2" onClick={() => setIsOpen(true)}>
          <Video className="h-4 w-4" />
          Schedule Meeting
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invitationSent ? "Meeting Scheduled" : "Schedule a Meeting"}</DialogTitle>
          <DialogDescription>
            {invitationSent 
              ? "Your meeting has been scheduled and invitations sent."
              : "Set up a Google Meet session with community members."}
          </DialogDescription>
        </DialogHeader>

        {!invitationSent ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Quantum Circuit Discussion" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                "Select date"
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Duration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {durationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the purpose of this meeting..." 
                        {...field} 
                        className="resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invitees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invite Participants</FormLabel>
                    <FormControl>
                      <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                        {users.filter(u => u.id !== currentUserId).map((user) => (
                          <div key={user.id} className="flex items-center p-2 hover:bg-accent/20 rounded-md">
                            <input
                              type="checkbox"
                              id={`user-${user.id}`}
                              value={user.id}
                              checked={field.value.includes(user.id)}
                              onChange={(e) => {
                                const value = e.target.value;
                                const newValue = e.target.checked
                                  ? [...field.value, value]
                                  : field.value.filter((v) => v !== value);
                                field.onChange(newValue);
                              }}
                              className="mr-3"
                            />
                            <label 
                              htmlFor={`user-${user.id}`}
                              className="flex items-center cursor-pointer flex-1"
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-primary/70 to-primary rounded-full flex items-center justify-center text-white font-medium mr-2">
                                {user.name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{user.name}</span>
                                <div className="flex items-center">
                                  <span 
                                    className={`w-2 h-2 rounded-full mr-1.5 ${
                                      user.status === 'online' ? 'bg-green-500' :
                                      user.status === 'away' ? 'bg-amber-400' : 'bg-gray-400'
                                    }`}
                                  ></span>
                                  <span className="text-xs text-muted-foreground">{user.status}</span>
                                </div>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Select the participants you want to invite to this meeting
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Video className="mr-2 h-4 w-4" /> Schedule Meeting
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          /* Meeting confirmation screen */
          <div className="space-y-6">
            <div className="bg-accent/30 p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-lg">{currentMeeting?.title}</h3>
                <div className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  {durationOptions.find(d => d.value === currentMeeting?.duration)?.label}
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  <span>
                    {currentMeeting?.date ? format(currentMeeting.date, "EEEE, MMMM d, yyyy") : ""} 
                    {" "}at{" "}
                    {currentMeeting?.time}
                  </span>
                </div>
              </div>
              
              {currentMeeting?.description && (
                <div className="border-t border-border pt-3 mb-3">
                  <p className="text-sm text-muted-foreground">{currentMeeting.description}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between bg-background p-3 rounded-md">
                <div className="flex items-center">
                  <Video className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium truncate max-w-[250px]">
                    {currentMeeting?.meetingLink}
                  </span>
                </div>
                <Button size="sm" variant="outline" onClick={copyMeetingLink}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" /> Participants 
                <span className="text-xs text-muted-foreground font-normal">
                  ({(currentMeeting?.invitees?.length || 0) + 1} total)
                </span>
              </h4>
              
              <div className="space-y-1">
                {/* Host */}
                <div className="flex items-center py-1.5">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary/70 to-primary rounded-full flex items-center justify-center text-white font-medium mr-2 text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm">{currentUser.name}</span>
                      <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Host</span>
                    </div>
                  </div>
                </div>
                
                {/* Invitees */}
                {currentMeeting?.invitees?.map(inviteeId => {
                  const invitee = users.find(u => u.id === inviteeId);
                  if (!invitee) return null;
                  
                  return (
                    <div key={inviteeId} className="flex items-center py-1.5">
                      <div className="w-7 h-7 bg-gradient-to-br from-background to-muted rounded-full flex items-center justify-center font-medium mr-2 text-xs border border-border">
                        {invitee.name.charAt(0)}
                      </div>
                      <span className="text-sm">{invitee.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                Invitations have been sent to all participants, and the meeting has been added to your account.
              </p>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  className="gap-1"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" /> Close
                </Button>
                <Button className="gap-1" onClick={copyMeetingLink}>
                  <Copy className="h-4 w-4" /> Copy Meeting Link
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
