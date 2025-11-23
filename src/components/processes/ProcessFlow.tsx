import { ArrowDown, ArrowRight, Diamond, Circle, Square } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FlowElement {
  id: string;
  type: "start" | "process" | "decision" | "end";
  label: string;
}

interface ProcessFlowProps {
  elements: FlowElement[];
}

export function ProcessFlow({ elements }: ProcessFlowProps) {
  const getElementStyle = (type: string) => {
    switch (type) {
      case "start":
        return "bg-green-100 text-green-800 border-green-300 rounded-full";
      case "process":
        return "bg-blue-100 text-blue-800 border-blue-300 rounded-lg";
      case "decision":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 transform rotate-45";
      case "end":
        return "bg-red-100 text-red-800 border-red-300 rounded-full";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 rounded-lg";
    }
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case "start":
        return <Circle className="h-4 w-4" />;
      case "process":
        return <Square className="h-4 w-4" />;
      case "decision":
        return <Diamond className="h-4 w-4" />;
      case "end":
        return <Circle className="h-4 w-4 fill-current" />;
      default:
        return <Square className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {elements.map((element, index) => (
        <div key={element.id} className="flex flex-col items-center">
          <Card 
            className={`
              p-4 border-2 min-w-[200px] min-h-[80px] 
              flex items-center justify-center text-center
              ${getElementStyle(element.type)}
              ${element.type === "decision" ? "w-32 h-32" : ""}
            `}
          >
            <div className={`flex items-center gap-2 ${element.type === "decision" ? "transform -rotate-45" : ""}`}>
              {getElementIcon(element.type)}
              <span className="font-medium text-sm">{element.label}</span>
            </div>
          </Card>
          
          {index < elements.length - 1 && (
            <div className="flex items-center justify-center py-3">
              <ArrowDown className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}