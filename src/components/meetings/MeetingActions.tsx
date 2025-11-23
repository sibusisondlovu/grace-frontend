import { useState } from "react";
import { FileText, Download, UserPlus, UserMinus, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  useMeetingRegistration, 
  useRegisterInterest, 
  useWithdrawInterest, 
  useMeetingDocuments,
  useDownloadDocument,
  type MeetingDocument 
} from "@/hooks/useMeetingInteractions";
import { Meeting } from "@/hooks/useMeetings";
import { PublishButtons } from "./PublishButtons";

interface MeetingActionsProps {
  meeting: Meeting;
}

export function MeetingActions({ meeting }: MeetingActionsProps) {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("all");

  const { data: registration } = useMeetingRegistration(meeting.id);
  const { data: documents } = useMeetingDocuments(meeting.id, true); // Include unpublished for admin view
  const registerInterest = useRegisterInterest();
  const withdrawInterest = useWithdrawInterest();
  const downloadDocument = useDownloadDocument();

  const isUpcoming = new Date(meeting.meeting_date) > new Date();
  const isRegistered = !!registration;

  const agendaDocuments = documents?.filter(doc => doc.document_type === 'agenda') || [];
  const minutesDocuments = documents?.filter(doc => doc.document_type === 'minutes') || [];
  const supportingDocuments = documents?.filter(doc => doc.document_type === 'supporting') || [];
  const attendanceRegisters = documents?.filter(doc => doc.document_type === 'attendance_register') || [];

  const filteredDocuments = selectedDocumentType === "all" 
    ? documents || []
    : documents?.filter(doc => doc.document_type === selectedDocumentType) || [];

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await registerInterest.mutateAsync({
      meetingId: meeting.id,
      registrationType: formData.get("registration_type") as string,
      attendancePurpose: formData.get("attendance_purpose") as string || undefined,
    });
    
    setIsRegisterOpen(false);
  };

  const handleWithdraw = () => {
    withdrawInterest.mutate(meeting.id);
  };

  const handleDownload = (document: MeetingDocument) => {
    if (document.file_path) {
      downloadDocument.mutate({
        documentId: document.id,
        filePath: document.file_path,
      });
    }
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
              <DialogTitle>Meeting Agenda</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
                          disabled={downloadDocument.isPending}
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
              <span>View Minutes</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Meeting Minutes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
                          disabled={downloadDocument.isPending}
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
      {meeting.public_meeting && isUpcoming && !isRegistered && (
        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Register Interest</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Register Interest</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRegister} className="space-y-4">
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
                <Button type="submit" disabled={registerInterest.isPending}>
                  {registerInterest.isPending ? "Registering..." : "Register Interest"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Withdraw Interest Button */}
      {meeting.public_meeting && isUpcoming && isRegistered && (
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center space-x-2"
          onClick={handleWithdraw}
          disabled={withdrawInterest.isPending}
        >
          <UserMinus className="h-4 w-4" />
          <span>Withdraw Interest</span>
        </Button>
      )}

      {/* Download Documents Button */}
      {documents && documents.length > 0 && (
        <Dialog open={isDocumentsOpen} onOpenChange={setIsDocumentsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Download Documents</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Meeting Documents</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
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
                      <SelectItem value="attendance_register">Attendance Registers</SelectItem>
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
                            <div className="flex items-center gap-2">
                              <PublishButtons
                                type="document"
                                id={doc.id}
                                published={doc.published}
                                meetingId={meeting.id}
                                size="sm"
                                showBadge={false}
                                documentTitle={doc.title}
                                documentContent={doc.content || ''}
                                documentType={doc.document_type}
                                meetingTitle={meeting.title}
                                committee={meeting.committee?.name || 'Committee'}
                                meetingDate={meeting.meeting_date}
                                useProfessionalTemplate={doc.document_type === 'minutes' || doc.document_type === 'agenda'}
                              />
                              {doc.file_path && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownload(doc)}
                                  disabled={downloadDocument.isPending}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
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

      {/* Registration Status Badge */}
      {isRegistered && (
        <Badge variant="outline" className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>Registered</span>
        </Badge>
      )}
    </div>
  );
}