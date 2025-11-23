import { useComplianceMetrics, useComplianceReports } from "@/hooks/useCompliance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Gavel, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Clock,
  Users,
  Eye,
  TrendingUp,
  Download,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

export default function Compliance() {
  const { data: complianceData, isLoading: metricsLoading } = useComplianceMetrics();
  const { data: reportsData, isLoading: reportsLoading } = useComplianceReports();

  const metrics = complianceData?.metrics || {
    overallCompliance: 0,
    noticeComplianceRate: 0,
    docComplianceRate: 0,
    publicAccessRate: 0,
    quorumComplianceRate: 0,
    totalMeetings: 0,
    overdueActionsCount: 0
  };
  const issues = complianceData?.issues || {
    documentationIssues: [],
    publicAccessIssues: [],
    quorumIssues: [],
    overdueActions: []
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 70) return "secondary"; 
    return "destructive";
  };

  const getComplianceStatus = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Fair";
    return "Needs Attention";
  };

  const exportComplianceReport = () => {
    // In a real app, this would generate and download a PDF/CSV report
    console.log("Exporting compliance report...");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-header p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Gavel className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Compliance Dashboard
              </h1>
              <p className="text-muted-foreground">
                Monitor regulatory compliance and governance standards across all committees
              </p>
            </div>
          </div>
          <Button onClick={exportComplianceReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overall Compliance Score */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Overall Compliance Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metricsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold">
                  {metrics.overallCompliance || 0}%
                </div>
                <Badge variant={getComplianceColor(metrics.overallCompliance || 0)}>
                  {getComplianceStatus(metrics.overallCompliance || 0)}
                </Badge>
              </div>
              <Progress value={metrics.overallCompliance || 0} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Based on {metrics.totalMeetings} meetings analyzed over the last 30 days
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Compliance Metrics</TabsTrigger>
          <TabsTrigger value="issues">Current Issues</TabsTrigger>
          <TabsTrigger value="reports">Committee Reports</TabsTrigger>
        </TabsList>

        {/* Compliance Metrics */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricsLoading ? (
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
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Notice Compliance</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.noticeComplianceRate}%</div>
                    <Progress value={metrics.noticeComplianceRate} className="h-2 mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Documentation</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.docComplianceRate}%</div>
                    <Progress value={metrics.docComplianceRate} className="h-2 mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Public Access</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.publicAccessRate}%</div>
                    <Progress value={metrics.publicAccessRate} className="h-2 mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Quorum Achievement</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics.quorumComplianceRate}%</div>
                    <Progress value={metrics.quorumComplianceRate} className="h-2 mt-2" />
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Compliance Standards */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Compliance Standards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Meeting Requirements</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span>Minimum 5 days advance notice</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span>Published agenda 48 hours prior</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span>Quorum achievement for decisions</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span>Minutes published within 7 days</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>Transparency Standards</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span>Public access to meetings (where applicable)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span>Declaration of interests</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span>Record keeping standards</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span>Document accessibility</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Current Issues */}
        <TabsContent value="issues" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Documentation Issues */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-warning" />
                  <span>Documentation Issues</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {issues.documentationIssues?.slice(0, 5).map((meeting: any) => (
                      <Alert key={meeting.id}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{meeting.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {meeting.committees?.name} • {format(new Date(meeting.meeting_date), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <Badge variant="outline">Missing Agenda</Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}

                    {!issues.documentationIssues?.length && (
                      <div className="text-center py-4 text-muted-foreground">
                        <CheckCircle className="h-6 w-6 mx-auto mb-2 text-success" />
                        <p className="text-sm">All documentation up to date</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quorum Issues */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-destructive" />
                  <span>Quorum Issues</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {issues.quorumIssues?.slice(0, 5).map((meeting: any) => (
                      <Alert key={meeting.id}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{meeting.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {meeting.committees?.name} • {format(new Date(meeting.meeting_date), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <Badge variant="destructive">No Quorum</Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}

                    {!issues.quorumIssues?.length && (
                      <div className="text-center py-4 text-muted-foreground">
                        <CheckCircle className="h-6 w-6 mx-auto mb-2 text-success" />
                        <p className="text-sm">All meetings achieved quorum</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Overdue Actions Alert */}
          {metrics.overdueActionsCount > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{metrics.overdueActionsCount}</strong> action items are overdue and require immediate attention to maintain compliance.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Committee Reports */}
        <TabsContent value="reports" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Committee Compliance Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2 mb-3" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {reportsData?.map((committee: any) => (
                    <div key={committee.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{committee.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {committee.totalMeetings} meetings in last 30 days
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{committee.complianceScore}%</div>
                          <Badge variant={getComplianceColor(committee.complianceScore)}>
                            {getComplianceStatus(committee.complianceScore)}
                          </Badge>
                        </div>
                      </div>
                      
                      <Progress value={committee.complianceScore} className="h-2 mb-3" />
                      
                      {committee.issues.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Issues:</p>
                          {committee.issues.slice(0, 3).map((issue: string, index: number) => (
                            <p key={index} className="text-sm text-destructive">• {issue}</p>
                          ))}
                        </div>
                      )}

                      {committee.issues.length === 0 && (
                        <div className="flex items-center space-x-2 text-sm text-success">
                          <CheckCircle className="h-4 w-4" />
                          <span>No compliance issues detected</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {!reportsData?.length && (
                    <p className="text-center py-8 text-muted-foreground">No committee data available</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}