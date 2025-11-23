import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useMotions } from '@/hooks/useMotions';
import { NewMotionDialog } from '@/components/motions/NewMotionDialog';
import { format } from 'date-fns';

export default function Motions() {
  const { data: motions, isLoading } = useMotions();
  const [isNewMotionOpen, setIsNewMotionOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'adopted':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'withdrawn':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Motions</h1>
            <p className="text-muted-foreground">
              Manage committee motions and resolutions
            </p>
          </div>
          <Button onClick={() => setIsNewMotionOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Submit Motion
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading motions...</div>
        ) : (
          <div className="grid gap-4">
            {motions?.map((motion) => (
              <Card key={motion.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {motion.motion_number}: {motion.title}
                      </CardTitle>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>Type: {motion.motion_type}</span>
                        <span>•</span>
                        <span>{motion.committee?.name}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getStatusColor(motion.status)}>
                        {motion.status}
                      </Badge>
                      <Badge variant="outline">
                        {motion.admissibility_status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Motion Text:</p>
                    <p className="text-sm text-muted-foreground">
                      {motion.motion_text}
                    </p>
                  </div>

                  {motion.admissibility_notes && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-1">Admissibility Notes:</p>
                      <p className="text-sm text-muted-foreground">
                        {motion.admissibility_notes}
                      </p>
                    </div>
                  )}

                  {motion.outcome && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-1">Outcome:</p>
                      <p className="text-sm text-muted-foreground">
                        {motion.outcome}
                      </p>
                      {motion.outcome_notes && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {motion.outcome_notes}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>
                      Notice Date: {format(new Date(motion.notice_date), 'PPP')}
                    </span>
                    <span>{motion.committee?.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <NewMotionDialog 
          open={isNewMotionOpen} 
          onOpenChange={setIsNewMotionOpen} 
        />
      </div>
    </Layout>
  );
}
