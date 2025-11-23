import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Meeting } from "@/hooks/useMeetings";
import { format } from "date-fns";

interface EditMeetingDialogProps {
  meeting: Meeting;
}

export function EditMeetingDialog({ meeting }: EditMeetingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const updateMeeting = useMutation({
    mutationFn: async (updates: any) => {
      const { data, error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('id', meeting.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: "Success",
        description: "Meeting updated successfully!",
      });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update meeting",
        variant: "destructive",
      });
    },
  });

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const updates = {
      title: formData.get("title") as string,
      meeting_date: new Date(formData.get("meeting_date") as string).toISOString(),
      venue: formData.get("venue") as string || null,
      meeting_type: formData.get("meeting_type") as string,
      status: formData.get("status") as string,
      public_meeting: formData.get("public_meeting") === "true",
      livestream_url: formData.get("livestream_url") as string || null,
      recording_url: formData.get("recording_url") as string || null,
      quorum_achieved: formData.get("quorum_achieved") === "true" ? true : formData.get("quorum_achieved") === "false" ? false : null,
    };

    updateMeeting.mutate(updates);
  };

  // Format datetime for input
  const formattedDate = format(new Date(meeting.meeting_date), "yyyy-MM-dd'T'HH:mm");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Edit Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Meeting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              name="title"
              defaultValue={meeting.title}
              placeholder="Enter meeting title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting_date">Date & Time</Label>
            <Input
              name="meeting_date"
              type="datetime-local"
              defaultValue={formattedDate}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meeting_type">Meeting Type</Label>
              <Select name="meeting_type" defaultValue={meeting.meeting_type}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Physical</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={meeting.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Input
              name="venue"
              defaultValue={meeting.venue || ""}
              placeholder="Meeting venue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="livestream_url">Livestream URL</Label>
            <Input
              name="livestream_url"
              type="url"
              defaultValue={meeting.livestream_url || ""}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recording_url">Recording URL</Label>
            <Input
              name="recording_url"
              type="url"
              defaultValue={meeting.recording_url || ""}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="public_meeting">Public Access</Label>
            <Select name="public_meeting" defaultValue={meeting.public_meeting ? "true" : "false"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Public Meeting</SelectItem>
                <SelectItem value="false">Private Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {meeting.status === 'completed' && (
            <div className="space-y-2">
              <Label htmlFor="quorum_achieved">Quorum Achieved</Label>
              <Select 
                name="quorum_achieved" 
                defaultValue={meeting.quorum_achieved === null ? "null" : meeting.quorum_achieved ? "true" : "false"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Not Recorded</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMeeting.isPending}>
              {updateMeeting.isPending ? "Updating..." : "Update Meeting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
