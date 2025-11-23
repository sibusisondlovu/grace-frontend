import { Globe, Calendar, FileText, Eye, Download, Search, Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicMeetings, useUpcomingPublicMeetings, useRecentPublicMeetings } from "@/hooks/usePublicMeetings";
import { PublicMeetingActions } from "@/components/meetings/PublicMeetingActions";
import { format } from "date-fns";

const recentMeetings = [
  {
    id: "1",
    title: "Council Meeting - Budget Review",
    committee: "Council",
    date: "December 12, 2025",
    time: "10:00 AM",
    status: "Completed",
    documentsCount: 8,
    livestreamViews: 1250
  },
  {
    id: "2", 
    title: "MPAC - Financial Oversight",
    committee: "MPAC",
    date: "December 10, 2025",
    time: "2:00 PM",
    status: "Completed",
    documentsCount: 12,
    livestreamViews: 480
  },
  {
    id: "3",
    title: "Infrastructure Committee - Road Maintenance",
    committee: "Infrastructure Committee",
    date: "December 15, 2025",
    time: "9:00 AM", 
    status: "Upcoming",
    documentsCount: 5,
    livestreamViews: 0
  }
];

const publications = [
  {
    title: "Annual Financial Statements 2024-25",
    type: "Financial Report",
    date: "December 1, 2025",
    size: "2.4 MB",
    downloads: 340
  },
  {
    title: "MPAC Oversight Report - Q3 2025",
    type: "Oversight Report", 
    date: "November 28, 2025",
    size: "1.8 MB",
    downloads: 156
  },
  {
    title: "Infrastructure Budget Allocation",
    type: "Budget Document",
    date: "November 25, 2025",
    size: "980 KB",
    downloads: 89
  }
];

export default function PublicPortal() {
  const { data: upcomingMeetings, isLoading: loadingUpcoming } = useUpcomingPublicMeetings();
  const { data: recentMeetings, isLoading: loadingRecent } = useRecentPublicMeetings();
  
  // Combine recent and upcoming meetings for display
  const allMeetings = [
    ...(upcomingMeetings || []),
    ...(recentMeetings || [])
  ].sort((a, b) => new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime());

  const isLoading = loadingUpcoming || loadingRecent;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatMeetingDate = (dateTime: string) => {
    return format(new Date(dateTime), 'EEEE, MMMM d, yyyy');
  };

  const formatMeetingTime = (dateTime: string) => {
    return format(new Date(dateTime), 'h:mm a');
  };
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-primary text-primary-foreground p-8 rounded-lg">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-4 flex items-center space-x-3">
            <Globe className="h-8 w-8" />
            <span>Public Transparency Portal</span>
          </h1>
          <p className="text-lg text-primary-foreground/90 mb-6">
            Access committee meetings, agendas, minutes, and reports from the City of Johannesburg. 
            Promoting transparency and public participation in municipal governance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search meetings, documents, committees..."
                className="pl-10 bg-white/10 border-white/20 text-primary-foreground placeholder-primary-foreground/60"
              />
            </div>
            <Button variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Advanced Search
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Public Meetings</p>
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-muted-foreground">This year</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold">2,340</p>
                <p className="text-xs text-muted-foreground">Available online</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Livestream Views</p>
                <p className="text-2xl font-bold">45.2K</p>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Downloads</p>
                <p className="text-2xl font-bold">12.8K</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
              <Download className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Meetings */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Recent & Upcoming Meetings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <div className="flex space-x-2 mb-3">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                ))
              ) : allMeetings.length > 0 ? (
                allMeetings.map((meeting) => {
                  const isUpcoming = new Date(meeting.meeting_date) > new Date();
                  return (
                    <div key={meeting.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{meeting.title}</h3>
                        <Badge className={getStatusColor(meeting.status)}>
                          {isUpcoming ? 'Upcoming' : 'Completed'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{meeting.committee?.name}</span>
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatMeetingDate(meeting.meeting_date)} at {formatMeetingTime(meeting.meeting_date)}</span>
                        </div>
                        {meeting.venue && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{meeting.venue}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          {meeting.agenda_published && (
                            <Badge variant="outline" className="text-xs">Agenda Available</Badge>
                          )}
                          {meeting.minutes_published && (
                            <Badge variant="outline" className="text-xs">Minutes Available</Badge>
                          )}
                        </div>
                      </div>
                      
                      <PublicMeetingActions meeting={meeting} />
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <div>No public meetings available</div>
                </div>
              )}
              
              <div className="text-center pt-4">
                <Button variant="outline">View All Meetings</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Publications */}
        <div>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Recent Publications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {publications.map((doc, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <h4 className="font-medium text-sm mb-1">{doc.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{doc.type}</p>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                    <span>{doc.date}</span>
                    <span>{doc.size}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{doc.downloads} downloads</span>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="text-center pt-2">
                <Button variant="outline" size="sm">View All Documents</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transparency Notice */}
      <Card className="border-accent/20 bg-accent-light">
        <CardContent className="p-6">
          <h3 className="font-semibold text-accent-foreground mb-2">Commitment to Transparency</h3>
          <p className="text-sm text-accent-foreground/80">
            The City of Johannesburg is committed to open governance and public transparency. 
            All committee meetings, agendas, and decisions are made available to the public in accordance with 
            PAIA (Promotion of Access to Information Act) and municipal transparency requirements.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}