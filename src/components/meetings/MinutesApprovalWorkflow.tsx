import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileCheck, Send, CheckCircle } from "lucide-react";
import { useMinutesApproval, useCreateMinutesApproval, useUpdateMinutesApproval } from "@/hooks/useMinutesApproval";
import { useAuth } from "@/hooks/useAuth";
import { useCanSubmitMinutes, useCanApproveMinutes } from "@/hooks/useUserRole";
import { useState } from "react";
import { format } from "date-fns";

interface MinutesApprovalWorkflowProps {
  meetingId: string;
  documentId?: string;
}

export const MinutesApprovalWorkflow = ({ meetingId, documentId }: MinutesApprovalWorkflowProps) => {
  const { user } = useAuth();
  const { hasRole: canSubmit } = useCanSubmitMinutes();
  const { hasRole: canApprove } = useCanApproveMinutes();
  const { data: approval } = useMinutesApproval(meetingId);
  const createApproval = useCreateMinutesApproval();
  const updateApproval = useUpdateMinutesApproval();
  const [comments, setComments] = useState('');

  const handleSubmitForReview = () => {
    if (!documentId) return;
    
    createApproval.mutate({
      meeting_id: meetingId,
      document_id: documentId,
      approval_stage: 'review',
      submitted_by: user?.id,
      submitted_at: new Date().toISOString(),
      publication_scope: 'internal',
    });
  };

  const handleReview = () => {
    if (!approval) return;
    
    updateApproval.mutate({
      id: approval.id,
      approval_stage: 'approved',
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
      comments,
    });
  };

  const handleApprove = () => {
    if (!approval) return;
    
    updateApproval.mutate({
      id: approval.id,
      approval_stage: 'published',
      approved_by: user?.id,
      approved_at: new Date().toISOString(),
      comments,
    });
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'draft': return 'secondary';
      case 'review': return 'default';
      case 'approved': return 'default';
      case 'published': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Minutes Approval Workflow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!approval ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No approval workflow initiated</p>
              {documentId && canSubmit && (
                <Button onClick={handleSubmitForReview} disabled={createApproval.isPending}>
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Review
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Badge variant={getStageColor(approval.approval_stage)}>
                  {approval.approval_stage}
                </Badge>
                {approval.submitted_at && (
                  <span className="text-sm text-muted-foreground">
                    Submitted: {format(new Date(approval.submitted_at), 'PPp')}
                  </span>
                )}
              </div>

              {approval.reviewed_at && (
                <p className="text-sm text-muted-foreground">
                  Reviewed: {format(new Date(approval.reviewed_at), 'PPp')}
                </p>
              )}

              {approval.approved_at && (
                <p className="text-sm text-muted-foreground">
                  Approved: {format(new Date(approval.approved_at), 'PPp')}
                </p>
              )}

              {approval.comments && (
                <div className="border rounded-lg p-3">
                  <Label className="text-sm font-medium">Comments</Label>
                  <p className="text-sm mt-1">{approval.comments}</p>
                </div>
              )}

              {approval.approval_stage !== 'published' && canApprove && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="comments">Comments</Label>
                    <Textarea
                      id="comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Add your comments..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    {approval.approval_stage === 'review' && (
                      <Button onClick={handleReview} disabled={updateApproval.isPending}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Reviewed
                      </Button>
                    )}
                    {approval.approval_stage === 'approved' && (
                      <Button onClick={handleApprove} disabled={updateApproval.isPending}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve & Publish
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
