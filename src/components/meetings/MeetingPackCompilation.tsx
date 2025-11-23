import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Package, CheckCircle, AlertCircle } from "lucide-react";
import { useMeetingPacks, useCreateMeetingPack, useUpdateMeetingPack } from "@/hooks/useMeetingPacks";
import { useAuth } from "@/hooks/useAuth";
import { useCanCompilePacks } from "@/hooks/useUserRole";
import { format } from "date-fns";

interface MeetingPackCompilationProps {
  meetingId: string;
}

export const MeetingPackCompilation = ({ meetingId }: MeetingPackCompilationProps) => {
  const { user } = useAuth();
  const { hasRole: canCompile } = useCanCompilePacks();
  const { data: packs = [] } = useMeetingPacks(meetingId);
  const createPack = useCreateMeetingPack();
  const updatePack = useUpdateMeetingPack();

  const handleCreatePack = () => {
    const latestVersion = packs.length > 0 ? Math.max(...packs.map(p => p.version_number)) : 0;
    createPack.mutate({
      meeting_id: meetingId,
      version_number: latestVersion + 1,
      pack_status: 'draft',
      compiled_by: user?.id,
      metadata: {},
      distribution_list: [],
      restricted: false,
      signature_routing: [],
    });
  };

  const handleCompilePack = (packId: string) => {
    updatePack.mutate({
      id: packId,
      pack_status: 'compiled',
      compiled_at: new Date().toISOString(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'compiled': return 'default';
      case 'distributed': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Meeting Pack Compilation
          </CardTitle>
          {canCompile && (
            <Button onClick={handleCreatePack} disabled={createPack.isPending}>
              <FileText className="h-4 w-4 mr-2" />
              New Pack Version
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {packs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No meeting packs created yet.</p>
          ) : (
            packs.map((pack) => (
              <div key={pack.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Version {pack.version_number}</h4>
                    <Badge variant={getStatusColor(pack.pack_status)}>
                      {pack.pack_status}
                    </Badge>
                    {pack.restricted && (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Restricted
                      </Badge>
                    )}
                  </div>
                  {pack.pack_status === 'draft' && canCompile && (
                    <Button 
                      size="sm" 
                      onClick={() => handleCompilePack(pack.id)}
                      disabled={updatePack.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Compile Pack
                    </Button>
                  )}
                </div>
                {pack.compiled_at && (
                  <p className="text-sm text-muted-foreground">
                    Compiled: {format(new Date(pack.compiled_at), 'PPp')}
                  </p>
                )}
                {pack.distribution_list && pack.distribution_list.length > 0 && (
                  <p className="text-sm">
                    Distribution: {pack.distribution_list.length} recipients
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
