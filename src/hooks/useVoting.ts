import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface VotingProposal {
  id: string;
  committee_id: string;
  meeting_id?: string;
  agenda_item_id?: string;
  title: string;
  description?: string;
  proposal_type: string;
  proposed_by_id: string;
  voting_method: string;
  required_majority: number;
  voting_start_time: string;
  voting_end_time?: string;
  status: string;
  quorum_required?: number;
  quorum_achieved?: boolean;
  total_votes: number;
  yes_votes: number;
  no_votes: number;
  abstain_votes: number;
  result?: string;
  created_at: string;
  updated_at: string;
  committee?: {
    name: string;
    type: string;
  };
  proposer?: {
    first_name: string;
    last_name: string;
  };
  user_vote?: {
    vote_choice: string;
    cast_at: string;
  };
}

export interface VoteRecord {
  id: string;
  proposal_id: string;
  voter_id: string;
  vote_choice: 'yes' | 'no' | 'abstain';
  cast_at: string;
  proxy_voter_id?: string;
  voter?: {
    first_name: string;
    last_name: string;
  };
}

export const useVotingProposals = (committeeId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['voting_proposals', committeeId],
    queryFn: async () => {
      let query = supabase
        .from('voting_proposals')
        .select(`
          *,
          committees(name, type),
          profiles!voting_proposals_proposed_by_id_fkey(first_name, last_name),
          vote_records!inner(vote_choice, cast_at)
        `)
        .order('created_at', { ascending: false });

      if (committeeId) {
        query = query.eq('committee_id', committeeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Voting proposals fetch error:', error);
        throw error;
      }

      // Process data to add user's vote if any
      const processedData = await Promise.all(
        (data || []).map(async (proposal: any) => {
          // Get user's vote for this proposal
          const { data: userVote } = await supabase
            .from('vote_records')
            .select('vote_choice, cast_at')
            .eq('proposal_id', proposal.id)
            .eq('voter_id', user?.id)
            .single();

          return {
            ...proposal,
            committee: proposal.committees,
            proposer: proposal.profiles,
            user_vote: userVote,
          };
        })
      );

      return processedData as VotingProposal[];
    },
    enabled: !!user,
    retry: false,
  });
};

export const useVoteRecords = (proposalId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['vote_records', proposalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vote_records')
        .select(`
          *,
          profiles!vote_records_voter_id_fkey(first_name, last_name)
        `)
        .eq('proposal_id', proposalId)
        .order('cast_at', { ascending: false });

      if (error) {
        console.error('Vote records fetch error:', error);
        throw error;
      }

      return data.map((record: any) => ({
        ...record,
        voter: record.profiles,
      })) as VoteRecord[];
    },
    enabled: !!user && !!proposalId,
    retry: false,
  });
};

export const useCreateProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposal: Omit<VotingProposal, 'id' | 'created_at' | 'updated_at' | 'committee' | 'proposer' | 'user_vote' | 'total_votes' | 'yes_votes' | 'no_votes' | 'abstain_votes'>) => {
      const { data, error } = await supabase
        .from('voting_proposals')
        .insert([proposal])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voting_proposals'] });
      toast({
        title: "Success",
        description: "Voting proposal created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create voting proposal",
        variant: "destructive",
      });
    },
  });
};

export const useCastVote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalId, voteChoice }: { proposalId: string; voteChoice: 'yes' | 'no' | 'abstain' }) => {
      // First try to update existing vote, then insert if it doesn't exist
      const { data: existingVote } = await supabase
        .from('vote_records')
        .select('id')
        .eq('proposal_id', proposalId)
        .eq('voter_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (existingVote) {
        // Update existing vote
        const { data, error } = await supabase
          .from('vote_records')
          .update({ vote_choice: voteChoice })
          .eq('id', existingVote.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new vote
        const { data, error } = await supabase
          .from('vote_records')
          .insert([{
            proposal_id: proposalId,
            voter_id: (await supabase.auth.getUser()).data.user?.id,
            vote_choice: voteChoice,
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voting_proposals'] });
      queryClient.invalidateQueries({ queryKey: ['vote_records'] });
      toast({
        title: "Success",
        description: "Vote cast successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cast vote",
        variant: "destructive",
      });
    },
  });
};

export const useCloseProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalId, result }: { proposalId: string; result: string }) => {
      const { data, error } = await supabase
        .from('voting_proposals')
        .update({ 
          status: 'closed',
          result: result,
          voting_end_time: new Date().toISOString()
        })
        .eq('id', proposalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voting_proposals'] });
      toast({
        title: "Success",
        description: "Voting proposal closed successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to close voting proposal",
        variant: "destructive",
      });
    },
  });
};