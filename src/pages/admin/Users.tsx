import { useState } from "react";
import { useHasRole } from "@/hooks/useUserRole";
import { useUsers, useUpdateUserProfile } from "@/hooks/useUsers";
import { useUserRoles, useAssignRole, useRemoveRole } from "@/hooks/useUserRoleManagement";
import { useOrganizations } from "@/hooks/useOrganizations";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Users as UsersIcon, Shield, Building2, Mail, Briefcase, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { AppRole } from "@/hooks/useUserRole";

const AVAILABLE_ROLES: AppRole[] = [
  'admin',
  'coordinator',
  'clerk',
  'cfo',
  'legal',
  'chair',
  'deputy_chair',
  'member',
  'external_member',
];

export default function Users() {
  const { hasRole: isSuperAdmin } = useHasRole('super_admin');
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: organizations } = useOrganizations();
  const updateUserProfile = useUpdateUserProfile();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<AppRole | ''>('');

  const { data: userRoles } = useUserRoles(selectedUserId || undefined);

  if (!isSuperAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Access denied. Super admin privileges required.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const handleManageUser = (userId: string) => {
    setSelectedUserId(userId);
    setIsManageDialogOpen(true);
    setSelectedRole('');
  };

  const handleUpdateOrganization = async (userId: string, profileId: string) => {
    if (!selectedOrgId) {
      toast.error('Please select an organization');
      return;
    }

    await updateUserProfile.mutateAsync({
      id: profileId,
      organization_id: selectedOrgId,
    });
    setSelectedOrgId('');
  };

  const handleAssignRole = async (userId: string) => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    await assignRole.mutateAsync({
      userId,
      role: selectedRole,
    });
    setSelectedRole('');
  };

  const handleRemoveRole = async (roleId: string) => {
    if (confirm('Are you sure you want to remove this role?')) {
      await removeRole.mutateAsync(roleId);
    }
  };

  const getRoleBadgeColor = (role: AppRole) => {
    const colorMap: Record<AppRole, string> = {
      super_admin: 'bg-red-500',
      admin: 'bg-orange-500',
      coordinator: 'bg-purple-500',
      clerk: 'bg-blue-500',
      cfo: 'bg-green-500',
      legal: 'bg-yellow-500',
      chair: 'bg-indigo-500',
      deputy_chair: 'bg-pink-500',
      member: 'bg-gray-500',
      external_member: 'bg-slate-500',
      speaker: 'bg-cyan-500',
      whip: 'bg-teal-500',
      public: 'bg-zinc-500',
    };
    return colorMap[role] || 'bg-gray-500';
  };

  const selectedUser = users?.find(u => u.user_id === selectedUserId);

  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage user organizations and role assignments
            </p>
          </div>
        </div>

        {usersLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {users?.map((user) => {
              const org = organizations?.find(o => o.id === user.organization_id);
              return (
                <Card key={user.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UsersIcon className="h-5 w-5" />
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : 'Unnamed User'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user.email || 'No email'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{org?.name || 'No organization'}</span>
                      </div>
                      {user.job_title && (
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{user.job_title}</span>
                        </div>
                      )}
                      {user.department && (
                        <div className="text-sm text-muted-foreground">
                          Department: {user.department}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => handleManageUser(user.user_id)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Manage Roles & Org
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Manage User Dialog */}
        <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage User</DialogTitle>
              <DialogDescription>
                {selectedUser?.first_name && selectedUser?.last_name
                  ? `${selectedUser.first_name} ${selectedUser.last_name}`
                  : selectedUser?.email || 'User'}{' '}
                - Assign roles and change organization
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Organization Assignment */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Organization</Label>
                <p className="text-sm text-muted-foreground">
                  Current: {organizations?.find(o => o.id === selectedUser?.organization_id)?.name || 'None'}
                </p>
                <div className="flex gap-2">
                  <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations?.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => selectedUser && handleUpdateOrganization(selectedUser.user_id, selectedUser.id)}
                    disabled={!selectedOrgId || updateUserProfile.isPending}
                  >
                    Update
                  </Button>
                </div>
              </div>

              {/* Current Roles */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Current Roles</Label>
                {userRoles && userRoles.length > 0 ? (
                  <div className="space-y-2">
                    {userRoles.map((roleAssignment) => (
                      <div
                        key={roleAssignment.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <Badge className={getRoleBadgeColor(roleAssignment.role)}>
                          {roleAssignment.role.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRole(roleAssignment.id)}
                          disabled={removeRole.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No roles assigned</p>
                )}
              </div>

              {/* Assign New Role */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Assign New Role</Label>
                <div className="flex gap-2">
                  <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => selectedUserId && handleAssignRole(selectedUserId)}
                    disabled={!selectedRole || assignRole.isPending}
                  >
                    Assign
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
