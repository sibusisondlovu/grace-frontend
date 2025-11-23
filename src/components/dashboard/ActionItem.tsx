import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock, AlertCircle, CheckCircle, Calendar, User } from "lucide-react";
import { type ActionItem as ActionItemType } from "@/hooks/useActions";

interface ActionItemProps {
  action: ActionItemType;
}

export function ActionItem({ action }: ActionItemProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-warning text-warning-foreground";
      case "medium":
        return "bg-accent text-accent-foreground";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-success";
      case "overdue":
        return "text-destructive";
      case "in_progress":
        return "text-warning";
      default:
        return "text-muted-foreground";
    }
  };

  // Use fallback values for optional fields
  const description = action.description || 'No description available';
  const assignee = action.assigned_to_department || 'Unassigned';
  const committee = 'No Committee';
  const dueDate = action.due_date ? new Date(action.due_date).toLocaleDateString() : 'No due date';

  return (
    <Card className="shadow-card hover:shadow-primary transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon(action.status)}
              <h3 className="font-semibold text-sm">{action.title}</h3>
              <Badge className={getPriorityColor(action.priority)} variant="secondary">
                {action.priority}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <User className="h-3 w-3 text-muted-foreground" />
            <span>{assignee}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className={getStatusColor(action.status)}>{dueDate}</span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Committee: {committee}
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="text-xs h-7">
            View
          </Button>
          {action.status !== "completed" && (
            <Button size="sm" className="text-xs h-7">
              Update
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}