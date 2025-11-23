import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'meeting' | 'committee' | 'agenda' | 'action' | 'member' | 'document';
  url: string;
  metadata?: Record<string, any>;
  created_at?: string;
  relevance?: number;
}

export const useGlobalSearch = (query: string, filters?: {
  types?: string[];
  dateRange?: { start: string; end: string };
}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['global-search', query, filters],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      const results: SearchResult[] = [];
      const searchTerm = `%${query.toLowerCase()}%`;
      
      // Search meetings
      if (!filters?.types || filters.types.includes('meeting')) {
        const { data: meetings } = await supabase
          .from('meetings' as any)
          .select(`
            id, title, meeting_date, venue, status,
            committees!inner(name, type)
          `)
          .or(`title.ilike.${searchTerm},venue.ilike.${searchTerm}`)
          .eq('public_meeting', true)
          .limit(10);

        meetings?.forEach((meeting: any) => {
          results.push({
            id: meeting.id,
            title: meeting.title,
            description: `${meeting.committees?.name} - ${new Date(meeting.meeting_date).toLocaleDateString()}`,
            type: 'meeting',
            url: `/meetings/upcoming`,
            metadata: {
              status: meeting.status,
              date: meeting.meeting_date,
              venue: meeting.venue,
              committee: meeting.committees?.name
            }
          });
        });
      }

      // Search committees
      if (!filters?.types || filters.types.includes('committee')) {
        const { data: committees } = await supabase
          .from('committees' as any)
          .select('id, name, description, type, status')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .eq('status', 'active')
          .limit(10);

        committees?.forEach((committee: any) => {
          results.push({
            id: committee.id,
            title: committee.name,
            description: committee.description,
            type: 'committee',
            url: `/committees/${committee.id}`,
            metadata: {
              type: committee.type,
              status: committee.status
            }
          });
        });
      }

      // Search action items (if user has access)
      if (user && (!filters?.types || filters.types.includes('action'))) {
        const { data: actions } = await supabase
          .from('action_items' as any)
          .select(`
            id, title, description, status, due_date,
            committees!inner(name)
          `)
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .limit(10);

        actions?.forEach((action: any) => {
          results.push({
            id: action.id,
            title: action.title,
            description: action.description,
            type: 'action',
            url: `/actions`,
            metadata: {
              status: action.status,
              dueDate: action.due_date,
              committee: action.committees?.name
            }
          });
        });
      }

      // Search members/profiles
      if (!filters?.types || filters.types.includes('member')) {
        const { data: members } = await supabase
          .from('profiles' as any)
          .select('id, first_name, last_name, job_title, department')
          .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},job_title.ilike.${searchTerm}`)
          .limit(10);

        members?.forEach((member: any) => {
          const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim();
          results.push({
            id: member.id,
            title: fullName || 'Unknown Member',
            description: member.job_title,
            type: 'member',
            url: `/members`,
            metadata: {
              department: member.department,
              jobTitle: member.job_title
            }
          });
        });
      }

      // Search meeting documents (if user has access)
      if (user && (!filters?.types || filters.types.includes('document'))) {
        const { data: documents } = await supabase
          .from('meeting_documents' as any)
          .select(`
            id, title, document_type, content,
            meetings!inner(title, public_meeting)
          `)
          .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
          .eq('published', true)
          .limit(10);

        documents?.forEach((doc: any) => {
          if (doc.meetings?.public_meeting || user) {
            results.push({
              id: doc.id,
              title: doc.title,
              description: `${doc.document_type} - ${doc.meetings?.title}`,
              type: 'document',
              url: `/meetings/upcoming`,
              metadata: {
                documentType: doc.document_type,
                meeting: doc.meetings?.title
              }
            });
          }
        });
      }

      // Sort by relevance (simple algorithm based on title match)
      return results.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const queryLower = query.toLowerCase();
        
        // Exact match gets highest priority
        if (aTitle === queryLower && bTitle !== queryLower) return -1;
        if (bTitle === queryLower && aTitle !== queryLower) return 1;
        
        // Starts with query gets next priority
        if (aTitle.startsWith(queryLower) && !bTitle.startsWith(queryLower)) return -1;
        if (bTitle.startsWith(queryLower) && !aTitle.startsWith(queryLower)) return 1;
        
        // Then by type priority (meetings, committees, actions, members, documents)
        const typePriority = { meeting: 1, committee: 2, action: 3, member: 4, document: 5 };
        return typePriority[a.type] - typePriority[b.type];
      });
    },
    enabled: !!query && query.length >= 2,
    staleTime: 30000, // 30 seconds
  });
};

export const useRecentSearches = () => {
  const getRecentSearches = (): string[] => {
    try {
      const searches = localStorage.getItem('recent_searches');
      return searches ? JSON.parse(searches) : [];
    } catch {
      return [];
    }
  };

  const addRecentSearch = (query: string) => {
    if (!query || query.length < 2) return;
    
    try {
      const recent = getRecentSearches();
      const updated = [query, ...recent.filter(s => s !== query)].slice(0, 10);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
  };

  const clearRecentSearches = () => {
    try {
      localStorage.removeItem('recent_searches');
    } catch {
      // Ignore localStorage errors
    }
  };

  return {
    getRecentSearches,
    addRecentSearch,
    clearRecentSearches
  };
};