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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Scale, 
  Search, 
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  User,
  Calendar,
  Eye
} from "lucide-react";
import { format, subMonths } from "date-fns";

const useDisciplinaryData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['disciplinary-data'],
    queryFn: async () => {
      // Mock disciplinary cases (in real app, this would come from disciplinary tables)
      const mockCases = [
        {
          id: 1,
          case_number: "DISC-2025-001",
          subject: "Code of Conduct Violation",
          description: "Failure to declare conflict of interest in procurement decision",
          status: "under_investigation",
          severity: "medium",
          reported_date: "2025-07-15",
          target_completion: "2025-09-15",
          complainant_type: "internal",
          respondent: "Councillor J. Smith",
          investigator: "Ethics Committee",
          stage: "investigation"
        },
        {
          id: 2,
          case_number: "DISC-2025-002",
          subject: "Misconduct in Meeting",
          description: "Inappropriate behavior during committee session",
          status: "hearing_scheduled",
          severity: "low",
          reported_date: "2025-08-01",
          target_completion: "2025-10-01",
          complainant_type: "public",
          respondent: "Committee Member A. Johnson",
          investigator: "Disciplinary Panel",
          stage: "hearing"
        },
        {
          id: 3,
          case_number: "DISC-2025-003",
          subject: "Financial Irregularity",
          description: "Unauthorized use of municipal resources",
          status: "completed",
          severity: "high",
          reported_date: "2025-05-10",
          target_completion: "2025-07-10",
          complainant_type: "internal",
          respondent: "Department Head M. Williams",
          investigator: "Internal Affairs",
          stage: "closed",
          outcome: "Written Warning"
        }
      ];

      const mockPolicies = [
        {
          id: 1,
          title: "Code of Conduct for Elected Officials",
          category: "Ethics",
          last_updated: "2025-06-01",
          version: "2.1",
          compliance_rate: 95
        },
        {
          id: 2,
          title: "Disciplinary Procedures Manual",
          category: "Procedure",
          last_updated: "2025-07-15",
          version: "1.3",
          compliance_rate: 88
        },
        {
          id: 3,
          title: "Conflict of Interest Policy",
          category: "Ethics",
          last_updated: "2025-05-20",
          version: "3.0",
          compliance_rate: 92
        }
      ];

      // Calculate statistics
      const totalCases = mockCases.length;
      const activeCases = mockCases.filter(c => c.status !== 'completed').length;
      const overdueInvestigations = mockCases.filter(c => 
        c.status === 'under_investigation' && 
        new Date(c.target_completion) < new Date()
      ).length;

      return {
        cases: mockCases,
        policies: mockPolicies,
        statistics: {
          totalCases,
          activeCases,
          overdueInvestigations,
          completionRate: Math.round(((totalCases - activeCases) / totalCases) * 100)
        }
      };
    },
    enabled: !!user,
    retry: false,
  });
};

export default function Disciplinary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: disciplinaryData, isLoading } = useDisciplinaryData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'under_investigation': return 'secondary';
      case 'hearing_scheduled': return 'outline';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'investigation': return <Search className="h-4 w-4" />;
      case 'hearing': return <Scale className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-header p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Scale className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Disciplinary Oversight
              </h1>
              <p className="text-muted-foreground">
                Monitor disciplinary cases, ethics violations, and policy compliance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
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
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Total Cases</span>
                </div>
                <div className="text-2xl font-bold">{disciplinaryData?.statistics.totalCases || 0}</div>
                <p className="text-xs text-muted-foreground">All time cases</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Active Cases</span>
                </div>
                <div className="text-2xl font-bold">{disciplinaryData?.statistics.activeCases || 0}</div>
                <p className="text-xs text-muted-foreground">Currently open</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Overdue</span>
                </div>
                <div className="text-2xl font-bold">{disciplinaryData?.statistics.overdueInvestigations || 0}</div>
                <p className="text-xs text-muted-foreground">Past deadline</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Completion Rate</span>
                </div>
                <div className="text-2xl font-bold">{disciplinaryData?.statistics.completionRate || 0}%</div>
                <p className="text-xs text-muted-foreground">Cases resolved</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cases, subjects, or respondents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cases</SelectItem>
                <SelectItem value="under_investigation">Under Investigation</SelectItem>
                <SelectItem value="hearing_scheduled">Hearing Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="cases" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cases">Disciplinary Cases</TabsTrigger>
          <TabsTrigger value="policies">Policies & Guidelines</TabsTrigger>
          <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
        </TabsList>

        {/* Disciplinary Cases */}
        <TabsContent value="cases" className="space-y-6">
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-4" />
                    <div className="grid grid-cols-4 gap-4">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              disciplinaryData?.cases.map((case_item: any) => (
                <Card key={case_item.id} className="shadow-card">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          {getStageIcon(case_item.stage)}
                          <span>{case_item.case_number}</span>
                        </CardTitle>
                        <p className="text-lg font-medium mt-1">{case_item.subject}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {case_item.description}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant={getStatusColor(case_item.status)}>
                          {case_item.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getSeverityColor(case_item.severity)}>
                          {case_item.severity}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Respondent</div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span className="text-sm">{case_item.respondent}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Investigator</div>
                        <div className="text-sm">{case_item.investigator}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Reported</div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">{format(new Date(case_item.reported_date), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Target Date</div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-sm">{format(new Date(case_item.target_completion), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    </div>

                    {case_item.outcome && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm font-medium text-muted-foreground">Outcome</div>
                        <div className="text-sm">{case_item.outcome}</div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-4">
                      <Badge variant="outline">
                        {case_item.complainant_type} complaint
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {!isLoading && !disciplinaryData?.cases.length && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Scale className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No disciplinary cases found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Policies & Guidelines */}
        <TabsContent value="policies" className="space-y-6">
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
              disciplinaryData?.policies.map((policy: any) => (
                <Card key={policy.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium text-lg">{policy.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Category: {policy.category} • Version {policy.version}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Last updated: {format(new Date(policy.last_updated), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{policy.compliance_rate}%</div>
                        <div className="text-sm text-muted-foreground">Compliance</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{policy.category}</Badge>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        View Policy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Reports & Analytics */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Disciplinary Trends</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive analytics on disciplinary patterns, compliance trends, and case outcomes
                </p>
                <Button variant="outline">
                  Generate Analytics Report
                </Button>
              </CardContent>
            </Card>

            {disciplinaryData?.statistics.overdueInvestigations > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{disciplinaryData.statistics.overdueInvestigations}</strong> investigations are past their target completion dates and require immediate attention.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}