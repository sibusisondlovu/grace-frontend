import { useState } from "react";
import { FileText, Save, Upload, Eye, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PublishButtons } from "./PublishButtons";
import { useMeetingDocuments } from "@/hooks/useMeetingInteractions";
import { useDocumentUpload, useDeleteDocument } from "@/hooks/useDocumentUpload";
import { Meeting } from "@/hooks/useMeetings";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MinutesEditorProps {
  meeting: Meeting;
}

export function MinutesEditor({ meeting }: MinutesEditorProps) {
  const { data: documents } = useMeetingDocuments(meeting.id, true);
  const uploadDocument = useDocumentUpload();
  const deleteDocument = useDeleteDocument();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const minutesDocuments = documents?.filter(doc => doc.document_type === 'minutes') || [];

  const handleCreateMinutes = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const file = formData.get("file") as File;

    await uploadDocument.mutateAsync({
      meetingId: meeting.id,
      documentType: 'minutes',
      title,
      content: file.size === 0 ? content : undefined,
      file: file.size > 0 ? file : undefined,
    });

    setIsCreateOpen(false);
    (e.target as HTMLFormElement).reset();
  };

  const handlePreview = (content: string) => {
    setPreviewContent(content);
    setIsPreviewOpen(true);
  };

  const handleDelete = async (documentId: string, filePath?: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await deleteDocument.mutateAsync({ documentId, filePath });
    }
  };

  const handleGenerateMinutes = async () => {
    setIsGenerating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Error",
          description: "You must be logged in to generate minutes",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke('generate-minutes', {
        body: { meetingId: meeting.id },
      });

      if (response.error) {
        console.error("Error generating minutes:", response.error);
        
        // Handle specific error cases
        if (response.error.message?.includes("Rate limits exceeded")) {
          toast({
            title: "Rate Limit Reached",
            description: "Too many requests. Please try again in a few moments.",
            variant: "destructive",
          });
        } else if (response.error.message?.includes("Payment required")) {
          toast({
            title: "Credits Required",
            description: "Please add funds to your Lovable AI workspace to continue.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to generate minutes. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      if (response.data?.minutes) {
        setGeneratedContent(response.data.minutes);
        toast({
          title: "Success",
          description: "Minutes generated successfully! Review and edit as needed.",
        });
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Meeting Minutes</span>
          </CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Create Minutes
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Create Meeting Minutes</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateMinutes} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Minutes Title</Label>
                  <Input
                    name="title"
                    placeholder="e.g., Draft Minutes - January 2025"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content">Minutes Content (Text)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateMinutes}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-2" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    name="content"
                    placeholder="Enter minutes text content or click 'Generate with AI' to draft from agenda and decisions..."
                    rows={12}
                    className="font-mono text-sm"
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use AI to generate draft minutes from agenda items and decisions, then edit as needed. Or upload a file below instead.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Upload File (Optional)</Label>
                  <Input
                    name="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX, TXT
                  </p>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploadDocument.isPending}>
                    {uploadDocument.isPending ? "Creating..." : "Create Minutes"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {minutesDocuments.length > 0 ? (
          <div className="space-y-3">
            {minutesDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-sm">{doc.title}</h4>
                    <Badge variant={doc.published ? "default" : "secondary"} className="text-xs">
                      {doc.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {doc.content && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(doc.content!)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  )}
                  <PublishButtons
                    type="document"
                    id={doc.id}
                    published={doc.published}
                    meetingId={meeting.id}
                    size="sm"
                    showBadge={false}
                    documentTitle={doc.title}
                    documentContent={doc.content || ''}
                    documentType="minutes"
                    meetingTitle={meeting.title}
                    committee={meeting.committee?.name || 'Committee'}
                    meetingDate={meeting.meeting_date}
                    useProfessionalTemplate={true}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(doc.id, doc.file_path)}
                    disabled={deleteDocument.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No minutes created yet</p>
            <p className="text-sm mt-1">Click "Create Minutes" to get started</p>
          </div>
        )}
      </CardContent>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Minutes Preview</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm bg-muted p-4 rounded-lg">
              {previewContent}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
