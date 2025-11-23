import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { BrandingProvider } from "@/components/BrandingProvider";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Committees from "./pages/Committees";
import CommitteeDetail from "./pages/CommitteeDetail";
import Motions from "./pages/Motions";
import InformationRequests from "./pages/InformationRequests";
import SiteVisits from "./pages/SiteVisits";
import UIFWCases from "./pages/UIFWCases";
import MeetingsLayout from "./pages/meetings";
import UpcomingMeetings from "./pages/meetings/UpcomingMeetings";
import PastMeetings from "./pages/meetings/PastMeetings";
import ScheduleMeeting from "./pages/meetings/ScheduleMeeting";
import MeetingDetail from "./pages/meetings/MeetingDetail";
import Actions from "./pages/Actions";
import Voting from "./pages/Voting";
import Members from "./pages/Members";
import Agendas from "./pages/Agendas";
import Auth from "./pages/Auth";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import Oversight from "./pages/Oversight";
import Compliance from "./pages/Compliance";
import SearchPage from "./pages/Search";
import MPACReports from "./pages/oversight/MPACReports";
import AuditCommittee from "./pages/oversight/AuditCommittee";
import Disciplinary from "./pages/oversight/Disciplinary";
import Processes from "./pages/Processes";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Documents from "./pages/Documents";
import DepartmentalDashboard from "./pages/DepartmentalDashboard";
import Organizations from "./pages/admin/Organizations";
import Users from "./pages/admin/Users";
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard";

import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OrganizationProvider>
        <BrandingProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
              <Route path="/committees" element={<ProtectedRoute><Layout><Committees /></Layout></ProtectedRoute>} />
              <Route path="/committees/:id" element={<ProtectedRoute><Layout><CommitteeDetail /></Layout></ProtectedRoute>} />
              <Route path="/motions" element={<ProtectedRoute><Layout><Motions /></Layout></ProtectedRoute>} />
              <Route path="/information-requests" element={<ProtectedRoute><Layout><InformationRequests /></Layout></ProtectedRoute>} />
              <Route path="/site-visits" element={<ProtectedRoute><Layout><SiteVisits /></Layout></ProtectedRoute>} />
              <Route path="/uifw-cases" element={<ProtectedRoute><Layout><UIFWCases /></Layout></ProtectedRoute>} />
              <Route path="/meetings/*" element={<ProtectedRoute><Layout><MeetingsLayout /></Layout></ProtectedRoute>}>
                <Route path="upcoming" element={<UpcomingMeetings />} />
                <Route path="past" element={<PastMeetings />} />
                <Route path="schedule" element={<ScheduleMeeting />} />
                <Route index element={<Navigate to="upcoming" replace />} />
              </Route>
              <Route path="/meeting/:id" element={<ProtectedRoute><Layout><MeetingDetail /></Layout></ProtectedRoute>} />
              <Route path="/actions" element={<ProtectedRoute><Layout><Actions /></Layout></ProtectedRoute>} />
              <Route path="/members" element={<ProtectedRoute><Layout><Members /></Layout></ProtectedRoute>} />
              <Route path="/agendas" element={<ProtectedRoute><Layout><Agendas /></Layout></ProtectedRoute>} />
              <Route path="/voting" element={<ProtectedRoute><Layout><Voting /></Layout></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><Layout><SearchPage /></Layout></ProtectedRoute>} />
              <Route path="/oversight" element={<ProtectedRoute><Layout><Oversight /></Layout></ProtectedRoute>} />
              <Route path="/oversight/mpac" element={<ProtectedRoute><Layout><MPACReports /></Layout></ProtectedRoute>} />
              <Route path="/oversight/audit" element={<ProtectedRoute><Layout><AuditCommittee /></Layout></ProtectedRoute>} />
              <Route path="/oversight/disciplinary" element={<ProtectedRoute><Layout><Disciplinary /></Layout></ProtectedRoute>} />
              <Route path="/compliance" element={<ProtectedRoute><Layout><Compliance /></Layout></ProtectedRoute>} />
              <Route path="/processes" element={<ProtectedRoute><Layout><Processes /></Layout></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><Layout><Documents /></Layout></ProtectedRoute>} />
              <Route path="/departmental-dashboard" element={<ProtectedRoute><Layout><DepartmentalDashboard /></Layout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/organizations" element={<ProtectedRoute><Organizations /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </BrandingProvider>
      </OrganizationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
