# End-to-End Workflow Testing Guide

This document outlines how to test the three main workflows that are now fully functional in G.R.A.C.E.

## Prerequisites

Before testing, ensure:
- You have a fresh user account or are logged out
- Authentication is enabled in Supabase
- RLS policies are active (they are!)

## Workflow 1: User Onboarding to First Action

### Steps:
1. **Sign Up**: Go to `/auth` and create a new account
2. **Onboarding**: You'll be redirected to `/onboarding`
   - Fill in organization name (e.g., "City of Johannesburg")
   - Slug is auto-generated
   - Add optional domain (e.g., "joburg.org.za")
   - Enter your first and last name
   - Click "Complete Setup & Get Started"
3. **Product Tour**: After completion, you'll see a guided tour
4. **Dashboard**: You're now on the dashboard with admin access

**What happens behind the scenes:**
- Organization is created
- Your profile is updated
- You're automatically assigned the 'admin' role
- You can now create committees and meetings

## Workflow 2: Committee Management Workflow

### Steps:
1. Navigate to **Committees** page (`/committees`)
2. Click **"Add Committee"**
3. Fill in committee details:
   - Name: e.g., "Finance Committee"
   - Type: Select from dropdown (e.g., "Portfolio Committee")
   - Description: Brief purpose
   - Terms of Reference: Detailed mandate
   - Quorum: Default 50%
   - Notice Period: Default 5 days
   - Public Access: Yes/No
   - Virtual Meetings: Yes/No
4. Click **"Create Committee"**
5. View the new committee card in the grid

### Add Members to Committee:
1. Click on a committee card to view details
2. Navigate to the "Members" tab
3. Click **"Add Member"**
4. Select a user from dropdown
5. Set role (member/chair/secretary)
6. Set voting rights
7. Click **"Add Member"**

## Workflow 3: Meeting Lifecycle

### Create a Meeting:
1. Navigate to **Meetings** → **Upcoming** (`/meetings/upcoming`)
2. Click **"Schedule Meeting"**
3. Fill in meeting details:
   - Select Committee
   - Meeting Title
   - Date & Time
   - Meeting Type (Physical/Virtual/Hybrid)
   - Venue (if applicable)
   - Public Meeting: Yes/No
4. Click **"Schedule Meeting"**

### Conduct Meeting:
1. Find your scheduled meeting in the upcoming meetings list
2. Click on the meeting to view details
3. Add agenda items:
   - Go to "Agenda" tab
   - Click "Add Agenda Item"
   - Fill in title, description, allocated time
   - Click "Add"
4. Record attendance:
   - Go to "Attendance" tab
   - Mark present/absent/apologies for each member
5. Track decisions:
   - Go to "Decisions" tab
   - Record decisions made during the meeting
   - Assign responsible persons
   - Set deadlines

### Publish Minutes:
1. After meeting, go to "Minutes" tab
2. Write or upload minutes
3. Request approval from chair
4. Once approved, publish to make visible to public (if public meeting)

## Testing Tips

### For Admins/Clerks:
- You can create committees, add members, schedule meetings
- You can manage all aspects of meetings and agendas
- You can publish documents and minutes

### For Committee Members:
- You can view committees you belong to
- You can see meetings for your committees
- You can view documents and agendas
- Voting rights depend on your membership settings

### For Public Users (not logged in):
- Can view public meetings that are completed
- Can see published agendas and minutes
- Cannot see private/internal information

## Common Issues & Solutions

### "Permission denied" errors:
- Check if user has appropriate role (admin/clerk/secretary)
- Verify user is a member of the committee
- Ensure organization_id matches

### Can't see committees/meetings:
- Verify you're logged in
- Check that items belong to your organization
- For public view, ensure meeting is marked as public

### Onboarding fails:
- Check Supabase authentication is enabled
- Verify the `handle_new_user()` trigger is active
- Check console logs for specific errors

## Database Functions Used

The following security definer functions power these workflows:
- `has_role()` - Check if user has a specific role
- `can_access_organization()` - Verify organization access
- `has_committee_access()` - Check committee membership
- `is_committee_secretary()` - Verify secretary role
- `complete_user_onboarding()` - Handle new user setup
- `assign_admin_role_if_first_user()` - Auto-assign admin

## Security Notes

- All tables have RLS policies enabled
- First user in an organization automatically gets admin role
- Contact information in petitions should be masked in public views
- Admin actions are logged in audit_logs table
- Sensitive data access is tracked

## Next Steps

After successful testing, you may want to:
1. Invite team members via Settings → Users
2. Customize organization branding
3. Set up email notifications
4. Configure Teams notifications (if using Microsoft Teams)
5. Create business processes and workflows
