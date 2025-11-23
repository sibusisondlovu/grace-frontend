import { useMembers, useProfiles, useAddMember, useUpdateMember, useRemoveMember, useUpdateProfile } from "@/hooks/useMembers";
import { useCommittees } from "@/hooks/useCommittees";
import { Users, Plus, Search, Filter, Mail, Phone, Building2, UserCheck, UserX, Edit, Trash2, Crown, Shield, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";

// Validation schema for adding members
const VALID_ROLES = ['chair', 'deputy_chair', 'secretary', 'member'] as const;

const addMemberSchema = z.object({
  user_id: z.string().uuid({ message: "Please select a valid user" }),
  committee_id: z.string().uuid({ message: "Please select a valid committee" }),
  role: z.string().refine((val) => VALID_ROLES.includes(val as any), {
    message: "Please select a valid role"
  }),
  voting_rights: z.boolean(),
  ward_number: z.string().max(50, { message: "Ward number must be less than 50 characters" }).optional(),
  party_affiliation: z.string().max(100, { message: "Party affiliation must be less than 100 characters" }).optional(),
  start_date: z.string().optional(),
});

export default function Members() {
  const { data: members, isLoading } = useMembers();
  const { data: profiles } = useProfiles();
  const { data: committees } = useCommittees();
  const addMember = useAddMember();
  const updateMember = useUpdateMember();
  const removeMember = useRemoveMember();
  const updateProfile = useUpdateProfile();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [committeeFilter, setCommitteeFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  
  // Form state for Add Member dialog
  const [formUserId, setFormUserId] = useState("");
  const [formCommitteeId, setFormCommitteeId] = useState("");
  const [formRole, setFormRole] = useState("member");
  const [formVotingRights, setFormVotingRights] = useState("true");

  const filteredMembers = members?.filter((member) => {
    const memberName = `${member.profile?.first_name || ''} ${member.profile?.last_name || ''}`.toLowerCase();
    const matchesSearch = memberName.includes(searchQuery.toLowerCase()) ||
                         member.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.profile?.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCommittee = committeeFilter === "all" || member.committee_id === committeeFilter;
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesCommittee && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'chair': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'deputy_chair': return <Shield className="h-4 w-4 text-blue-600" />;
      default: return <UserIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'chair': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'deputy_chair': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'secretary': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      // Check required fields first
      if (!formUserId) {
        toast({
          title: "Validation Error",
          description: "Please select a user",
          variant: "destructive",
        });
        return;
      }

      if (!formCommitteeId) {
        toast({
          title: "Validation Error",
          description: "Please select a committee",
          variant: "destructive",
        });
        return;
      }

      // Extract and prepare data - use state values for Select components
      const rawData = {
        user_id: formUserId,
        committee_id: formCommitteeId,
        role: formRole,
        voting_rights: formVotingRights === "true",
        ward_number: formData.get("ward_number") as string || undefined,
        party_affiliation: formData.get("party_affiliation") as string || undefined,
        start_date: formData.get("start_date") as string || undefined,
      };

      // Validate input data
      const validatedData = addMemberSchema.parse(rawData);

      // Additional validation: Check if assigning leadership roles
      if (['chair', 'deputy_chair'].includes(validatedData.role)) {
        const selectedCommittee = committees?.find(c => c.id === validatedData.committee_id);
        
        // Check if leadership position is already filled
        if (validatedData.role === 'chair' && selectedCommittee?.chair_id) {
          toast({
            title: "Warning",
            description: "This committee already has a chairperson. Please update the committee first.",
            variant: "destructive",
          });
          return;
        }
        
        if (validatedData.role === 'deputy_chair' && selectedCommittee?.deputy_chair_id) {
          toast({
            title: "Warning",
            description: "This committee already has a deputy chairperson. Please update the committee first.",
            variant: "destructive",
          });
          return;
        }
      }

      // Clean empty optional fields
      const cleanedData = {
        ...validatedData,
        ward_number: validatedData.ward_number?.trim() || undefined,
        party_affiliation: validatedData.party_affiliation?.trim() || undefined,
      };

      addMember.mutate(cleanedData, {
        onSuccess: () => {
          setIsAddOpen(false);
          (e.target as HTMLFormElement).reset();
          // Reset form state
          setFormUserId("");
          setFormCommitteeId("");
          setFormRole("member");
          setFormVotingRights("true");
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.issues[0]?.message || "Invalid input data",
          variant: "destructive",
        });
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const handleUpdateMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMember) return;

    const formData = new FormData(e.currentTarget);
    
    const updates = {
      role: formData.get("role") as string,
      voting_rights: formData.get("voting_rights") === "true",
      ward_number: formData.get("ward_number") as string || undefined,
      party_affiliation: formData.get("party_affiliation") as string || undefined,
      end_date: formData.get("end_date") as string || undefined,
    };

    updateMember.mutate({ id: selectedMember.id, ...updates }, {
      onSuccess: () => {
        setSelectedMember(null);
      }
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProfile) return;

    const formData = new FormData(e.currentTarget);
    
    const updates = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string || undefined,
      department: formData.get("department") as string || undefined,
      job_title: formData.get("job_title") as string || undefined,
    };

    updateProfile.mutate({ id: selectedProfile.id, ...updates }, {
      onSuccess: () => {
        setSelectedProfile(null);
      }
    });
  };

  const activeMembersCount = members?.filter(m => !m.end_date || new Date(m.end_date) > new Date()).length || 0;
  const chairpersonsCount = members?.filter(m => m.role === 'chair').length || 0;
  const votingMembersCount = members?.filter(m => m.voting_rights && (!m.end_date || new Date(m.end_date) > new Date())).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Users className="h-6 w-6 text-primary" />
            <span>Members</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage committee members and their roles
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            // Reset form when dialog closes
            setFormUserId("");
            setFormCommitteeId("");
            setFormRole("member");
            setFormVotingRights("true");
          }
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Member</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-background border z-50">
            <DialogHeader>
              <DialogTitle>Add Committee Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user_id">Select User *</Label>
                <Select value={formUserId} onValueChange={setFormUserId} required>
                  <SelectTrigger className="bg-background border z-40">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {profiles?.map((profile) => (
                      <SelectItem key={profile.user_id} value={profile.user_id}>
                        {profile.first_name && profile.last_name 
                          ? `${profile.first_name} ${profile.last_name} (${profile.email})`
                          : profile.email || 'Unknown User'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="committee_id">Committee *</Label>
                <Select value={formCommitteeId} onValueChange={setFormCommitteeId} required>
                  <SelectTrigger className="bg-background border z-40">
                    <SelectValue placeholder="Select a committee" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {committees?.map((committee) => (
                      <SelectItem key={committee.id} value={committee.id}>
                        {committee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formRole} onValueChange={setFormRole}>
                    <SelectTrigger className="bg-background border z-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="chair">Chairperson</SelectItem>
                      <SelectItem value="deputy_chair">Deputy Chair</SelectItem>
                      <SelectItem value="secretary">Secretary</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voting_rights">Voting Rights</Label>
                  <Select value={formVotingRights} onValueChange={setFormVotingRights}>
                    <SelectTrigger className="bg-background border z-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="true">Voting Member</SelectItem>
                      <SelectItem value="false">Non-voting Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
               <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ward_number">Ward Number (Optional)</Label>
                  <Input 
                    name="ward_number" 
                    placeholder="e.g., Ward 1" 
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="party_affiliation">Party Affiliation (Optional)</Label>
                  <Input 
                    name="party_affiliation" 
                    placeholder="e.g., ANC, DA, EFF"
                    maxLength={100}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input name="start_date" type="date" />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addMember.isPending || !formUserId || !formCommitteeId}
                >
                  {addMember.isPending ? "Adding..." : "Add Member"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search members by name, email, or department..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={committeeFilter} onValueChange={setCommitteeFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-background border z-30">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Committee" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-40">
                <SelectItem value="all">All Committees</SelectItem>
                {committees?.map((committee) => (
                  <SelectItem key={committee.id} value={committee.id}>
                    {committee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-32 bg-background border z-30">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-40">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="chair">Chair</SelectItem>
                <SelectItem value="deputy_chair">Deputy Chair</SelectItem>
                <SelectItem value="secretary">Secretary</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-12" /> : members?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {isLoading ? <Skeleton className="h-8 w-12" /> : activeMembersCount}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Chairpersons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {isLoading ? <Skeleton className="h-8 w-12" /> : chairpersonsCount}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Voting Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {isLoading ? <Skeleton className="h-8 w-12" /> : votingMembersCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">Committee Members</TabsTrigger>
          <TabsTrigger value="profiles">All Profiles</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </Card>
            ))
          ) : filteredMembers?.length ? (
            filteredMembers.map((member) => (
              <Card key={member.id} className="shadow-card hover:shadow-primary transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.profile?.avatar_url} alt="Member" />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {member.profile?.first_name?.[0]}{member.profile?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">
                            {member.profile?.first_name} {member.profile?.last_name}
                          </h3>
                          {getRoleIcon(member.role)}
                          <Badge className={getRoleColor(member.role)}>
                            {member.role.replace('_', ' ')}
                          </Badge>
                          {member.voting_rights ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Voting
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              <UserX className="h-3 w-3 mr-1" />
                              Non-voting
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Building2 className="h-4 w-4" />
                            <span>{member.committee?.name}</span>
                          </div>
                          {member.profile?.email && (
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{member.profile.email}</span>
                            </div>
                          )}
                          {member.profile?.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{member.profile.phone}</span>
                            </div>
                          )}
                          {member.ward_number && (
                            <span className="bg-muted px-2 py-1 rounded text-xs">
                              {member.ward_number}
                            </span>
                          )}
                          {member.party_affiliation && (
                            <span className="bg-muted px-2 py-1 rounded text-xs">
                              {member.party_affiliation}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMember(member)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-background border">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {member.profile?.first_name} {member.profile?.last_name} from {member.committee?.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeMember.mutate(member.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove Member
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground mb-4">No members found matching your criteria</div>
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Member
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          {profiles?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <Card key={profile.id} className="shadow-card hover:shadow-primary transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.avatar_url} alt="Profile" />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {profile.first_name?.[0]}{profile.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {profile.first_name} {profile.last_name}
                        </h3>
                        {profile.job_title && (
                          <p className="text-sm text-muted-foreground">{profile.job_title}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      {profile.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.email}</span>
                        </div>
                      )}
                      {profile.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                      {profile.department && (
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.department}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedProfile(profile)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground">No user profiles found</div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Member Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="sm:max-w-[500px] bg-background border z-50">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <form onSubmit={handleUpdateMember} className="space-y-4">
              <div className="space-y-2">
                <Label>Member</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedMember.profile?.first_name} {selectedMember.profile?.last_name} - {selectedMember.committee?.name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" defaultValue={selectedMember.role}>
                    <SelectTrigger className="bg-background border z-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="chair">Chairperson</SelectItem>
                      <SelectItem value="deputy_chair">Deputy Chair</SelectItem>
                      <SelectItem value="secretary">Secretary</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voting_rights">Voting Rights</Label>
                  <Select name="voting_rights" defaultValue={selectedMember.voting_rights.toString()}>
                    <SelectTrigger className="bg-background border z-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="true">Voting Member</SelectItem>
                      <SelectItem value="false">Non-voting Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ward_number">Ward Number</Label>
                  <Input name="ward_number" defaultValue={selectedMember.ward_number || ""} placeholder="e.g., Ward 1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="party_affiliation">Party Affiliation</Label>
                  <Input name="party_affiliation" defaultValue={selectedMember.party_affiliation || ""} placeholder="e.g., ANC, DA, EFF" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date (Leave empty if active)</Label>
                <Input name="end_date" type="date" defaultValue={selectedMember.end_date || ""} />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setSelectedMember(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMember.isPending}>
                  {updateMember.isPending ? "Updating..." : "Update Member"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="sm:max-w-[500px] bg-background border z-50">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input name="first_name" defaultValue={selectedProfile.first_name || ""} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input name="last_name" defaultValue={selectedProfile.last_name || ""} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input name="email" type="email" defaultValue={selectedProfile.email || ""} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input name="phone" defaultValue={selectedProfile.phone || ""} placeholder="+27 xxx xxx xxxx" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input name="job_title" defaultValue={selectedProfile.job_title || ""} placeholder="e.g., Councillor" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input name="department" defaultValue={selectedProfile.department || ""} placeholder="e.g., Finance" />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setSelectedProfile(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}