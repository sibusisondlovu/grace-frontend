import { Outlet, Link, useLocation } from "react-router-dom";
import { Calendar, Plus, Clock, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function MeetingsLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (currentPath.includes('/upcoming')) return 'upcoming';
    if (currentPath.includes('/past')) return 'past';
    if (currentPath.includes('/schedule')) return 'schedule';
    return 'upcoming'; // default
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span>Meetings</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage committee meetings and schedules
          </p>
        </div>
        
        {!currentPath.includes('/schedule') && (
          <Link to="/meetings/schedule">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Schedule Meeting</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Navigation Tabs */}
      {!currentPath.includes('/schedule') && (
        <Card className="p-1">
          <Tabs value={getActiveTab()}>
            <TabsList className="grid w-full grid-cols-2">
              <Link to="/meetings/upcoming">
                <TabsTrigger value="upcoming" className="w-full flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Upcoming</span>
                </TabsTrigger>
              </Link>
              <Link to="/meetings/past">
                <TabsTrigger value="past" className="w-full flex items-center space-x-2">
                  <History className="h-4 w-4" />
                  <span>Past</span>
                </TabsTrigger>
              </Link>
            </TabsList>
          </Tabs>
        </Card>
      )}

      {/* Page Content */}
      <Outlet />
    </div>
  );
}