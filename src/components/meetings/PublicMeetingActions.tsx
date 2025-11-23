import { useState } from "react";
import { FileText, Download, UserPlus, Calendar, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  useMeetingDocuments,
  useRegisterInterest,
  type MeetingDocument 
} from "@/hooks/useMeetingInteractions";
import { PublicMeeting } from "@/hooks/usePublicMeetings";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface PublicMeetingActionsProps {
  meeting: PublicMeeting;
}

export function PublicMeetingActions({ meeting }: PublicMeetingActionsProps) {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("all");

  const { data: documents } = useMeetingDocuments(meeting.id);
  const registerInterest = useRegisterInterest();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isUpcoming = new Date(meeting.meeting_date) > new Date();

  const agendaDocuments = documents?.filter(doc => doc.document_type === 'agenda') || [];
  const minutesDocuments = documents?.filter(doc => doc.document_type === 'minutes') || [];
  const supportingDocuments = documents?.filter(doc => doc.document_type === 'supporting') || [];

  const filteredDocuments = selectedDocumentType === "all" 
    ? documents || []
    : documents?.filter(doc => doc.document_type === selectedDocumentType) || [];

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      // Redirect to auth page if not logged in
      navigate('/auth');
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    await registerInterest.mutateAsync({
      meetingId: meeting.id,
      registrationType: formData.get("registration_type") as string,
      attendancePurpose: formData.get("attendance_purpose") as string || undefined,
    });
    
    setIsRegisterOpen(false);
  };

  const handleDownload = (document: MeetingDocument) => {
    if (document.file_path) {
      // For now, just show the content or indicate download would happen
      console.log('Would download:', document.file_path);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* View Agenda Button */}
      {meeting.agenda_published && agendaDocuments.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>View Agenda</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Meeting Agenda - {meeting.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>{meeting.committee?.name}</strong> • {formatDateTime(meeting.meeting_date)}
                  {meeting.venue && <> • {meeting.venue}</>}
                </p>
              </div>
              
              {agendaDocuments.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">{doc.title}</h4>
                      {doc.file_path && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                    {doc.content && (
                      <div className="prose prose-sm max-w-none text-muted-foreground">
                        <pre className="whitespace-pre-wrap text-sm">{doc.content}</pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* View Minutes Button */}
      {meeting.minutes_published && minutesDocuments.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Minutes</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Meeting Minutes - {meeting.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>{meeting.committee?.name}</strong> • {formatDateTime(meeting.meeting_date)}
                  {meeting.venue && <> • {meeting.venue}</>}
                </p>
              </div>
              
              {minutesDocuments.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">{doc.title}</h4>
                      {doc.file_path && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                    {doc.content && (
                      <div className="prose prose-sm max-w-none text-muted-foreground">
                        <pre className="whitespace-pre-wrap text-sm">{doc.content}</pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Register Interest Button */}
      {isUpcoming && (
        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Register Interest</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Register Interest - {meeting.title}</DialogTitle>
            </DialogHeader>
            
            {!user && (
              <Alert className="mb-4">
                <AlertDescription>
                  You need to sign in to register interest in this meeting.
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p><strong>{meeting.committee?.name}</strong></p>
                <p>{formatDateTime(meeting.meeting_date)}</p>
                {meeting.venue && <p>{meeting.venue}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_type">Registration Type</Label>
                <Select name="registration_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select registration type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="observer">Observer (Public Gallery)</SelectItem>
                    <SelectItem value="presenter">Presenter/Petitioner</SelectItem>
                    <SelectItem value="interested_party">Interested Party</SelectItem>
                    <SelectItem value="media">Media Representative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="attendance_purpose">Purpose of Attendance (Optional)</Label>
                <Textarea 
                  name="attendance_purpose" 
                  placeholder="Brief description of why you wish to attend..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsRegisterOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={registerInterest.isPending || !user}>
                  {!user ? "Sign In Required" : registerInterest.isPending ? "Registering..." : "Register Interest"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Download Documents Button */}
      {documents && documents.length > 0 && (
        <Dialog open={isDocumentsOpen} onOpenChange={setIsDocumentsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Downloads</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Meeting Documents - {meeting.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p><strong>{meeting.committee?.name}</strong></p>
                <p>{formatDateTime(meeting.meeting_date)}</p>
              </div>

              <div className="flex items-center space-x-4">
                <Label>Filter:</Label>
                <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Documents</SelectItem>
                    <SelectItem value="agenda">Agenda</SelectItem>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="supporting">Supporting Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <Card key={doc.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{doc.title}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {doc.document_type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(doc.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {doc.file_path && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No documents found for the selected filter.
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Recording Link */}
      {meeting.recording_url && (
        <Button variant="outline" size="sm" asChild>
          <a href={meeting.recording_url} target="_blank" rel="noopener noreferrer">
            <Play className="h-4 w-4 mr-2" />
            Recording
          </a>
        </Button>
      )}

      {/* Livestream Link */}
      {meeting.livestream_url && isUpcoming && (
        <Button variant="outline" size="sm" asChild>
          <a href={meeting.livestream_url} target="_blank" rel="noopener noreferrer">
            <Calendar className="h-4 w-4 mr-2" />
            Join Meeting
          </a>
        </Button>
      )}
    </div>
  );
}