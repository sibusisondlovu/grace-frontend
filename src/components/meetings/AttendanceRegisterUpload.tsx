import { useState, useRef } from "react";
import { Upload, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useDocumentUpload, useDeleteDocument } from "@/hooks/useDocumentUpload";
import { useMeetingDocuments } from "@/hooks/useMeetingInteractions";
import { Meeting } from "@/hooks/useMeetings";
import { PublishButtons } from "./PublishButtons";

interface AttendanceRegisterUploadProps {
  meeting: Meeting;
}

export function AttendanceRegisterUpload({ meeting }: AttendanceRegisterUploadProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [title, setTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadDocument = useDocumentUpload();
  const deleteDocument = useDeleteDocument();
  const { data: documents } = useMeetingDocuments(meeting.id);
  
  const attendanceRegisters = documents?.filter(doc => doc.document_type === 'attendance_register') || [];

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const fileInput = fileInputRef.current;
    if (!fileInput?.files?.[0] || !title.trim()) {
      return;
    }

    const file = fileInput.files[0];
    
    await uploadDocument.mutateAsync({
      meetingId: meeting.id,
      file,
      documentType: 'attendance_register',
      title: title.trim(),
    });

    // Reset form
    setTitle("");
    if (fileInput) fileInput.value = "";
    setIsUploadOpen(false);
  };

  const handleDelete = (documentId: string, filePath?: string) => {
    if (confirm("Are you sure you want to delete this attendance register?")) {
      deleteDocument.mutate({ documentId, filePath });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Attendance Registers</span>
          </CardTitle>
          
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload Register</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Upload Attendance Register</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Attendance Register - Meeting Date"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="file">Select File *</Label>
                  <Input
                    id="file"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG
                  </p>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={uploadDocument.isPending || !title.trim()}
                  >
                    {uploadDocument.isPending ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {attendanceRegisters.length > 0 ? (
          <div className="space-y-3">
            {attendanceRegisters.map((register) => (
              <Card key={register.id} className="border border-border/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{register.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          Attendance Register
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(register.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PublishButtons
                        type="document"
                        id={register.id}
                        published={register.published}
                        size="sm"
                        showBadge={true}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(register.id, register.file_path)}
                        disabled={deleteDocument.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No attendance registers uploaded yet.</p>
            <p className="text-xs">Upload attendance registers for physical meetings.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}