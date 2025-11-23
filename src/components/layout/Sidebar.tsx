import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Building2,
  Calendar,
  Users,
  FileText,
  CheckSquare,
  Vote,
  Eye,
  Gavel,
  BarChart3,
  Settings,
  ChevronDown,
  Menu,
  X,
  Workflow,
  Scale,
  Mail,
  FolderOpen,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import cojLogo from "@/assets/coj-logo.png";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { useOrganization } from "@/hooks/useOrganizations";
import { useOrganizationBranding } from "@/hooks/useOrganizationBranding";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
  },
  {
    name: "Committees",
    href: "/committees",
    icon: Building2,
    children: [
      { name: "All Committees", href: "/committees" },
      { name: "Council", href: "/committees/council" },
      { name: "Section 79", href: "/committees/section79" },
      { name: "MPAC", href: "/committees/mpac" },
      { name: "Advisory", href: "/committees/advisory" },
    ]
  },
  {
    name: "Meetings",
    href: "/meetings",
    icon: Calendar,
    children: [
      { name: "Upcoming", href: "/meetings/upcoming" },
      { name: "Past Meetings", href: "/meetings/past" },
      { name: "Schedule Meeting", href: "/meetings/schedule" },
    ]
  },
  {
    name: "Members",
    href: "/members",
    icon: Users,
  },
  {
    name: "Agendas",
    href: "/agendas",
    icon: FileText,
  },
  {
    name: "Actions",
    href: "/actions",
    icon: CheckSquare,
  },
  {
    name: "Voting",
    href: "/voting",
    icon: Vote,
  },
  {
    name: "Oversight",
    href: "/oversight",
    icon: Eye,
    children: [
      { name: "MPAC Reports", href: "/oversight/mpac" },
      { name: "Audit Committee", href: "/oversight/audit" },
      { name: "Disciplinary", href: "/oversight/disciplinary" },
      { name: "UIFW Cases", href: "/uifw-cases" },
      { name: "Info Requests", href: "/information-requests" },
      { name: "Site Visits", href: "/site-visits" },
    ]
  },
  {
    name: "Legislative",
    href: "/motions",
    icon: Scale,
    children: [
      { name: "Motions", href: "/motions" },
    ]
  },
  {
    name: "Compliance",
    href: "/compliance",
    icon: Gavel,
  },
  {
    name: "Departmental",
    href: "/departmental-dashboard",
    icon: Workflow,
  },
  {
    name: "Processes",
    href: "/processes",
    icon: Workflow,
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FolderOpen,
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const { selectedOrganizationId, isSuperAdmin } = useOrganizationContext();
  const { data: selectedOrg } = useOrganization(selectedOrganizationId);
  
  // Apply organization branding
  useOrganizationBranding();

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const isActiveRoute = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Organization Header */}
        <div className="p-6 border-b bg-gradient-primary">
          <div className="flex items-center justify-center">
            <div className="h-28 w-28 rounded bg-primary-foreground/10 p-2 flex items-center justify-center">
              {selectedOrg?.logo_url ? (
                <img 
                  src={selectedOrg.logo_url} 
                  alt={selectedOrg.name} 
                  className="h-24 w-24 object-contain" 
                />
              ) : (
                <img src={cojLogo} alt="Logo" className="h-24 w-24 object-contain" />
              )}
            </div>
          </div>
          {isSuperAdmin && selectedOrg && (
            <div className="mt-4 text-center">
              <div className="px-3 py-2 bg-primary-foreground/20 rounded-md backdrop-blur-sm">
                <p className="text-xs text-primary-foreground/70 font-medium">
                  Current Organization
                </p>
                <p className="text-sm text-primary-foreground font-semibold truncate">
                  {selectedOrg.name}
                </p>
                <p className="text-xs text-primary-foreground/60 mt-1">
                  {selectedOrg.subscription_tier} • {selectedOrg.subscription_status}
                </p>
              </div>
            </div>
          )}
        </div>

        <nav className="p-4 space-y-2 h-full overflow-y-auto" data-tour="sidebar">
          {/* Super Admin Dashboard - Only for Super Admins */}
          {isSuperAdmin && (
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors mb-2",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent/50 hover:bg-accent"
              )}
              onClick={() => setIsOpen(false)}
            >
              <Shield className="h-4 w-4" />
              <span>Super Admin</span>
            </NavLink>
          )}
          
          {navigation.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <div>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between font-medium",
                      isActiveRoute(item.href) && "bg-primary/10 text-primary"
                    )}
                    onClick={() => toggleExpanded(item.name)}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      expandedItems.includes(item.name) && "rotate-180"
                    )} />
                  </Button>
                  {expandedItems.includes(item.name) && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.name}
                          to={child.href}
                          className={({ isActive }) => cn(
                            "block px-3 py-2 text-sm rounded-md transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {child.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.href}
                  className={({ isActive }) => cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setIsOpen(false)}
                  data-tour={
                    item.name === 'Committees' ? 'committees-link' :
                    item.name === 'Meetings' ? 'meetings-link' :
                    item.name === 'Actions' ? 'actions-link' :
                    undefined
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </NavLink>
              )}
            </div>
          ))}

          <div className="pt-4 mt-4 border-t space-y-2">
            {isSuperAdmin && (
              <>
                <NavLink
                  to="/admin/organizations"
                  className={({ isActive }) => cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Organizations</span>
                </NavLink>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) => cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <Users className="h-4 w-4" />
                  <span>User Management</span>
                </NavLink>
              </>
            )}
            <NavLink
              to="/settings"
              className={({ isActive }) => cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </NavLink>
          </div>
        </nav>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}