import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertCircle, ArrowUpCircle } from "lucide-react";
import { useDecisionsRegister } from "@/hooks/useDecisionsRegister";
import { useUpdateDecision } from "@/hooks/useDecisionsRegister";
import { format } from "date-fns";

interface EscalationTrackerProps {
  department?: string;
}

export const EscalationTracker = ({ department }: EscalationTrackerProps) => {
  const { data: decisions = [] } = useDecisionsRegister();
  const updateDecision = useUpdateDecision();

  // Filter decisions that need escalation
  const escalationNeeded = decisions.filter(d => {
    const isOverdue = d.due_date && new Date(d.due_date) < new Date();
    const isPending = d.status === 'pending';
    const matchesDept = !department || department === 'all' || d.owner_department === department;
    return isOverdue && isPending && matchesDept;
  });

  // Group by escalation level
  const mancoLevel = escalationNeeded.filter(d => d.escalation_level === 'manco');
  const emtLevel = escalationNeeded.filter(d => d.escalation_level === 'emt');
  const semtLevel = escalationNeeded.filter(d => d.escalation_level === 'semt');

  const handleEscalate = (decisionId: string, currentLevel: string) => {
    const nextLevel = currentLevel === 'manco' ? 'emt' : 'semt';
    updateDecision.mutate({
      id: decisionId,
      escalation_level: nextLevel,
      progress_notes: `Escalated from ${currentLevel.toUpperCase()} to ${nextLevel.toUpperCase()} on ${format(new Date(), 'PPP')}`,
    });
  };

  const getEscalationColor = (level: string) => {
    switch (level) {
      case 'semt': return 'destructive';
      case 'emt': return 'default';
      case 'manco': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Escalation Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="border rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{mancoLevel.length}</p>
            <p className="text-xs text-muted-foreground">MANCO Level</p>
          </div>
          <div className="border rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{emtLevel.length}</p>
            <p className="text-xs text-muted-foreground">EMT Level</p>
          </div>
          <div className="border rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{semtLevel.length}</p>
            <p className="text-xs text-muted-foreground">SEMT Level</p>
          </div>
        </div>

        <div className="space-y-3">
          {escalationNeeded.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No decisions requiring escalation
              </p>
            </div>
          ) : (
            escalationNeeded.map((decision) => (
              <div key={decision.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{decision.decision_number}</span>
                      <Badge variant={getEscalationColor(decision.escalation_level)}>
                        {decision.escalation_level.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {decision.decision_text}
                    </p>
                  </div>
                  {decision.escalation_level !== 'semt' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEscalate(decision.id, decision.escalation_level)}
                      disabled={updateDecision.isPending}
                    >
                      <ArrowUpCircle className="h-4 w-4 mr-1" />
                      Escalate
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {decision.owner_department && (
                    <Badge variant="outline" className="text-xs">
                      {decision.owner_department}
                    </Badge>
                  )}
                  {decision.due_date && (
                    <span className="text-red-500">
                      Overdue: {format(new Date(decision.due_date), 'PP')}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
