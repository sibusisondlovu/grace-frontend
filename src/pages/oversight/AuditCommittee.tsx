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
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Search, 
  Download, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
  Target,
  Clock
} from "lucide-react";
import { format, subMonths } from "date-fns";

const useAuditData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['audit-data'],
    queryFn: async () => {
      // Get Audit Committee
      const { data: auditCommittee } = await supabase
        .from('committees')
        .select('id, name')
        .ilike('name', '%audit%')
        .maybeSingle();

      // Mock audit data (in real app, this would come from audit tables)
      const mockAudits = [
        {
          id: 1,
          title: "Internal Financial Controls Audit",
          type: "Internal Audit",
          status: "completed",
          risk_level: "medium",
          start_date: "2025-06-01",
          completion_date: "2025-08-15",
          findings: 8,
          recommendations: 6,
          implemented: 4,
          auditor: "Internal Audit Department"
        },
        {
          id: 2,
          title: "IT Security and Governance Audit",
          type: "IT Audit",
          status: "in_progress",
          risk_level: "high",
          start_date: "2025-07-15",
          completion_date: null,
          findings: 12,
          recommendations: 10,
          implemented: 2,
          auditor: "External IT Auditors"
        },
        {
          id: 3,
          title: "Procurement Process Audit",
          type: "Compliance Audit",
          status: "planned",
          risk_level: "high",
          start_date: "2025-09-01",
          completion_date: null,
          findings: 0,
          recommendations: 0,
          implemented: 0,
          auditor: "Internal Audit Department"
        }
      ];

      const mockRiskAssessments = [
        {
          id: 1,
          area: "Financial Management",
          risk_score: 85,
          last_assessment: "2025-08-01",
          trend: "improving",
          controls: "Strong"
        },
        {
          id: 2,
          area: "Information Technology",
          risk_score: 92,
          last_assessment: "2025-07-15",
          trend: "stable",
          controls: "Adequate"
        },
        {
          id: 3,
          area: "Human Resources",
          risk_score: 78,
          last_assessment: "2025-08-10",
          trend: "deteriorating", 
          controls: "Weak"
        }
      ];

      // Get recent meetings if audit committee exists
      let meetings = [];
      if (auditCommittee) {
        const threeMonthsAgo = subMonths(new Date(), 3);
        const { data: meetingData } = await supabase
          .from('meetings')
          .select(`
            id,
            title,
            meeting_date,
            status,
            agenda_published,
            minutes_published
          `)
          .eq('committee_id', auditCommittee.id)
          .gte('meeting_date', threeMonthsAgo.toISOString())
          .order('meeting_date', { ascending: false });
        
        meetings = meetingData || [];
      }

      return {
        committee: auditCommittee,
        audits: mockAudits,
        riskAssessments: mockRiskAssessments,
        meetings
      };
    },
    enabled: !!user,
    retry: false,
  });
};

export default function AuditCommittee() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: auditData, isLoading } = useAuditData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'planned': return 'outline';
      default: return 'outline';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'deteriorating': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-header p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Audit Committee
              </h1>
              <p className="text-muted-foreground">
                Internal and external audit oversight, risk assessment, and compliance monitoring
              </p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Audit Reports
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Active Audits</span>
                </div>
                <div className="text-2xl font-bold">
                  {auditData?.audits.filter(a => a.status === 'in_progress').length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Currently underway</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">High Risk Areas</span>
                </div>
                <div className="text-2xl font-bold">
                  {auditData?.riskAssessments.filter(r => r.risk_score > 85).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Recommendations</span>
                </div>
                <div className="text-2xl font-bold">
                  {auditData?.audits.reduce((sum, audit) => sum + audit.implemented, 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground">Implemented this year</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Compliance Rate</span>
                </div>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">Overall compliance</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search audits, assessments, or reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="audits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audits">Current Audits</TabsTrigger>
          <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
          <TabsTrigger value="meetings">Committee Meetings</TabsTrigger>
          <TabsTrigger value="reports">Audit Reports</TabsTrigger>
        </TabsList>

        {/* Current Audits */}
        <TabsContent value="audits" className="space-y-6">
          <div className="grid gap-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-4" />
                    <div className="grid grid-cols-4 gap-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              auditData?.audits.map((audit: any) => (
                <Card key={audit.id} className="shadow-card">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{audit.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {audit.type} • {audit.auditor}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getRiskColor(audit.risk_level)}>
                          {audit.risk_level} risk
                        </Badge>
                        <Badge variant={getStatusColor(audit.status)}>
                          {audit.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-2xl font-bold text-destructive">{audit.findings}</div>
                        <div className="text-sm text-muted-foreground">Findings</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-warning">{audit.recommendations}</div>
                        <div className="text-sm text-muted-foreground">Recommendations</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-success">{audit.implemented}</div>
                        <div className="text-sm text-muted-foreground">Implemented</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {audit.recommendations > 0 ? Math.round((audit.implemented / audit.recommendations) * 100) : 0}%
                        </div>
                        <div className="text-sm text-muted-foreground">Progress</div>
                      </div>
                    </div>
                    
                    {audit.recommendations > 0 && (
                      <Progress 
                        value={(audit.implemented / audit.recommendations) * 100} 
                        className="h-2 mb-4" 
                      />
                    )}

                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Started: {format(new Date(audit.start_date), 'MMM dd, yyyy')}
                      </span>
                      {audit.completion_date && (
                        <span>
                          Completed: {format(new Date(audit.completion_date), 'MMM dd, yyyy')}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Risk Assessment */}
        <TabsContent value="risks" className="space-y-6">
          <div className="grid gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-3" />
                    <Skeleton className="h-2 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : (
              auditData?.riskAssessments.map((risk: any) => (
                <Card key={risk.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium text-lg">{risk.area}</h4>
                        <p className="text-sm text-muted-foreground">
                          Last assessed: {format(new Date(risk.last_assessment), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(risk.trend)}
                        <span className="text-sm capitalize">{risk.trend}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Risk Score</span>
                          <span className="text-sm font-medium">{risk.risk_score}/100</span>
                        </div>
                        <Progress value={risk.risk_score} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Control Effectiveness:</span>
                        <Badge variant={
                          risk.controls === 'Strong' ? 'default' : 
                          risk.controls === 'Adequate' ? 'secondary' : 
                          'destructive'
                        }>
                          {risk.controls}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Committee Meetings */}
        <TabsContent value="meetings" className="space-y-6">
          <div className="grid gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
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
            ) : auditData?.committee ? (
              auditData.meetings.map((meeting: any) => (
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
                          <Badge variant="outline">Agenda</Badge>
                        )}
                        {meeting.minutes_published && (
                          <Badge variant="outline">Minutes</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No Audit Committee found in the system. Please ensure the committee is properly configured.
                </AlertDescription>
              </Alert>
            )}

            {!isLoading && auditData?.committee && !auditData.meetings.length && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No recent committee meetings found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Audit Reports */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Audit Reports Archive</h3>
              <p className="text-muted-foreground mb-4">
                Access historical audit reports, management responses, and follow-up actions
              </p>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Browse Report Archive
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}