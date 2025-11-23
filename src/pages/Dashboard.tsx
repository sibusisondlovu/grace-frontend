import { useStats } from "@/hooks/useStats";
import { useActions } from "@/hooks/useActions";
import { useCommittees } from "@/hooks/useCommittees";
import { useUpcomingMeetings } from "@/hooks/useMeetings";
import { useProductTour } from "@/hooks/useProductTour";
import { useEffect } from "react";
import { Building2, Calendar, Users, CheckSquare, AlertTriangle, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CommitteeCard } from "@/components/dashboard/CommitteeCard";
import { ActionItem } from "@/components/dashboard/ActionItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import dashboardHero from "@/assets/dashboard-hero.jpg";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: actions, isLoading: actionsLoading } = useActions();
  const { data: committees, isLoading: committeesLoading } = useCommittees();
  const { data: upcomingMeetings, isLoading: meetingsLoading } = useUpcomingMeetings();
  const { startTour } = useProductTour();

  // Check if user should see the tour
  useEffect(() => {
    const shouldShowTour = localStorage.getItem('show-product-tour');
    if (shouldShowTour === 'true') {
      localStorage.removeItem('show-product-tour');
      // Give time for the page to fully render
      setTimeout(() => {
        startTour();
      }, 1000);
    }
  }, [startTour]);

  const statsData = [
    {
      title: "Active Committees",
      value: stats?.totalCommittees || 0,
      description: "Across all committee types",
      icon: Building2,
      trend: { value: 8, label: "from last month", isPositive: true }
    },
    {
      title: "Upcoming Meetings",
      value: upcomingMeetings?.length || 0,
      description: "Next 30 days",
      icon: Calendar,
      trend: { value: 4, label: "from last week", isPositive: true }
    },
    {
      title: "Total Actions",
      value: stats?.totalActions || 0,
      description: "Action items tracked",
      icon: CheckSquare,
      trend: { value: 2, label: "new this month", isPositive: true }
    },
    {
      title: "Pending Actions",
      value: stats?.pendingActions || 0,
      description: "Require attention",
      icon: AlertTriangle,
      trend: { value: 12, label: "reduced from last week", isPositive: true }
    }
  ];

  return (
    <div className="space-y-6" data-tour="dashboard">
      {/* Page Header */}
      <div className="relative bg-gradient-header p-6 rounded-lg overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src={dashboardHero} 
            alt="City of Johannesburg Government Building" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            GRACE
          </h1>
          <p className="text-muted-foreground">
            Government Reporting And Committee Execution - City of Johannesburg
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-3 w-full" />
            </Card>
          ))
        ) : (
          statsData.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Committees */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span>Recent Committee Activity</span>
              </CardTitle>
              <Link to="/committees">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {committeesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </Card>
                ))
              ) : committees?.slice(0, 3).map((committee) => (
                <CommitteeCard key={committee.id} committee={committee} />
              )) || (
                <p className="text-muted-foreground text-center py-4">No committees found</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Items */}
        <div>
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                <span>Action Items</span>
              </CardTitle>
              <Link to="/actions">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {actionsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </Card>
                ))
              ) : actions?.slice(0, 3).map((action) => (
                <ActionItem key={action.id} action={action} />
              )) || (
                <p className="text-muted-foreground text-center py-4">No action items found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/meetings">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 w-full">
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Schedule Meeting</span>
              </Button>
            </Link>
            <Link to="/agendas">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 w-full">
                <FileText className="h-6 w-6" />
                <span className="text-sm">Create Agenda</span>
              </Button>
            </Link>
            <Link to="/members">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 w-full">
                <Users className="h-6 w-6" />
                <span className="text-sm">Add Member</span>
              </Button>
            </Link>
            <Link to="/committees">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 w-full">
                <Building2 className="h-6 w-6" />
                <span className="text-sm">New Committee</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}