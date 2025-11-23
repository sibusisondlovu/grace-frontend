import { useCommittees } from "@/hooks/useCommittees";
import { useCreateMeeting } from "@/hooks/useMeetings";
import { Calendar, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ScheduleMeeting() {
  const { data: committees } = useCommittees();
  const createMeeting = useCreateMeeting();
  const navigate = useNavigate();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleCreateMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const selectedCommittee = committees?.find(c => c.id === formData.get("committee_id"));
    
    const meetingData = {
      committee_id: formData.get("committee_id") as string,
      organization_id: selectedCommittee?.organization_id || '',
      title: formData.get("title") as string,
      meeting_date: new Date(formData.get("meeting_date") as string).toISOString(),
      venue: formData.get("venue") as string || undefined,
      meeting_type: formData.get("meeting_type") as string,
      public_meeting: formData.get("public_meeting") === "on",
      livestream_url: formData.get("livestream_url") as string || undefined,
      status: "scheduled" as const,
      agenda_published: false,
      minutes_published: false,
    };

    createMeeting.mutate(meetingData, {
      onSuccess: () => {
        navigate('/meetings/upcoming');
      }
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/meetings/upcoming')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span>Schedule New Meeting</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Create a new committee meeting
          </p>
        </div>
      </div>

      {/* Meeting Form */}
      <Card>
        <CardHeader>
          <CardTitle>Meeting Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateMeeting} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="committee_id">Committee *</Label>
                <Select name="committee_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a committee" />
                  </SelectTrigger>
                  <SelectContent>
                    {committees?.map((committee) => (
                      <SelectItem key={committee.id} value={committee.id}>
                        {committee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title *</Label>
                <Input 
                  name="title" 
                  placeholder="Enter meeting title" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting_date">Date & Time *</Label>
                <Input 
                  name="meeting_date" 
                  type="datetime-local" 
                  required 
                />
              </div>
            </div>

            {/* Meeting Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Meeting Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="meeting_type">Meeting Type</Label>
                <Select name="meeting_type" defaultValue="physical">
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
                <Label htmlFor="venue">Venue</Label>
                <Input 
                  name="venue" 
                  placeholder="Meeting venue (leave empty for virtual meetings)" 
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  name="public_meeting" 
                  id="public_meeting"
                  defaultChecked 
                />
                <Label htmlFor="public_meeting">Public Meeting</Label>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full"
              >
                {isAdvancedOpen ? 'Hide' : 'Show'} Advanced Options
              </Button>

              {isAdvancedOpen && (
                <div className="space-y-4 p-4 bg-muted rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor="livestream_url">Livestream URL</Label>
                    <Input 
                      name="livestream_url" 
                      type="url"
                      placeholder="https://example.com/livestream" 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/meetings/upcoming')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMeeting.isPending}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>
                  {createMeeting.isPending ? "Scheduling..." : "Schedule Meeting"}
                </span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}