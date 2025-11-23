import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import { useDecisionsRegister, useCreateDecision } from "@/hooks/useDecisionsRegister";
import { useCanCaptureDecisions } from "@/hooks/useUserRole";
import { useState } from "react";
import { format } from "date-fns";

interface DecisionsTrackingProps {
  meetingId: string;
}

export const DecisionsTracking = ({ meetingId }: DecisionsTrackingProps) => {
  const { hasRole: canCapture } = useCanCaptureDecisions();
  const { data: decisions = [] } = useDecisionsRegister(meetingId);
  const createDecision = useCreateDecision();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    decision_number: '',
    decision_type: 'resolution',
    decision_text: '',
    owner_department: '',
    due_date: '',
    priority: 'medium',
    escalation_level: 'manco',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDecision.mutate({
      ...formData,
      meeting_id: meetingId,
      status: 'pending',
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setFormData({
          decision_number: '',
          decision_type: 'resolution',
          decision_text: '',
          owner_department: '',
          due_date: '',
          priority: 'medium',
          escalation_level: 'manco',
        });
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getEscalationIcon = (level: string) => {
    switch (level) {
      case 'emt':
      case 'semt':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Decisions & Resolutions
          </CardTitle>
          {canCapture && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Record Decision</Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Record New Decision</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="decision_number">Decision Number</Label>
                    <Input
                      id="decision_number"
                      value={formData.decision_number}
                      onChange={(e) => setFormData({ ...formData, decision_number: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="decision_type">Type</Label>
                    <Select
                      value={formData.decision_type}
                      onValueChange={(value) => setFormData({ ...formData, decision_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="resolution">Resolution</SelectItem>
                        <SelectItem value="decision">Decision</SelectItem>
                        <SelectItem value="recommendation">Recommendation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decision_text">Decision Text</Label>
                  <Textarea
                    id="decision_text"
                    value={formData.decision_text}
                    onChange={(e) => setFormData({ ...formData, decision_text: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="owner_department">Owner Department</Label>
                    <Input
                      id="owner_department"
                      value={formData.owner_department}
                      onChange={(e) => setFormData({ ...formData, owner_department: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="escalation_level">Escalation Level</Label>
                    <Select
                      value={formData.escalation_level}
                      onValueChange={(value) => setFormData({ ...formData, escalation_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manco">MANCO</SelectItem>
                        <SelectItem value="emt">EMT</SelectItem>
                        <SelectItem value="semt">SEMT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={createDecision.isPending}>
                  Record Decision
                </Button>
              </form>
            </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {decisions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No decisions recorded yet.</p>
          ) : (
            decisions.map((decision) => (
              <div key={decision.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getEscalationIcon(decision.escalation_level)}
                    <span className="font-medium">{decision.decision_number}</span>
                    <Badge variant={getPriorityColor(decision.priority)}>
                      {decision.priority}
                    </Badge>
                    <Badge variant="outline">{decision.escalation_level.toUpperCase()}</Badge>
                  </div>
                  <Badge>{decision.status}</Badge>
                </div>
                <p className="text-sm">{decision.decision_text}</p>
                {decision.owner_department && (
                  <p className="text-xs text-muted-foreground">
                    Owner: {decision.owner_department}
                  </p>
                )}
                {decision.due_date && (
                  <p className="text-xs text-muted-foreground">
                    Due: {format(new Date(decision.due_date), 'PPP')}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
