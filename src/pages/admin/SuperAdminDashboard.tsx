import { Layout } from "@/components/layout/Layout";
import { useHasRole } from "@/hooks/useUserRole";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Building2, Users, Calendar, FileText, TrendingUp, AlertCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { ActivityLogTable } from "@/components/admin/ActivityLogTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditLogFilters, AuditLogFilterState } from "@/components/admin/AuditLogFilters";
import { useState } from "react";
import { exportAuditLogsToCSV, exportAuditLogsToPDF } from "@/lib/exportUtils";
import { toast } from "sonner";

export default function SuperAdminDashboard() {
  const { hasRole: isSuperAdmin, isLoading: roleLoading } = useHasRole('super_admin');
  const { data: organizations, isLoading: orgsLoading } = useOrganizations();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<AuditLogFilterState>({
    startDate: undefined,
    endDate: undefined,
    userId: "all",
    actionType: "all",
    organizationId: "all",
    tableName: "all",
  });

  const { data: auditLogs, isLoading: logsLoading } = useAuditLogs(500, {
    startDate: filters.startDate,
    endDate: filters.endDate,
    userId: filters.userId !== "all" ? filters.userId : undefined,
    actionType: filters.actionType !== "all" ? filters.actionType : undefined,
    organizationId: filters.organizationId !== "all" ? filters.organizationId : undefined,
    tableName: filters.tableName !== "all" ? filters.tableName : undefined,
  });

  const handleExportCSV = () => {
    if (!auditLogs || auditLogs.length === 0) {
      toast.error("No logs to export");
      return;
    }
    exportAuditLogsToCSV(auditLogs);
    toast.success("Audit logs exported to CSV");
  };

  const handleExportPDF = () => {
    if (!auditLogs || auditLogs.length === 0) {
      toast.error("No logs to export");
      return;
    }
    exportAuditLogsToPDF(auditLogs);
    toast.success("Audit logs exported to PDF");
  };

  // Fetch system-wide analytics
  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalCommittees },
        { count: totalMeetings },
        { count: totalActions },
        { data: subscriptions }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('committees').select('*', { count: 'exact', head: true }),
        supabase.from('meetings').select('*', { count: 'exact', head: true }),
        supabase.from('action_items').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*')
      ]);

      return {
        totalUsers: totalUsers || 0,
        totalCommittees: totalCommittees || 0,
        totalMeetings: totalMeetings || 0,
        totalActions: totalActions || 0,
        activeSubscriptions: subscriptions?.filter(s => s.status === 'active').length || 0,
        totalRevenue: subscriptions?.reduce((sum, s) => sum + Number(s.monthly_price || 0), 0) || 0,
      };
    },
    enabled: isSuperAdmin,
  });

  if (roleLoading || orgsLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>You don't have permission to access this page.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const activeOrgs = organizations?.filter(o => o.is_active) || [];
  const trialOrgs = organizations?.filter(o => o.subscription_status === 'trial') || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'suspended': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-primary text-primary-foreground';
      case 'premium': return 'bg-accent text-accent-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">System-wide analytics and organization management</p>
          </div>
          <Button onClick={() => navigate('/admin/organizations')}>
            Manage Organizations
          </Button>
        </div>

        {/* System-wide Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Organizations"
            value={organizations?.length || 0}
            description={`${activeOrgs.length} active, ${trialOrgs.length} on trial`}
            icon={Building2}
          />
          <StatsCard
            title="Total Users"
            value={systemStats?.totalUsers || 0}
            description="Across all organizations"
            icon={Users}
          />
          <StatsCard
            title="Active Committees"
            value={systemStats?.totalCommittees || 0}
            description="System-wide committees"
            icon={Calendar}
          />
          <StatsCard
            title="Active Subscriptions"
            value={systemStats?.activeSubscriptions || 0}
            description={`R${systemStats?.totalRevenue.toFixed(2)} MRR`}
            icon={TrendingUp}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="organizations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organizations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Organizations Overview</CardTitle>
                <CardDescription>Manage all municipalities and their subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations?.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{org.name}</p>
                            <p className="text-xs text-muted-foreground">{org.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(org.subscription_status)}>
                          {org.subscription_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTierColor(org.subscription_tier)}>
                          {org.subscription_tier.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{org.domain || '—'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{org.contact_email || '—'}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/admin/organizations')}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
              </CardContent>
            </Card>

            {/* Quick Actions and System Health */}
            <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/admin/organizations')}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Add New Organization
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/admin/users')}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                disabled
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate System Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Monitor platform performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database Status</span>
                <Badge variant="default">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Meetings</span>
                <span className="font-semibold">{systemStats?.totalMeetings || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Action Items</span>
                <span className="font-semibold">{systemStats?.totalActions || 0}</span>
              </div>
            </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Real-Time Activity Logs
                    </CardTitle>
                    <CardDescription>
                      System-wide audit trail showing all user actions and data changes
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="animate-pulse">
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <AuditLogFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onExportCSV={handleExportCSV}
                  onExportPDF={handleExportPDF}
                />
                <ActivityLogTable logs={auditLogs} isLoading={logsLoading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
