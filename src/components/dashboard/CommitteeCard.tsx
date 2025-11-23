import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, FileText, Clock } from "lucide-react";
import { Committee } from "@/hooks/useCommittees";
import { Link } from "react-router-dom";

interface CommitteeCardProps {
  committee: Committee;
}

export function CommitteeCard({ committee }: CommitteeCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success text-success-foreground";
      case "inactive":
        return "bg-muted text-muted-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Use fallback values for optional fields
  const memberCount = committee.member_count || 0;
  const nextMeeting = committee.next_meeting || 'No meetings scheduled';
  const agendaItems = 0;

  return (
    <Card className="shadow-card hover:shadow-primary transition-all duration-300 hover:scale-105">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{committee.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{committee.type}</p>
          </div>
          <Badge className={getStatusColor(committee.status)}>
            {committee.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{memberCount} members</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{agendaItems} items</span>
          </div>
        </div>
        
        {nextMeeting && (
          <div className="flex items-center space-x-2 text-sm bg-primary-light p-3 rounded-md">
            <Calendar className="h-4 w-4 text-primary" />
            <div>
              <p className="font-medium text-primary">Next Meeting</p>
              <p className="text-primary/80">{nextMeeting}</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex space-x-2">
        <Link to={`/committees/${committee.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            View Details
          </Button>
        </Link>
        <Link to={`/committees/${committee.id}`} className="flex-1">
          <Button size="sm" className="w-full">
            Manage
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}