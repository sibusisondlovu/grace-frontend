import { Info, Users, Building2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { useStats } from "@/hooks/useStats";
import { useUsers } from "@/hooks/useUsers";
import { useSubscription } from "@/hooks/useSubscriptions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function OrganizationStats() {
  const { selectedOrganizationId, isSuperAdmin } = useOrganizationContext();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: subscription, isLoading: subLoading } = useSubscription(selectedOrganizationId || '');

  if (!isSuperAdmin || !selectedOrganizationId) return null;

  const isLoading = statsLoading || usersLoading || subLoading;

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-primary text-primary-foreground';
      case 'premium':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getTierIcon = (tier?: string) => {
    if (tier === 'enterprise' || tier === 'premium') {
      return <Crown className="h-3 w-3" />;
    }
    return null;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Info className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-3">Organization Overview</h4>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* User Count */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-background">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                    <p className="text-lg font-semibold">{users?.length || 0}</p>
                  </div>
                </div>
              </div>

              {/* Active Committees */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-background">
                    <Building2 className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active Committees</p>
                    <p className="text-lg font-semibold">{stats?.totalCommittees || 0}</p>
                  </div>
                </div>
              </div>

              {/* Subscription Tier */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 rounded-md bg-background">
                    <Crown className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Subscription Tier</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getTierColor(subscription?.tier)}>
                        <span className="flex items-center gap-1">
                          {getTierIcon(subscription?.tier)}
                          {subscription?.tier?.toUpperCase() || 'N/A'}
                        </span>
                      </Badge>
                      {subscription?.status && (
                        <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                          {subscription.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
