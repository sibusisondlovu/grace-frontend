import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProcessFlow } from "@/components/processes/ProcessFlow";
import { ProcessSteps } from "@/components/processes/ProcessSteps";
import { useBusinessProcesses, useProcessSteps, useUpdateProcessStatus } from "@/hooks/useBusinessProcesses";
import { useIsAdmin, useIsCoordinator } from "@/hooks/useUserRole";
import { 
  Building2, 
  Calendar, 
  FileText, 
  Vote, 
  CheckSquare, 
  Users, 
  Globe, 
  Gavel,
  Clock,
  DollarSign,
  Target,
  ShoppingCart,
  Shield,
  TrendingUp
} from "lucide-react";

const categoryColors = {
  governance: "bg-blue-500/10 text-blue-700 border-blue-200",
  meetings: "bg-green-500/10 text-green-700 border-green-200",
  documentation: "bg-purple-500/10 text-purple-700 border-purple-200",
  operations: "bg-orange-500/10 text-orange-700 border-orange-200",
  transparency: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
  compliance: "bg-red-500/10 text-red-700 border-red-200",
  Financial: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  HR: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
  "Supply Chain": "bg-amber-500/10 text-amber-700 border-amber-200",
  Governance: "bg-rose-500/10 text-rose-700 border-rose-200"
};

export default function Processes() {
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const { data: processes = [], isLoading } = useBusinessProcesses();
  const { data: steps = [] } = useProcessSteps(selectedProcessId || undefined);
  const updateStatus = useUpdateProcessStatus();
  const { hasRole: isAdmin } = useIsAdmin();
  const { hasRole: isCoordinator } = useIsCoordinator();
  
  const canManage = isAdmin || isCoordinator;

  const getIconComponent = (iconName?: string) => {
    const icons: Record<string, any> = {
      Building2, Calendar, FileText, Vote, CheckSquare, Users, Globe, Gavel,
      DollarSign, Target, ShoppingCart, Shield, TrendingUp
    };
    const Icon = iconName && icons[iconName] ? icons[iconName] : FileText;
    return Icon;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "in_progress":
      case "current":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "pending":
      case "not_started":
        return "bg-gray-100 text-gray-600 border-gray-300";
      case "blocked":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const handleStatusChange = (processId: string, newStatus: string) => {
    updateStatus.mutate({ id: processId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading processes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Business Processes</h1>
          <p className="text-muted-foreground">
            Track and manage all committee and departmental processes
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {processes.length} Active Processes
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Process Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed View</TabsTrigger>
          <TabsTrigger value="flows">Process Flows</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processes.map((process) => {
              const IconComponent = getIconComponent(process.icon);
              
              return (
                <Card 
                  key={process.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedProcessId(process.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{process.name}</CardTitle>
                          <Badge variant="outline" className={categoryColors[process.category as keyof typeof categoryColors] || 'bg-gray-500'}>
                            {process.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {process.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{process.overall_progress}%</span>
                      </div>
                      <Progress value={process.overall_progress} />
                      
                      {canManage && (
                        <Select 
                          value={process.status} 
                          onValueChange={(value) => handleStatusChange(process.id, value)}
                        >
                          <SelectTrigger onClick={(e) => e.stopPropagation()}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not_started">Not Started</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {!canManage && (
                        <Badge variant="outline" className={getStatusColor(process.status)}>
                          {process.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      )}
                      
                      {process.department && (
                        <p className="text-xs text-muted-foreground">
                          Department: {process.department}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Select Process</h3>
              {processes.map((process) => {
                const IconComponent = getIconComponent(process.icon);
                return (
                  <Card 
                    key={process.id} 
                    className={`cursor-pointer transition-all ${
                      selectedProcessId === process.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedProcessId(process.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-medium">{process.name}</h4>
                          <Badge variant="outline" className={categoryColors[process.category as keyof typeof categoryColors] || 'bg-gray-500'}>
                            {process.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="lg:col-span-2">
              {selectedProcessId ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const process = processes.find(p => p.id === selectedProcessId);
                        if (!process) return null;
                        const IconComponent = getIconComponent(process.icon);
                        return (
                          <>
                            <IconComponent className="h-6 w-6 text-primary" />
                            <div>
                              <CardTitle>{process.name}</CardTitle>
                              <CardDescription>{process.description}</CardDescription>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {steps.length > 0 ? (
                      <ProcessSteps steps={steps} getStatusColor={getStatusColor} />
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No steps defined for this process yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <p className="text-center text-muted-foreground">
                      Select a process to view its detailed steps
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="flows" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Select Process Flow</h3>
              {processes.map((process) => {
                const IconComponent = getIconComponent(process.icon);
                return (
                  <Card 
                    key={process.id} 
                    className={`cursor-pointer transition-all ${
                      selectedProcessId === process.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedProcessId(process.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-medium">{process.name}</h4>
                          <Badge variant="outline" className={categoryColors[process.category as keyof typeof categoryColors] || 'bg-gray-500'}>
                            {process.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="lg:col-span-2">
              {selectedProcessId ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Process Flow Diagram</CardTitle>
                    <CardDescription>
                      Visual representation of the workflow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {steps.length > 0 ? (
                      <ProcessFlow 
                        elements={steps.map((step, idx) => ({
                          id: step.id,
                          type: idx === 0 ? 'start' : idx === steps.length - 1 ? 'end' : 'process',
                          label: step.title
                        }))}
                      />
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No flow diagram available for this process yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <p className="text-center text-muted-foreground">
                      Select a process to view its flow diagram
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
