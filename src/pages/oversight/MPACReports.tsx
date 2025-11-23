import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format, subDays } from "date-fns";

const useMPACData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['mpac-data'],
    queryFn: async () => {
      // Get MPAC committee
      const { data: mpacCommittee } = await supabase
        .from('committees')
        .select('id, name')
        .eq('name', 'Municipal Public Accounts Committee (MPAC)')
        .maybeSingle();

      if (!mpacCommittee) {
        // Return empty data structure if no MPAC committee found
        return {
          committee: null,
          meetings: [],
          actionItems: [],
          reports: []
        };
      }

      // Get recent MPAC meetings
      const thirtyDaysAgo = subDays(new Date(), 30);
      const { data: meetings } = await supabase
        .from('meetings')
        .select(`
          id,
          title,
          meeting_date,
          status,
          agenda_published,
          minutes_published
        `)
        .eq('committee_id', mpacCommittee.id)
        .gte('meeting_date', thirtyDaysAgo.toISOString())
        .order('meeting_date', { ascending: false });

      // Get MPAC action items
      const { data: actionItems } = await supabase
        .from('action_items')
        .select(`
          id,
          title,
          status,
          priority,
          due_date,
          created_at
        `)
        .eq('committee_id', mpacCommittee.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Mock reports data (in real app, this would come from a reports table)
      const mockReports = [
        {
          id: 1,
          title: "Annual Financial Statement Review 2023/24",
          type: "Financial Audit",
          status: "completed",
          date: "2025-08-15",
          findings: 12,
          recommendations: 8
        },
        {
          id: 2,
          title: "Municipal Entity Performance Review",
          type: "Performance Audit",
          status: "in_progress",
          date: "2025-08-01",
          findings: 6,
          recommendations: 4
        },
        {
          id: 3,
          title: "Supply Chain Management Audit",
          type: "Compliance Audit",
          status: "pending",
          date: "2025-07-20",
          findings: 15,
          recommendations: 12
        }
      ];

      return {
        committee: mpacCommittee,
        meetings: meetings || [],
        actionItems: actionItems || [],
        reports: mockReports
      };
    },
    enabled: !!user,
    retry: false,
  });
};

export default function MPACReports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  
  const { data: mpacData, isLoading } = useMPACData();

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setIsReportDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (!mpacData?.committee && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-header p-6 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                MPAC Reports
              </h1>
              <p className="text-muted-foreground">
                Municipal Public Accounts Committee oversight and reporting
              </p>
            </div>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No MPAC committee found in the system. Please ensure the Municipal Public Accounts Committee is properly configured.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-header p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                MPAC Reports
              </h1>
              <p className="text-muted-foreground">
                Municipal Public Accounts Committee oversight and reporting
              </p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports, meetings, or action items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Audit Reports</TabsTrigger>
          <TabsTrigger value="meetings">MPAC Meetings</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
        </TabsList>

        {/* Audit Reports */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-3" />
                    <div className="flex gap-2 mb-3">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : (
              mpacData?.reports.map((report: any) => (
                <Card key={report.id} className="shadow-card">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {report.type} • {format(new Date(report.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(report.status)}>
                        {report.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-2xl font-bold text-destructive">{report.findings}</div>
                        <div className="text-sm text-muted-foreground">Findings</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-warning">{report.recommendations}</div>
                        <div className="text-sm text-muted-foreground">Recommendations</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {Math.round((report.recommendations / report.findings) * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Implementation Rate</div>
                      </div>
                      <div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleViewReport(report)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Report
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Click to view detailed findings, management responses, and implementation timelines
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* MPAC Meetings */}
        <TabsContent value="meetings" className="space-y-6">
          <div className="grid gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              mpacData?.meetings.map((meeting: any) => (
                <Card key={meeting.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{meeting.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {format(new Date(meeting.meeting_date), 'PPP')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getStatusColor(meeting.status)}>
                          {meeting.status}
                        </Badge>
                        {meeting.agenda_published && (
                          <Badge variant="outline">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Agenda
                          </Badge>
                        )}
                        {meeting.minutes_published && (
                          <Badge variant="outline">
                            <FileText className="h-3 w-3 mr-1" />
                            Minutes
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {!isLoading && !mpacData?.meetings.length && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No MPAC meetings found in the last 30 days</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Action Items */}
        <TabsContent value="actions" className="space-y-6">
          <div className="grid gap-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <div className="flex gap-2 mb-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : (
              mpacData?.actionItems.map((action: any) => (
                <Card key={action.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{action.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {action.due_date && (
                            <>
                              <Clock className="h-3 w-3 inline mr-1" />
                              Due: {format(new Date(action.due_date), 'MMM dd, yyyy')}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getPriorityColor(action.priority)}>
                          {action.priority}
                        </Badge>
                        <Badge variant={getStatusColor(action.status)}>
                          {action.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {!isLoading && !mpacData?.actionItems.length && (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No action items found for MPAC</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Report Details Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>
              {selectedReport?.type} • {selectedReport && format(new Date(selectedReport.date), 'MMMM dd, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-3xl font-bold text-destructive">{selectedReport.findings}</div>
                    <div className="text-sm text-muted-foreground">Total Findings</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-3xl font-bold text-warning">{selectedReport.recommendations}</div>
                    <div className="text-sm text-muted-foreground">Recommendations</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-3xl font-bold text-primary">
                      {Math.round((selectedReport.recommendations / selectedReport.findings) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Implementation Rate</div>
                  </CardContent>
                </Card>
              </div>

              {/* Report Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Report Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current Status:</span>
                    <Badge variant={getStatusColor(selectedReport.status)} className="text-sm">
                      {selectedReport.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Key Findings Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                    Key Findings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Financial irregularities identified in procurement processes</p>
                    <p className="text-xs text-muted-foreground mt-1">Requires immediate corrective action</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Non-compliance with Municipal Finance Management Act</p>
                    <p className="text-xs text-muted-foreground mt-1">Recommendations submitted to council</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Documentation gaps in expenditure authorization</p>
                    <p className="text-xs text-muted-foreground mt-1">System improvements proposed</p>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                    Management Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">1</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Strengthen internal controls in procurement department</p>
                      <p className="text-xs text-muted-foreground mt-1">Timeline: 30 days • Responsible: CFO</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">2</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Implement mandatory compliance training for all staff</p>
                      <p className="text-xs text-muted-foreground mt-1">Timeline: 60 days • Responsible: HR Manager</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">3</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Review and update financial authorization procedures</p>
                      <p className="text-xs text-muted-foreground mt-1">Timeline: 45 days • Responsible: Municipal Manager</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
                  Close
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download Full Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}