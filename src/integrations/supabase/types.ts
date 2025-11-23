export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      action_items: {
        Row: {
          agenda_item_id: string | null
          assigned_to_department: string | null
          assigned_to_id: string | null
          committee_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          meeting_id: string | null
          organization_id: string | null
          outcome: string | null
          priority: string | null
          resolution_text: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          agenda_item_id?: string | null
          assigned_to_department?: string | null
          assigned_to_id?: string | null
          committee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          meeting_id?: string | null
          organization_id?: string | null
          outcome?: string | null
          priority?: string | null
          resolution_text?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          agenda_item_id?: string | null
          assigned_to_department?: string | null
          assigned_to_id?: string | null
          committee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          meeting_id?: string | null
          organization_id?: string | null
          outcome?: string | null
          priority?: string | null
          resolution_text?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_agenda_item_id_fkey"
            columns: ["agenda_item_id"]
            isOneToOne: false
            referencedRelation: "agenda_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      agenda_items: {
        Row: {
          classification: string | null
          created_at: string
          description: string | null
          estimated_duration: number | null
          id: string
          item_number: string
          item_type: string | null
          late_item: boolean | null
          meeting_id: string
          order_index: number | null
          requires_vote: boolean | null
          sponsor_id: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          classification?: string | null
          created_at?: string
          description?: string | null
          estimated_duration?: number | null
          id?: string
          item_number: string
          item_type?: string | null
          late_item?: boolean | null
          meeting_id: string
          order_index?: number | null
          requires_vote?: boolean | null
          sponsor_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          classification?: string | null
          created_at?: string
          description?: string | null
          estimated_duration?: number | null
          id?: string
          item_number?: string
          item_type?: string | null
          late_item?: boolean | null
          meeting_id?: string
          order_index?: number | null
          requires_vote?: boolean | null
          sponsor_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      business_processes: {
        Row: {
          category: string
          created_at: string
          department: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          organization_id: string | null
          overall_progress: number | null
          owner_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          department?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          organization_id?: string | null
          overall_progress?: number | null
          owner_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          department?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          overall_progress?: number | null
          owner_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_processes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_members: {
        Row: {
          committee_id: string
          created_at: string
          end_date: string | null
          id: string
          party_affiliation: string | null
          role: string | null
          start_date: string | null
          user_id: string
          voting_rights: boolean | null
          ward_number: string | null
        }
        Insert: {
          committee_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          party_affiliation?: string | null
          role?: string | null
          start_date?: string | null
          user_id: string
          voting_rights?: boolean | null
          ward_number?: string | null
        }
        Update: {
          committee_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          party_affiliation?: string | null
          role?: string | null
          start_date?: string | null
          user_id?: string
          voting_rights?: boolean | null
          ward_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "committee_members_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
        ]
      }
      committees: {
        Row: {
          chair_id: string | null
          created_at: string
          deputy_chair_id: string | null
          description: string | null
          id: string
          name: string
          notice_period_days: number | null
          organization_id: string
          public_access_allowed: boolean | null
          quorum_percentage: number | null
          status: string | null
          terms_of_reference: string | null
          type: string
          updated_at: string
          virtual_meetings_allowed: boolean | null
        }
        Insert: {
          chair_id?: string | null
          created_at?: string
          deputy_chair_id?: string | null
          description?: string | null
          id?: string
          name: string
          notice_period_days?: number | null
          organization_id: string
          public_access_allowed?: boolean | null
          quorum_percentage?: number | null
          status?: string | null
          terms_of_reference?: string | null
          type: string
          updated_at?: string
          virtual_meetings_allowed?: boolean | null
        }
        Update: {
          chair_id?: string | null
          created_at?: string
          deputy_chair_id?: string | null
          description?: string | null
          id?: string
          name?: string
          notice_period_days?: number | null
          organization_id?: string
          public_access_allowed?: boolean | null
          quorum_percentage?: number | null
          status?: string | null
          terms_of_reference?: string | null
          type?: string
          updated_at?: string
          virtual_meetings_allowed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "committees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions_register: {
        Row: {
          agenda_item_id: string | null
          created_at: string
          decision_number: string
          decision_text: string
          decision_type: string
          due_date: string | null
          escalation_level: string | null
          escalation_threshold: Json | null
          id: string
          meeting_id: string
          owner_department: string | null
          owner_id: string | null
          priority: string | null
          progress_notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agenda_item_id?: string | null
          created_at?: string
          decision_number: string
          decision_text: string
          decision_type: string
          due_date?: string | null
          escalation_level?: string | null
          escalation_threshold?: Json | null
          id?: string
          meeting_id: string
          owner_department?: string | null
          owner_id?: string | null
          priority?: string | null
          progress_notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agenda_item_id?: string | null
          created_at?: string
          decision_number?: string
          decision_text?: string
          decision_type?: string
          due_date?: string | null
          escalation_level?: string | null
          escalation_threshold?: Json | null
          id?: string
          meeting_id?: string
          owner_department?: string | null
          owner_id?: string | null
          priority?: string | null
          progress_notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "decisions_register_agenda_item_id_fkey"
            columns: ["agenda_item_id"]
            isOneToOne: false
            referencedRelation: "agenda_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_register_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      departmental_registers: {
        Row: {
          completion_date: string | null
          created_at: string
          department: string
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          register_type: string
          related_id: string | null
          related_table: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          department: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          register_type: string
          related_id?: string | null
          related_table?: string | null
          status: string
          title: string
          updated_at?: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          department?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          register_type?: string
          related_id?: string | null
          related_table?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departmental_registers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          name: string
          parent_category_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name: string
          parent_category_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name?: string
          parent_category_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "document_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      document_popia_tags: {
        Row: {
          audit_log: Json | null
          created_at: string
          document_id: string
          id: string
          lawful_basis: string
          personal_info_category: string
          redaction_notes: string | null
          redaction_required: boolean | null
          updated_at: string
        }
        Insert: {
          audit_log?: Json | null
          created_at?: string
          document_id: string
          id?: string
          lawful_basis: string
          personal_info_category: string
          redaction_notes?: string | null
          redaction_required?: boolean | null
          updated_at?: string
        }
        Update: {
          audit_log?: Json | null
          created_at?: string
          document_id?: string
          id?: string
          lawful_basis?: string
          personal_info_category?: string
          redaction_notes?: string | null
          redaction_required?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_popia_tags_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "meeting_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notifications: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          notification_type: string
          organization_id: string
          recipient_email: string
          recipient_id: string | null
          sent_at: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          notification_type: string
          organization_id: string
          recipient_email: string
          recipient_id?: string | null
          sent_at?: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          notification_type?: string
          organization_id?: string
          recipient_email?: string
          recipient_id?: string | null
          sent_at?: string
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      information_requests: {
        Row: {
          addressed_to: string
          addressed_to_dept: string | null
          committee_id: string
          compliance_status: string
          created_at: string
          deadline_date: string
          escalation_notes: string | null
          id: string
          issue_date: string
          issued_by_id: string
          linked_meeting_id: string | null
          request_details: string
          request_number: string
          request_type: string
          response_received_date: string | null
          response_summary: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          addressed_to: string
          addressed_to_dept?: string | null
          committee_id: string
          compliance_status?: string
          created_at?: string
          deadline_date: string
          escalation_notes?: string | null
          id?: string
          issue_date?: string
          issued_by_id: string
          linked_meeting_id?: string | null
          request_details: string
          request_number: string
          request_type: string
          response_received_date?: string | null
          response_summary?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          addressed_to?: string
          addressed_to_dept?: string | null
          committee_id?: string
          compliance_status?: string
          created_at?: string
          deadline_date?: string
          escalation_notes?: string | null
          id?: string
          issue_date?: string
          issued_by_id?: string
          linked_meeting_id?: string | null
          request_details?: string
          request_number?: string
          request_type?: string
          response_received_date?: string | null
          response_summary?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "information_requests_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "information_requests_linked_meeting_id_fkey"
            columns: ["linked_meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_attendance: {
        Row: {
          arrival_time: string | null
          attendance_status: string
          created_at: string
          departure_time: string | null
          id: string
          meeting_id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          arrival_time?: string | null
          attendance_status: string
          created_at?: string
          departure_time?: string | null
          id?: string
          meeting_id: string
          notes?: string | null
          user_id: string
        }
        Update: {
          arrival_time?: string | null
          attendance_status?: string
          created_at?: string
          departure_time?: string | null
          id?: string
          meeting_id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_attendance_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_documents: {
        Row: {
          content: string | null
          created_at: string
          document_type: string
          file_path: string | null
          id: string
          meeting_id: string
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          document_type: string
          file_path?: string | null
          id?: string
          meeting_id: string
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          document_type?: string
          file_path?: string | null
          id?: string
          meeting_id?: string
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      meeting_packs: {
        Row: {
          compiled_at: string | null
          compiled_by: string | null
          created_at: string
          distribution_list: string[] | null
          id: string
          meeting_id: string
          metadata: Json | null
          pack_status: string
          restricted: boolean | null
          signature_routing: Json | null
          updated_at: string
          version_number: number
        }
        Insert: {
          compiled_at?: string | null
          compiled_by?: string | null
          created_at?: string
          distribution_list?: string[] | null
          id?: string
          meeting_id: string
          metadata?: Json | null
          pack_status?: string
          restricted?: boolean | null
          signature_routing?: Json | null
          updated_at?: string
          version_number?: number
        }
        Update: {
          compiled_at?: string | null
          compiled_by?: string | null
          created_at?: string
          distribution_list?: string[] | null
          id?: string
          meeting_id?: string
          metadata?: Json | null
          pack_status?: string
          restricted?: boolean | null
          signature_routing?: Json | null
          updated_at?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "meeting_packs_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_registrations: {
        Row: {
          attendance_purpose: string | null
          created_at: string
          id: string
          meeting_id: string
          registration_type: string
          user_id: string
        }
        Insert: {
          attendance_purpose?: string | null
          created_at?: string
          id?: string
          meeting_id: string
          registration_type: string
          user_id: string
        }
        Update: {
          attendance_purpose?: string | null
          created_at?: string
          id?: string
          meeting_id?: string
          registration_type?: string
          user_id?: string
        }
        Relationships: []
      }
      meeting_sessions: {
        Row: {
          created_at: string
          declarations: Json | null
          id: string
          meeting_id: string
          session_end: string | null
          session_start: string | null
          speakers_queue: Json | null
          updated_at: string
          voting_config: Json | null
        }
        Insert: {
          created_at?: string
          declarations?: Json | null
          id?: string
          meeting_id: string
          session_end?: string | null
          session_start?: string | null
          speakers_queue?: Json | null
          updated_at?: string
          voting_config?: Json | null
        }
        Update: {
          created_at?: string
          declarations?: Json | null
          id?: string
          meeting_id?: string
          session_end?: string | null
          session_start?: string | null
          speakers_queue?: Json | null
          updated_at?: string
          voting_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_sessions_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          agenda_published: boolean | null
          committee_id: string
          created_at: string
          id: string
          livestream_url: string | null
          meeting_date: string
          meeting_type: string | null
          minutes_published: boolean | null
          organization_id: string
          public_meeting: boolean | null
          quorum_achieved: boolean | null
          recording_url: string | null
          status: string | null
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          agenda_published?: boolean | null
          committee_id: string
          created_at?: string
          id?: string
          livestream_url?: string | null
          meeting_date: string
          meeting_type?: string | null
          minutes_published?: boolean | null
          organization_id: string
          public_meeting?: boolean | null
          quorum_achieved?: boolean | null
          recording_url?: string | null
          status?: string | null
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          agenda_published?: boolean | null
          committee_id?: string
          created_at?: string
          id?: string
          livestream_url?: string | null
          meeting_date?: string
          meeting_type?: string | null
          minutes_published?: boolean | null
          organization_id?: string
          public_meeting?: boolean | null
          quorum_achieved?: boolean | null
          recording_url?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      minutes_approval: {
        Row: {
          approval_stage: string
          approved_at: string | null
          approved_by: string | null
          comments: string | null
          created_at: string
          document_id: string | null
          id: string
          meeting_id: string
          publication_scope: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          approval_stage?: string
          approved_at?: string | null
          approved_by?: string | null
          comments?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          meeting_id: string
          publication_scope?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          approval_stage?: string
          approved_at?: string | null
          approved_by?: string | null
          comments?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          meeting_id?: string
          publication_scope?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "minutes_approval_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "meeting_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "minutes_approval_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      motions: {
        Row: {
          admissibility_notes: string | null
          admissibility_status: string
          committee_id: string
          created_at: string
          id: string
          motion_number: string
          motion_text: string
          motion_type: string
          notice_date: string
          organization_id: string | null
          outcome: string | null
          outcome_notes: string | null
          scheduled_meeting_id: string | null
          seconder_id: string | null
          status: string
          submitter_id: string
          title: string
          updated_at: string
        }
        Insert: {
          admissibility_notes?: string | null
          admissibility_status?: string
          committee_id: string
          created_at?: string
          id?: string
          motion_number: string
          motion_text: string
          motion_type: string
          notice_date: string
          organization_id?: string | null
          outcome?: string | null
          outcome_notes?: string | null
          scheduled_meeting_id?: string | null
          seconder_id?: string | null
          status?: string
          submitter_id: string
          title: string
          updated_at?: string
        }
        Update: {
          admissibility_notes?: string | null
          admissibility_status?: string
          committee_id?: string
          created_at?: string
          id?: string
          motion_number?: string
          motion_text?: string
          motion_type?: string
          notice_date?: string
          organization_id?: string | null
          outcome?: string | null
          outcome_notes?: string | null
          scheduled_meeting_id?: string | null
          seconder_id?: string | null
          status?: string
          submitter_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "motions_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "motions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "motions_scheduled_meeting_id_fkey"
            columns: ["scheduled_meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          domain: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          slug: string
          subscription_status: string | null
          subscription_tier: string | null
          teams_webhook_url: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          slug: string
          subscription_status?: string | null
          subscription_tier?: string | null
          teams_webhook_url?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          subscription_status?: string | null
          subscription_tier?: string | null
          teams_webhook_url?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      paia_requests: {
        Row: {
          appeal_lodged: boolean | null
          appeal_notes: string | null
          created_at: string
          date_received: string
          decision: string | null
          decision_date: string | null
          extended_deadline: string | null
          extension_granted: boolean | null
          fees_paid: boolean | null
          fees_prescribed: number | null
          form_of_access: string
          id: string
          organization_id: string | null
          record_description: string
          refusal_grounds: string | null
          release_package_ref: string | null
          request_number: string
          requester_address: string | null
          requester_contact: string
          requester_name: string
          status: string
          statutory_deadline: string
          updated_at: string
        }
        Insert: {
          appeal_lodged?: boolean | null
          appeal_notes?: string | null
          created_at?: string
          date_received?: string
          decision?: string | null
          decision_date?: string | null
          extended_deadline?: string | null
          extension_granted?: boolean | null
          fees_paid?: boolean | null
          fees_prescribed?: number | null
          form_of_access: string
          id?: string
          organization_id?: string | null
          record_description: string
          refusal_grounds?: string | null
          release_package_ref?: string | null
          request_number: string
          requester_address?: string | null
          requester_contact: string
          requester_name: string
          status?: string
          statutory_deadline: string
          updated_at?: string
        }
        Update: {
          appeal_lodged?: boolean | null
          appeal_notes?: string | null
          created_at?: string
          date_received?: string
          decision?: string | null
          decision_date?: string | null
          extended_deadline?: string | null
          extension_granted?: boolean | null
          fees_paid?: boolean | null
          fees_prescribed?: number | null
          form_of_access?: string
          id?: string
          organization_id?: string | null
          record_description?: string
          refusal_grounds?: string | null
          release_package_ref?: string | null
          request_number?: string
          requester_address?: string | null
          requester_contact?: string
          requester_name?: string
          status?: string
          statutory_deadline?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "paia_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      petitions: {
        Row: {
          classification: string
          created_at: string
          date_received: string
          id: string
          linked_agenda_item_id: string | null
          organization_id: string | null
          petition_number: string
          petition_text: string
          petition_type: string
          petitioner_notified_date: string | null
          publication_status: string
          response_date: string | null
          response_text: string | null
          routed_to_committee_id: string | null
          routed_to_dept: string | null
          signatures_count: number | null
          status: string
          subject: string
          submitter_contact: string | null
          submitter_name: string
          updated_at: string
        }
        Insert: {
          classification: string
          created_at?: string
          date_received?: string
          id?: string
          linked_agenda_item_id?: string | null
          organization_id?: string | null
          petition_number: string
          petition_text: string
          petition_type: string
          petitioner_notified_date?: string | null
          publication_status?: string
          response_date?: string | null
          response_text?: string | null
          routed_to_committee_id?: string | null
          routed_to_dept?: string | null
          signatures_count?: number | null
          status?: string
          subject: string
          submitter_contact?: string | null
          submitter_name: string
          updated_at?: string
        }
        Update: {
          classification?: string
          created_at?: string
          date_received?: string
          id?: string
          linked_agenda_item_id?: string | null
          organization_id?: string | null
          petition_number?: string
          petition_text?: string
          petition_type?: string
          petitioner_notified_date?: string | null
          publication_status?: string
          response_date?: string | null
          response_text?: string | null
          routed_to_committee_id?: string | null
          routed_to_dept?: string | null
          signatures_count?: number | null
          status?: string
          subject?: string
          submitter_contact?: string | null
          submitter_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "petitions_linked_agenda_item_id_fkey"
            columns: ["linked_agenda_item_id"]
            isOneToOne: false
            referencedRelation: "agenda_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "petitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "petitions_routed_to_committee_id_fkey"
            columns: ["routed_to_committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
        ]
      }
      process_steps: {
        Row: {
          created_at: string
          dependencies: string[] | null
          description: string | null
          duration_days: number | null
          id: string
          process_id: string
          responsible_party: string | null
          status: string | null
          step_number: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          duration_days?: number | null
          id?: string
          process_id: string
          responsible_party?: string | null
          status?: string | null
          step_number: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          duration_days?: number | null
          id?: string
          process_id?: string
          responsible_party?: string | null
          status?: string | null
          step_number?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_steps_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "business_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string | null
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          organization_id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          organization_id: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          organization_id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      questions_to_executive: {
        Row: {
          addressed_to_dept: string
          addressed_to_mmc: string | null
          committee_id: string
          councillor_id: string
          created_at: string
          due_date: string
          follow_up_required: boolean | null
          id: string
          organization_id: string | null
          question_number: string
          question_text: string
          question_type: string
          response_date: string | null
          response_text: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          addressed_to_dept: string
          addressed_to_mmc?: string | null
          committee_id: string
          councillor_id: string
          created_at?: string
          due_date: string
          follow_up_required?: boolean | null
          id?: string
          organization_id?: string | null
          question_number: string
          question_text: string
          question_type: string
          response_date?: string | null
          response_text?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          addressed_to_dept?: string
          addressed_to_mmc?: string | null
          committee_id?: string
          councillor_id?: string
          created_at?: string
          due_date?: string
          follow_up_required?: boolean | null
          id?: string
          organization_id?: string | null
          question_number?: string
          question_text?: string
          question_type?: string
          response_date?: string | null
          response_text?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_to_executive_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_to_executive_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reports_library: {
        Row: {
          category_id: string | null
          classification: string
          committee_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          document_url: string | null
          file_path: string | null
          file_size: number | null
          financial_year: string | null
          id: string
          linked_meeting_id: string | null
          metadata: Json | null
          organization_id: string | null
          publication_status: string | null
          published_date: string | null
          report_type: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          classification?: string
          committee_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_url?: string | null
          file_path?: string | null
          file_size?: number | null
          financial_year?: string | null
          id?: string
          linked_meeting_id?: string | null
          metadata?: Json | null
          organization_id?: string | null
          publication_status?: string | null
          published_date?: string | null
          report_type: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          classification?: string
          committee_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_url?: string | null
          file_path?: string | null
          file_size?: number | null
          financial_year?: string | null
          id?: string
          linked_meeting_id?: string | null
          metadata?: Json | null
          organization_id?: string | null
          publication_status?: string | null
          published_date?: string | null
          report_type?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_library_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "document_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_library_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_library_linked_meeting_id_fkey"
            columns: ["linked_meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_library_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      site_visits: {
        Row: {
          committee_id: string
          created_at: string
          evidence_collected: string[] | null
          findings: string | null
          id: string
          linked_agenda_item_id: string | null
          linked_resolution_id: string | null
          observations: string | null
          organization_id: string | null
          participants: string[]
          report_drafted: boolean | null
          report_text: string | null
          site_address: string | null
          site_location: string
          status: string
          updated_at: string
          visit_date: string
          visit_number: string
          visit_purpose: string
        }
        Insert: {
          committee_id: string
          created_at?: string
          evidence_collected?: string[] | null
          findings?: string | null
          id?: string
          linked_agenda_item_id?: string | null
          linked_resolution_id?: string | null
          observations?: string | null
          organization_id?: string | null
          participants: string[]
          report_drafted?: boolean | null
          report_text?: string | null
          site_address?: string | null
          site_location: string
          status?: string
          updated_at?: string
          visit_date: string
          visit_number: string
          visit_purpose: string
        }
        Update: {
          committee_id?: string
          created_at?: string
          evidence_collected?: string[] | null
          findings?: string | null
          id?: string
          linked_agenda_item_id?: string | null
          linked_resolution_id?: string | null
          observations?: string | null
          organization_id?: string | null
          participants?: string[]
          report_drafted?: boolean | null
          report_text?: string | null
          site_address?: string | null
          site_location?: string
          status?: string
          updated_at?: string
          visit_date?: string
          visit_number?: string
          visit_purpose?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_visits_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_visits_linked_agenda_item_id_fkey"
            columns: ["linked_agenda_item_id"]
            isOneToOne: false
            referencedRelation: "agenda_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_visits_linked_resolution_id_fkey"
            columns: ["linked_resolution_id"]
            isOneToOne: false
            referencedRelation: "action_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_visits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle_end: string
          billing_cycle_start: string
          created_at: string
          features: Json | null
          id: string
          last_payment_date: string | null
          max_committees: number | null
          max_users: number | null
          monthly_price: number
          next_payment_date: string | null
          organization_id: string
          payment_method: string | null
          status: string
          tier: string
          updated_at: string
        }
        Insert: {
          billing_cycle_end: string
          billing_cycle_start: string
          created_at?: string
          features?: Json | null
          id?: string
          last_payment_date?: string | null
          max_committees?: number | null
          max_users?: number | null
          monthly_price: number
          next_payment_date?: string | null
          organization_id: string
          payment_method?: string | null
          status?: string
          tier: string
          updated_at?: string
        }
        Update: {
          billing_cycle_end?: string
          billing_cycle_start?: string
          created_at?: string
          features?: Json | null
          id?: string
          last_payment_date?: string | null
          max_committees?: number | null
          max_users?: number | null
          monthly_price?: number
          next_payment_date?: string | null
          organization_id?: string
          payment_method?: string | null
          status?: string
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      teams_notifications: {
        Row: {
          error_message: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          organization_id: string | null
          sent_at: string | null
          success: boolean | null
          title: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          organization_id?: string | null
          sent_at?: string | null
          success?: boolean | null
          title: string
        }
        Update: {
          error_message?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          organization_id?: string | null
          sent_at?: string | null
          success?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      uifw_cases: {
        Row: {
          amount: number
          case_number: string
          case_type: string
          closure_report: string | null
          council_decision: string | null
          council_decision_date: string | null
          created_at: string
          date_opened: string
          department: string
          description: string
          evidence_summary: string | null
          financial_year: string
          findings: string | null
          hearing_date: string | null
          hearing_scheduled_meeting_id: string | null
          id: string
          implementation_status: string | null
          organization_id: string | null
          recommendations: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          case_number: string
          case_type: string
          closure_report?: string | null
          council_decision?: string | null
          council_decision_date?: string | null
          created_at?: string
          date_opened?: string
          department: string
          description: string
          evidence_summary?: string | null
          financial_year: string
          findings?: string | null
          hearing_date?: string | null
          hearing_scheduled_meeting_id?: string | null
          id?: string
          implementation_status?: string | null
          organization_id?: string | null
          recommendations?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          case_number?: string
          case_type?: string
          closure_report?: string | null
          council_decision?: string | null
          council_decision_date?: string | null
          created_at?: string
          date_opened?: string
          department?: string
          description?: string
          evidence_summary?: string | null
          financial_year?: string
          findings?: string | null
          hearing_date?: string | null
          hearing_scheduled_meeting_id?: string | null
          id?: string
          implementation_status?: string | null
          organization_id?: string | null
          recommendations?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "uifw_cases_hearing_scheduled_meeting_id_fkey"
            columns: ["hearing_scheduled_meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uifw_cases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          committee_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          committee_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          committee_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vote_records: {
        Row: {
          cast_at: string
          id: string
          proposal_id: string
          proxy_voter_id: string | null
          vote_choice: string
          voter_id: string
        }
        Insert: {
          cast_at?: string
          id?: string
          proposal_id: string
          proxy_voter_id?: string | null
          vote_choice: string
          voter_id: string
        }
        Update: {
          cast_at?: string
          id?: string
          proposal_id?: string
          proxy_voter_id?: string | null
          vote_choice?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vote_records_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "voting_proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vote_records_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "voting_proposals_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      voting_proposals: {
        Row: {
          abstain_votes: number | null
          agenda_item_id: string | null
          committee_id: string
          confidential_voting: boolean | null
          created_at: string
          description: string | null
          id: string
          meeting_id: string | null
          no_votes: number | null
          proposal_type: string
          proposed_by_id: string
          quorum_achieved: boolean | null
          quorum_required: number | null
          required_majority: number | null
          result: string | null
          status: string
          title: string
          total_votes: number | null
          updated_at: string
          voting_end_time: string | null
          voting_method: string
          voting_start_time: string | null
          yes_votes: number | null
        }
        Insert: {
          abstain_votes?: number | null
          agenda_item_id?: string | null
          committee_id: string
          confidential_voting?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          meeting_id?: string | null
          no_votes?: number | null
          proposal_type?: string
          proposed_by_id: string
          quorum_achieved?: boolean | null
          quorum_required?: number | null
          required_majority?: number | null
          result?: string | null
          status?: string
          title: string
          total_votes?: number | null
          updated_at?: string
          voting_end_time?: string | null
          voting_method?: string
          voting_start_time?: string | null
          yes_votes?: number | null
        }
        Update: {
          abstain_votes?: number | null
          agenda_item_id?: string | null
          committee_id?: string
          confidential_voting?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          meeting_id?: string | null
          no_votes?: number | null
          proposal_type?: string
          proposed_by_id?: string
          quorum_achieved?: boolean | null
          quorum_required?: number | null
          required_majority?: number | null
          result?: string | null
          status?: string
          title?: string
          total_votes?: number | null
          updated_at?: string
          voting_end_time?: string | null
          voting_method?: string
          voting_start_time?: string | null
          yes_votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "voting_proposals_agenda_item_id_fkey"
            columns: ["agenda_item_id"]
            isOneToOne: false
            referencedRelation: "agenda_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voting_proposals_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voting_proposals_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      ward_submissions: {
        Row: {
          created_at: string
          date_submitted: string
          description: string
          feedback_date: string | null
          feedback_text: string | null
          id: string
          linked_agenda_item_id: string | null
          linked_committee_id: string | null
          status: string
          submission_number: string
          submission_type: string
          submitter_details: string | null
          topic: string
          updated_at: string
          ward_number: string
        }
        Insert: {
          created_at?: string
          date_submitted?: string
          description: string
          feedback_date?: string | null
          feedback_text?: string | null
          id?: string
          linked_agenda_item_id?: string | null
          linked_committee_id?: string | null
          status?: string
          submission_number: string
          submission_type: string
          submitter_details?: string | null
          topic: string
          updated_at?: string
          ward_number: string
        }
        Update: {
          created_at?: string
          date_submitted?: string
          description?: string
          feedback_date?: string | null
          feedback_text?: string | null
          id?: string
          linked_agenda_item_id?: string | null
          linked_committee_id?: string | null
          status?: string
          submission_number?: string
          submission_type?: string
          submitter_details?: string | null
          topic?: string
          updated_at?: string
          ward_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "ward_submissions_linked_agenda_item_id_fkey"
            columns: ["linked_agenda_item_id"]
            isOneToOne: false
            referencedRelation: "agenda_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ward_submissions_linked_committee_id_fkey"
            columns: ["linked_committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      voting_proposals_safe: {
        Row: {
          abstain_votes: number | null
          agenda_item_id: string | null
          committee_id: string | null
          confidential_voting: boolean | null
          created_at: string | null
          description: string | null
          id: string | null
          meeting_id: string | null
          no_votes: number | null
          proposal_type: string | null
          proposed_by_id: string | null
          quorum_achieved: boolean | null
          quorum_required: number | null
          required_majority: number | null
          result: string | null
          status: string | null
          title: string | null
          total_votes: number | null
          updated_at: string | null
          voting_end_time: string | null
          voting_method: string | null
          voting_start_time: string | null
          yes_votes: number | null
        }
        Insert: {
          abstain_votes?: never
          agenda_item_id?: string | null
          committee_id?: string | null
          confidential_voting?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          meeting_id?: string | null
          no_votes?: never
          proposal_type?: string | null
          proposed_by_id?: string | null
          quorum_achieved?: boolean | null
          quorum_required?: number | null
          required_majority?: number | null
          result?: string | null
          status?: string | null
          title?: string | null
          total_votes?: number | null
          updated_at?: string | null
          voting_end_time?: string | null
          voting_method?: string | null
          voting_start_time?: string | null
          yes_votes?: never
        }
        Update: {
          abstain_votes?: never
          agenda_item_id?: string | null
          committee_id?: string | null
          confidential_voting?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          meeting_id?: string | null
          no_votes?: never
          proposal_type?: string | null
          proposed_by_id?: string | null
          quorum_achieved?: boolean | null
          quorum_required?: number | null
          required_majority?: number | null
          result?: string | null
          status?: string | null
          title?: string | null
          total_votes?: number | null
          updated_at?: string | null
          voting_end_time?: string | null
          voting_method?: string | null
          voting_start_time?: string | null
          yes_votes?: never
        }
        Relationships: [
          {
            foreignKeyName: "voting_proposals_agenda_item_id_fkey"
            columns: ["agenda_item_id"]
            isOneToOne: false
            referencedRelation: "agenda_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voting_proposals_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voting_proposals_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_access_department: {
        Args: { _department: string; _user_id: string }
        Returns: boolean
      }
      can_access_organization: {
        Args: { _organization_id: string; _user_id: string }
        Returns: boolean
      }
      check_committee_leadership: {
        Args: { _committee_id: string; _user_id: string }
        Returns: boolean
      }
      check_user_committee_membership: {
        Args: { _committee_id: string; _user_id: string }
        Returns: boolean
      }
      complete_user_onboarding: {
        Args: {
          _first_name: string
          _last_name: string
          _organization_domain: string
          _organization_name: string
          _user_id: string
        }
        Returns: Json
      }
      get_user_department: { Args: { _user_id: string }; Returns: string }
      get_user_organization: { Args: { _user_id: string }; Returns: string }
      grant_super_admin_to_email: {
        Args: { _email: string }
        Returns: undefined
      }
      has_committee_access: {
        Args: { _committee_id: string; _user_id: string }
        Returns: boolean
      }
      has_committee_role: {
        Args: { _committee_id: string; _role: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_committee_secretary: {
        Args: { _committee_id: string; _user_id: string }
        Returns: boolean
      }
      is_director: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      log_audit_event: {
        Args: {
          _action: string
          _new_values?: Json
          _old_values?: Json
          _record_id?: string
          _table_name: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "speaker"
        | "chair"
        | "deputy_chair"
        | "whip"
        | "member"
        | "external_member"
        | "coordinator"
        | "clerk"
        | "legal"
        | "cfo"
        | "public"
        | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "speaker",
        "chair",
        "deputy_chair",
        "whip",
        "member",
        "external_member",
        "coordinator",
        "clerk",
        "legal",
        "cfo",
        "public",
        "super_admin",
      ],
    },
  },
} as const
