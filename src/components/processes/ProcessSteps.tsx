import { ArrowRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProcessStep {
  id: number | string;
  title: string;
  description?: string;
  status: "completed" | "current" | "pending" | "in_progress" | "skipped";
  responsible_party?: string;
  duration_days?: number;
}

interface ProcessStepsProps {
  steps: ProcessStep[];
  getStatusColor: (status: string) => string;
}

export function ProcessSteps({ steps, getStatusColor }: ProcessStepsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "current":
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      case "skipped":
        return <AlertCircle className="h-5 w-5 text-gray-300" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted border-2 border-border">
              {getStatusIcon(step.status)}
            </div>
            {index < steps.length - 1 && (
              <div className="w-0.5 h-12 bg-border mt-2" />
            )}
          </div>
          
          <div className="flex-1 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold text-foreground">{step.title}</h4>
              <Badge variant="outline" className={getStatusColor(step.status)}>
                {step.status.replace('_', ' ')}
              </Badge>
            </div>
            {step.description && (
              <p className="text-sm text-muted-foreground">{step.description}</p>
            )}
            {step.responsible_party && (
              <p className="text-xs text-muted-foreground mt-1">
                Responsible: {step.responsible_party}
              </p>
            )}
          </div>
          
          {(step.status === "current" || step.status === "in_progress") && (
            <div className="flex items-center text-blue-600">
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}