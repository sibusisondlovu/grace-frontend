import { useOversightMetrics, useCommitteePerformance } from "@/hooks/useOversight";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Eye, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Calendar,
  FileText,
  Target
} from "lucide-react";
import { format } from "date-fns";

export default function Oversight() {
  const { data: oversightData, isLoading: metricsLoading } = useOversightMetrics();
  const { data: performanceData, isLoading: performanceLoading } = useCommitteePerformance();

  const metrics = oversightData?.metrics || {
    totalCommittees: 0,
    totalMeetings: 0,
    quorumRate: 0,
    completionRate: 0,
    complianceRate: 0,
    overdueCount: 0,
    complianceIssueCount: 0
  };

  const getStatusColor = (rate: number) => {
    if (rate >= 80) return "default";
    if (rate >= 60) return "secondary";
    return "destructive";
  };

  const getRiskLevel = (metrics: any): { level: string; color: "destructive" | "secondary" | "default" | "outline" } => {
    const issues = [
      metrics.quorumRate < 70,
      metrics.completionRate < 70,
      metrics.complianceRate < 80,
      metrics.overdueCount > 5
    ].filter(Boolean).length;

    if (issues >= 3) return { level: "High", color: "destructive" };
    if (issues >= 2) return { level: "Medium", color: "secondary" };
    return { level: "Low", color: "default" };
  };

  const riskAssessment = getRiskLevel(metrics);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-header p-6 rounded-lg">
        <div className="flex items-center space-x-3">
          <Eye className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Oversight Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor performance, compliance, and identify risks across all committees
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
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
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Quorum Rate</span>
                </div>
                <div className="text-2xl font-bold">{metrics.quorumRate}%</div>
                <Badge variant={getStatusColor(metrics.quorumRate)}>
                  {metrics.totalMeetings} meetings tracked
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Action Completion</span>
                </div>
                <div className="text-2xl font-bold">{metrics.completionRate}%</div>
                <Badge variant={getStatusColor(metrics.completionRate)}>
                  Tasks on track
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Compliance Rate</span>
                </div>
                <div className="text-2xl font-bold">{metrics.complianceRate}%</div>
                <Badge variant={getStatusColor(metrics.complianceRate)}>
                  Documentation current
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Risk Level</span>
                </div>
                <div className="text-2xl font-bold">{riskAssessment.level}</div>
                <Badge variant={riskAssessment.color}>
                  Overall assessment
                </Badge>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Indicators */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Risk Indicators</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metricsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))
            ) : (
              <>
                {metrics.overdueCount > 0 && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{metrics.overdueCount}</strong> overdue action items require immediate attention
                    </AlertDescription>
                  </Alert>
                )}

                {metrics.complianceIssueCount > 0 && (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{metrics.complianceIssueCount}</strong> meetings have missing documentation
                    </AlertDescription>
                  </Alert>
                )}

                {metrics.quorumRate < 70 && (
                  <Alert>
                    <Users className="h-4 w-4" />
                    <AlertDescription>
                      Low attendance rate: <strong>{metrics.quorumRate}%</strong> of meetings achieved quorum
                    </AlertDescription>
                  </Alert>
                )}

                {metrics.overdueCount === 0 && metrics.complianceIssueCount === 0 && metrics.quorumRate >= 70 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                    <p>No critical risks identified</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Committee Performance */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Committee Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {performanceLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <div className="grid grid-cols-3 gap-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {performanceData?.slice(0, 5).map((committee) => (
                  <div key={committee.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{committee.name}</h4>
                      <Badge variant="outline">{committee.meetingCount} meetings</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Attendance:</span>
                        <span className={`ml-1 font-medium ${
                          committee.attendanceRate >= 80 ? 'text-success' :
                          committee.attendanceRate >= 60 ? 'text-warning' : 'text-destructive'
                        }`}>
                          {committee.attendanceRate}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Actions:</span>
                        <span className={`ml-1 font-medium ${
                          committee.actionCompletionRate >= 80 ? 'text-success' :
                          committee.actionCompletionRate >= 60 ? 'text-warning' : 'text-destructive'
                        }`}>
                          {committee.actionCompletionRate}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tasks:</span>
                        <span className="ml-1 font-medium">{committee.totalActions}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {!performanceData?.length && (
                  <p className="text-center py-4 text-muted-foreground">No committee data available</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-destructive" />
              <span>Overdue Action Items</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {oversightData?.overdueActions?.slice(0, 5).map((action) => (
                  <div key={action.id} className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-sm">{action.title}</h5>
                        <p className="text-xs text-muted-foreground">{action.committees?.name}</p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {action.due_date && format(new Date(action.due_date), 'MMM dd')}
                      </Badge>
                    </div>
                  </div>
                ))}

                {!oversightData?.overdueActions?.length && (
                  <div className="text-center py-4 text-muted-foreground">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2 text-success" />
                    <p className="text-sm">No overdue action items</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Issues */}
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
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {oversightData?.complianceIssues?.slice(0, 5).map((meeting) => (
                  <div key={meeting.id} className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-sm">{meeting.title}</h5>
                        <p className="text-xs text-muted-foreground">{meeting.committees?.name}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Missing agenda
                      </Badge>
                    </div>
                  </div>
                ))}

                {!oversightData?.complianceIssues?.length && (
                  <div className="text-center py-4 text-muted-foreground">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2 text-success" />
                    <p className="text-sm">All documentation up to date</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}