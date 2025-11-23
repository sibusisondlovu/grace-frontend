import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DepartmentSelector } from "@/components/departmental/DepartmentSelector";
import { ActionItemsManager } from "@/components/departmental/ActionItemsManager";
import { EscalationTracker } from "@/components/departmental/EscalationTracker";
import { RegisterManager } from "@/components/departmental/RegisterManager";
import { useDepartmentalRegisters } from "@/hooks/useDepartmentalRegisters";
import { useDecisionsRegister } from "@/hooks/useDecisionsRegister";
import { useIsDirector } from "@/hooks/useUserRole";
import { FileText, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function DepartmentalDashboard() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const { hasRole: isDirector } = useIsDirector();
  const { data: registers = [] } = useDepartmentalRegisters(
    selectedDepartment !== 'all' ? selectedDepartment : undefined
  );
  const { data: decisions = [] } = useDecisionsRegister();

  // Filter decisions by department
  const filteredDecisions = selectedDepartment !== 'all'
    ? decisions.filter(d => d.owner_department === selectedDepartment)
    : decisions;

  const pendingCount = filteredDecisions.filter(d => d.status === 'pending').length;
  const overdueCount = filteredDecisions.filter(d => 
    d.due_date && new Date(d.due_date) < new Date() && d.status === 'pending'
  ).length;
  const completedCount = filteredDecisions.filter(d => d.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Departmental Dashboard</h1>
          <p className="text-muted-foreground">
            Track decisions, resolutions, and departmental registers
          </p>
        </div>
        <div className="w-64">
          <DepartmentSelector
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            label="Filter by Department"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Decisions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredDecisions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedDepartment !== 'all' ? `${selectedDepartment}` : 'All departments'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <TrendingUp className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Require escalation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Escalation Tracker - Only visible to Directors */}
      {isDirector && (
        <EscalationTracker department={selectedDepartment} />
      )}

      {/* Action Items & Register Management */}
      <div className="grid gap-6 md:grid-cols-2">
        <ActionItemsManager department={selectedDepartment} />
        <RegisterManager department={selectedDepartment} />
      </div>
    </div>
  );
}
