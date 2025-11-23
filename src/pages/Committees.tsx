import { useCommittees, useCreateCommittee } from "@/hooks/useCommittees";
import { Building2, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommitteeCard } from "@/components/dashboard/CommitteeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStickyForm } from "@/hooks/useStickyForm";
import { supabase } from "@/integrations/supabase/client";

export default function Committees() {
  const { data: committees, isLoading } = useCommittees();
  const createCommittee = useCreateCommittee();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const stickyForm = useStickyForm<{
    name: string;
    type: string;
    description: string;
    terms_of_reference: string;
    quorum_percentage: string;
    notice_period_days: string;
    public_access_allowed: string;
    virtual_meetings_allowed: string;
  }>({
    key: 'create-committee',
    defaultValues: {
      name: '',
      type: '',
      description: '',
      terms_of_reference: '',
      quorum_percentage: '50',
      notice_period_days: '5',
      public_access_allowed: 'true',
      virtual_meetings_allowed: 'true'
    }
  });

  const filteredCommittees = committees?.filter((committee) => {
    const matchesSearch = committee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         committee.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || committee.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || committee.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const committeeTypes = Array.from(new Set(committees?.map(c => c.type) || []));

  const handleCreateCommittee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Get user profile to get organization_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();
    
    const committeeData = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      organization_id: profile?.organization_id || '',
      description: formData.get("description") as string || undefined,
      terms_of_reference: formData.get("terms_of_reference") as string || undefined,
      quorum_percentage: parseInt(formData.get("quorum_percentage") as string) || 50,
      notice_period_days: parseInt(formData.get("notice_period_days") as string) || 5,
      status: "active" as const,
      public_access_allowed: formData.get("public_access_allowed") === "true",
      virtual_meetings_allowed: formData.get("virtual_meetings_allowed") === "true",
    };

    createCommittee.mutate(committeeData, {
      onSuccess: () => {
        setIsCreateOpen(false);
        stickyForm.handleSuccess();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span>Committees</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all committees across the City of Johannesburg
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Committee</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Committee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCommittee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Committee Name</Label>
                  <Input 
                    name="name" 
                    placeholder="Enter committee name" 
                    required 
                    {...stickyForm.getFieldProps('name')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Committee Type</Label>
                  <Select name="type" required {...stickyForm.getSelectProps('type')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select committee type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Council">Council</SelectItem>
                      <SelectItem value="Mayoral Committee">Mayoral Committee</SelectItem>
                      <SelectItem value="Section 79">Section 79</SelectItem>
                      <SelectItem value="Section 80">Section 80</SelectItem>
                      <SelectItem value="MPAC">MPAC</SelectItem>
                      <SelectItem value="Portfolio Committee">Portfolio Committee</SelectItem>
                      <SelectItem value="Special Committee">Special Committee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  name="description" 
                  placeholder="Brief description of the committee's purpose" 
                  rows={3} 
                  {...stickyForm.getFieldProps('description')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms_of_reference">Terms of Reference</Label>
                <Textarea 
                  name="terms_of_reference" 
                  placeholder="Detailed terms of reference" 
                  rows={4} 
                  {...stickyForm.getFieldProps('terms_of_reference')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quorum_percentage">Quorum Percentage</Label>
                  <Input 
                    name="quorum_percentage" 
                    type="number" 
                    min="1" 
                    max="100" 
                    {...stickyForm.getFieldProps('quorum_percentage')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notice_period_days">Notice Period (Days)</Label>
                  <Input 
                    name="notice_period_days" 
                    type="number" 
                    min="1" 
                    max="30" 
                    {...stickyForm.getFieldProps('notice_period_days')}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="public_access_allowed">Public Access</Label>
                  <Select name="public_access_allowed" {...stickyForm.getSelectProps('public_access_allowed')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Allow Public Access</SelectItem>
                      <SelectItem value="false">Private Committee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="virtual_meetings_allowed">Virtual Meetings</Label>
                  <Select name="virtual_meetings_allowed" {...stickyForm.getSelectProps('virtual_meetings_allowed')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Allow Virtual Meetings</SelectItem>
                      <SelectItem value="false">Physical Meetings Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateOpen(false);
                  stickyForm.clearForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCommittee.isPending}>
                  {createCommittee.isPending ? "Creating..." : "Create Committee"}
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
                placeholder="Search committees by name or type..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {committeeTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Committee Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Committees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-12" /> : committees?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {isLoading ? <Skeleton className="h-8 w-12" /> : committees?.filter(c => c.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">With Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {isLoading ? <Skeleton className="h-8 w-12" /> : committees?.filter(c => c.next_meeting).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Avg Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {isLoading ? <Skeleton className="h-8 w-12" /> : 
                committees?.length ? 
                  Math.round(committees.reduce((sum, c) => sum + 0, 0) / committees.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Committees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-3 w-1/2 mb-2" />
              <Skeleton className="h-3 w-full mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </Card>
          ))
        ) : filteredCommittees?.length ? (
          filteredCommittees.map((committee) => (
            <CommitteeCard key={committee.id} committee={committee} />
          ))
        ) : committees?.length ? (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground mb-2">No committees found matching your criteria</div>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setTypeFilter("all");
              setStatusFilter("all");
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground mb-4">No committees have been created yet</div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Committee
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}