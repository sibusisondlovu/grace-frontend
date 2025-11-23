import { useState } from "react";
import { Users, UserCheck, UserX, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Meeting } from "@/hooks/useMeetings";
import { useProfiles } from "@/hooks/useMembers";

interface AttendanceTrackerProps {
  meeting: Meeting;
}

export function AttendanceTracker({ meeting }: AttendanceTrackerProps) {
  const queryClient = useQueryClient();
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const { data: profiles } = useProfiles();

  const { data: attendanceRecords, isLoading } = useQuery({
    queryKey: ['attendance', meeting.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_attendance')
        .select(`
          *,
          profiles!meeting_attendance_user_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('meeting_id', meeting.id)
        .order('arrival_time', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const recordAttendance = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('meeting_attendance')
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', meeting.id] });
      toast({
        title: "Success",
        description: "Attendance recorded successfully",
      });
      setIsRecordOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record attendance",
        variant: "destructive",
      });
    },
  });

  const handleRecordAttendance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const attendanceData = {
      meeting_id: meeting.id,
      user_id: formData.get("user_id") as string,
      attendance_status: formData.get("attendance_status") as string,
      arrival_time: formData.get("arrival_time") ? new Date(formData.get("arrival_time") as string).toISOString() : null,
      departure_time: formData.get("departure_time") ? new Date(formData.get("departure_time") as string).toISOString() : null,
      notes: formData.get("notes") as string || undefined,
    };

    recordAttendance.mutate(attendanceData);
  };

  const presentCount = attendanceRecords?.filter(r => r.attendance_status === 'present').length || 0;
  const absentCount = attendanceRecords?.filter(r => r.attendance_status === 'absent').length || 0;
  const apologyCount = attendanceRecords?.filter(r => r.attendance_status === 'apology').length || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'apology': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'late': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Attendance Tracking</span>
          </CardTitle>
          <Dialog open={isRecordOpen} onOpenChange={setIsRecordOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Record Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Record Attendance</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRecordAttendance} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user_id">Member</Label>
                  <Select name="user_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles?.map((profile) => (
                        <SelectItem key={profile.user_id} value={profile.user_id}>
                          {profile.first_name} {profile.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendance_status">Status</Label>
                  <Select name="attendance_status" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="apology">Apology</SelectItem>
                      <SelectItem value="late">Late Arrival</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="arrival_time">Arrival Time (Optional)</Label>
                    <Input name="arrival_time" type="time" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departure_time">Departure Time (Optional)</Label>
                    <Input name="departure_time" type="time" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea name="notes" placeholder="Any additional notes..." rows={3} />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsRecordOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={recordAttendance.isPending}>
                    {recordAttendance.isPending ? "Recording..." : "Record"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Attendance Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <UserCheck className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{presentCount}</div>
            <div className="text-xs text-green-600 dark:text-green-500">Present</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
            <UserX className="h-5 w-5 mx-auto mb-1 text-red-600" />
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">{absentCount}</div>
            <div className="text-xs text-red-600 dark:text-red-500">Absent</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <Clock className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{apologyCount}</div>
            <div className="text-xs text-yellow-600 dark:text-yellow-500">Apology</div>
          </div>
        </div>

        {/* Attendance Records */}
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading attendance...</div>
        ) : attendanceRecords && attendanceRecords.length > 0 ? (
          <div className="space-y-2">
            {attendanceRecords.map((record: any) => (
              <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">
                    {record.profiles?.first_name} {record.profiles?.last_name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {record.arrival_time && `Arrived: ${new Date(record.arrival_time).toLocaleTimeString()}`}
                    {record.departure_time && ` • Left: ${new Date(record.departure_time).toLocaleTimeString()}`}
                  </div>
                  {record.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>
                  )}
                </div>
                <Badge className={getStatusColor(record.attendance_status)}>
                  {record.attendance_status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No attendance records yet</p>
            <p className="text-sm mt-1">Click "Record Attendance" to track members</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
