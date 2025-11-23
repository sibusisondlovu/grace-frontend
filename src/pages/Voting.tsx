import { useVotingProposals, useVoteRecords, useCreateProposal, useCastVote, useCloseProposal } from "@/hooks/useVoting";
import { useCommittees } from "@/hooks/useCommittees";
import { useAuth } from "@/hooks/useAuth";
import { Vote, Plus, Search, Filter, Clock, Users, CheckCircle, XCircle, MinusCircle, Eye, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function Voting() {
  const { user } = useAuth();
  const { data: proposals, isLoading } = useVotingProposals();
  const { data: committees } = useCommittees();
  const createProposal = useCreateProposal();
  const castVote = useCastVote();
  const closeProposal = useCloseProposal();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [committeeFilter, setCommitteeFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);

  const filteredProposals = proposals?.filter((proposal) => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || proposal.status === statusFilter;
    const matchesCommittee = committeeFilter === "all" || proposal.committee_id === committeeFilter;
    return matchesSearch && matchesStatus && matchesCommittee;
  });

  const activeProposals = proposals?.filter(p => p.status === 'open') || [];
  const closedProposals = proposals?.filter(p => p.status === 'closed') || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getVoteColor = (choice: string) => {
    switch (choice) {
      case 'yes': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'no': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'abstain': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleCreateProposal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const proposalData = {
      committee_id: formData.get("committee_id") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string || undefined,
      proposal_type: formData.get("proposal_type") as string,
      proposed_by_id: user?.id as string,
      voting_method: formData.get("voting_method") as string,
      required_majority: parseFloat(formData.get("required_majority") as string) || 0.5,
      quorum_required: parseInt(formData.get("quorum_required") as string) || undefined,
      voting_start_time: new Date().toISOString(),
      voting_end_time: formData.get("voting_end_time") ? 
        new Date(formData.get("voting_end_time") as string).toISOString() : undefined,
      status: "open" as const,
    };

    createProposal.mutate(proposalData, {
      onSuccess: () => {
        setIsCreateOpen(false);
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  const handleVote = (proposalId: string, voteChoice: 'yes' | 'no' | 'abstain') => {
    castVote.mutate({ proposalId, voteChoice });
  };

  const handleCloseVoting = (proposalId: string) => {
    const proposal = proposals?.find(p => p.id === proposalId);
    if (!proposal) return;

    let result = "Failed";
    if (proposal.yes_votes > proposal.no_votes && 
        proposal.yes_votes / proposal.total_votes >= proposal.required_majority) {
      result = "Passed";
    }

    closeProposal.mutate({ proposalId, result });
  };

  const calculateVotePercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Vote className="h-6 w-6 text-primary" />
            <span>Voting</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Cast votes on proposals and manage committee voting
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Proposal</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-background border z-50">
            <DialogHeader>
              <DialogTitle>Create New Proposal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="committee_id">Committee</Label>
                <Select name="committee_id" required>
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
              <div className="space-y-2">
                <Label htmlFor="title">Proposal Title</Label>
                <Input name="title" placeholder="Enter proposal title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea name="description" placeholder="Detailed description of the proposal" rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proposal_type">Type</Label>
                  <Select name="proposal_type" defaultValue="motion">
                    <SelectTrigger className="bg-background border z-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="motion">Motion</SelectItem>
                      <SelectItem value="resolution">Resolution</SelectItem>
                      <SelectItem value="amendment">Amendment</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                      <SelectItem value="budget">Budget</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voting_method">Voting Method</Label>
                  <Select name="voting_method" defaultValue="simple_majority">
                    <SelectTrigger className="bg-background border z-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="simple_majority">Simple Majority</SelectItem>
                      <SelectItem value="two_thirds_majority">Two-Thirds Majority</SelectItem>
                      <SelectItem value="unanimous">Unanimous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="required_majority">Required Majority</Label>
                  <Input 
                    name="required_majority" 
                    type="number" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    defaultValue="0.5"
                    placeholder="0.5 for 50%, 0.67 for 67%"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quorum_required">Quorum Required</Label>
                  <Input name="quorum_required" type="number" min="1" placeholder="Minimum voters needed" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="voting_end_time">Voting Deadline (Optional)</Label>
                <Input name="voting_end_time" type="datetime-local" />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createProposal.isPending}>
                  {createProposal.isPending ? "Creating..." : "Create Proposal"}
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
                placeholder="Search proposals..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-background border z-30">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-40">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={committeeFilter} onValueChange={setCommitteeFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-background border z-30">
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
          </div>
        </CardContent>
      </Card>

      {/* Voting Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Active Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? <Skeleton className="h-8 w-12" /> : activeProposals.length}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Awaiting Your Vote</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {isLoading ? <Skeleton className="h-8 w-12" /> : 
                activeProposals.filter(p => !p.user_vote).length}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Closed This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {isLoading ? <Skeleton className="h-8 w-12" /> : 
                closedProposals.filter(p => {
                  const closedDate = new Date(p.voting_end_time || p.updated_at);
                  const now = new Date();
                  return closedDate.getMonth() === now.getMonth() && closedDate.getFullYear() === now.getFullYear();
                }).length}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Participation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {isLoading ? <Skeleton className="h-8 w-12" /> : 
                activeProposals.length > 0 ? 
                  Math.round((activeProposals.filter(p => p.user_vote).length / activeProposals.length) * 100) + '%' : 
                  '0%'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Proposals</TabsTrigger>
          <TabsTrigger value="history">Voting History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex gap-4 mb-4">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </Card>
            ))
          ) : filteredProposals?.filter(p => p.status === 'open').length ? (
            filteredProposals.filter(p => p.status === 'open').map((proposal) => (
              <Card key={proposal.id} className="shadow-card hover:shadow-primary transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{proposal.title}</h3>
                          <Badge className={getStatusColor(proposal.status)}>
                            {proposal.status}
                          </Badge>
                          <Badge variant="outline">{proposal.proposal_type}</Badge>
                        </div>
                        {proposal.description && (
                          <p className="text-muted-foreground mb-3 text-sm">
                            {proposal.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center space-x-1">
                            <Gavel className="h-4 w-4" />
                            <span>{proposal.committee?.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{format(new Date(proposal.created_at), 'PP')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{proposal.total_votes} votes cast</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Voting Results */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Voting Progress</span>
                        <span className="text-sm text-muted-foreground">
                          Required: {Math.round(proposal.required_majority * 100)}%
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Yes ({proposal.yes_votes})</span>
                          </div>
                          <span className="text-sm font-medium">
                            {calculateVotePercentage(proposal.yes_votes, proposal.total_votes)}%
                          </span>
                        </div>
                        <Progress 
                          value={calculateVotePercentage(proposal.yes_votes, proposal.total_votes)} 
                          className="h-2 bg-green-100"
                        />
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm">No ({proposal.no_votes})</span>
                          </div>
                          <span className="text-sm font-medium">
                            {calculateVotePercentage(proposal.no_votes, proposal.total_votes)}%
                          </span>
                        </div>
                        <Progress 
                          value={calculateVotePercentage(proposal.no_votes, proposal.total_votes)} 
                          className="h-2 bg-red-100"
                        />
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <MinusCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm">Abstain ({proposal.abstain_votes})</span>
                          </div>
                          <span className="text-sm font-medium">
                            {calculateVotePercentage(proposal.abstain_votes, proposal.total_votes)}%
                          </span>
                        </div>
                        <Progress 
                          value={calculateVotePercentage(proposal.abstain_votes, proposal.total_votes)} 
                          className="h-2 bg-yellow-100"
                        />
                      </div>
                    </div>

                    {/* Voting Actions */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedProposal(proposal)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {user?.id === proposal.proposed_by_id && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCloseVoting(proposal.id)}
                          >
                            Close Voting
                          </Button>
                        )}
                      </div>
                      
                      {proposal.user_vote ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">You voted:</span>
                          <Badge className={getVoteColor(proposal.user_vote.vote_choice)}>
                            {proposal.user_vote.vote_choice.toUpperCase()}
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleVote(proposal.id, 'yes')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={castVote.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Yes
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleVote(proposal.id, 'no')}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={castVote.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            No
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleVote(proposal.id, 'abstain')}
                            disabled={castVote.isPending}
                          >
                            <MinusCircle className="h-4 w-4 mr-1" />
                            Abstain
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground mb-4">No active proposals found</div>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Proposal
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </Card>
            ))
          ) : filteredProposals?.filter(p => p.status === 'closed').length ? (
            filteredProposals.filter(p => p.status === 'closed').map((proposal) => (
              <Card key={proposal.id} className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{proposal.title}</h3>
                        <Badge className={getStatusColor(proposal.status)}>
                          {proposal.status}
                        </Badge>
                        <Badge variant="outline">{proposal.proposal_type}</Badge>
                        {proposal.result && (
                          <Badge 
                            className={proposal.result === 'Passed' ? 
                              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}
                          >
                            {proposal.result}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Gavel className="h-4 w-4" />
                          <span>{proposal.committee?.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Closed {format(new Date(proposal.voting_end_time || proposal.updated_at), 'PP')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{proposal.total_votes} votes cast</span>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-4 text-sm">
                        <span className="text-green-600">Yes: {proposal.yes_votes}</span>
                        <span className="text-red-600">No: {proposal.no_votes}</span>
                        <span className="text-yellow-600">Abstain: {proposal.abstain_votes}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedProposal(proposal)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground">No voting history found</div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Proposal Details Dialog */}
      <ProposalDetailsDialog 
        proposal={selectedProposal} 
        onClose={() => setSelectedProposal(null)} 
      />
    </div>
  );
}

// Proposal Details Dialog Component
function ProposalDetailsDialog({ proposal, onClose }: { proposal: any; onClose: () => void }) {
  const { data: voteRecords } = useVoteRecords(proposal?.id);

  if (!proposal) return null;

  return (
    <Dialog open={!!proposal} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-background border z-50">
        <DialogHeader>
          <DialogTitle>Proposal Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          <div>
            <h3 className="font-semibold mb-2">Title</h3>
            <p className="text-muted-foreground">{proposal.title}</p>
          </div>
          
          {proposal.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{proposal.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Committee</h3>
              <p className="text-muted-foreground">{proposal.committee?.name}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Type</h3>
              <Badge variant="outline">{proposal.proposal_type}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Voting Method</h3>
              <p className="text-muted-foreground">{proposal.voting_method.replace('_', ' ')}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Required Majority</h3>
              <p className="text-muted-foreground">{Math.round(proposal.required_majority * 100)}%</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <Badge className={proposal.status === 'open' ? 
                'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                {proposal.status}
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Voting Results</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Yes Votes</span>
                </div>
                <span className="font-bold text-green-600">{proposal.yes_votes}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950 rounded">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium">No Votes</span>
                </div>
                <span className="font-bold text-red-600">{proposal.no_votes}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded">
                <div className="flex items-center space-x-2">
                  <MinusCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Abstain Votes</span>
                </div>
                <span className="font-bold text-yellow-600">{proposal.abstain_votes}</span>
              </div>
            </div>
          </div>

          {voteRecords && voteRecords.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Individual Votes ({voteRecords.length})</h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {voteRecords.map((vote) => (
                  <div key={vote.id} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">
                      {vote.voter?.first_name} {vote.voter?.last_name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        vote.vote_choice === 'yes' ? 'bg-green-100 text-green-800' :
                        vote.vote_choice === 'no' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {vote.vote_choice.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(vote.cast_at), 'PP p')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}