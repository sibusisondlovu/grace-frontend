import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X, Download, FileText, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useUsers } from "@/hooks/useUsers";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AuditLogFilterState {
  startDate: Date | undefined;
  endDate: Date | undefined;
  userId: string;
  actionType: string;
  organizationId: string;
  tableName: string;
}

interface AuditLogFiltersProps {
  filters: AuditLogFilterState;
  onFiltersChange: (filters: AuditLogFilterState) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export function AuditLogFilters({
  filters,
  onFiltersChange,
  onExportCSV,
  onExportPDF,
}: AuditLogFiltersProps) {
  const { data: organizations } = useOrganizations();
  const { data: users } = useUsers();

  const activeFilterCount = [
    filters.startDate,
    filters.endDate,
    filters.userId !== "all",
    filters.actionType !== "all",
    filters.organizationId !== "all",
    filters.tableName !== "all",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onFiltersChange({
      startDate: undefined,
      endDate: undefined,
      userId: "all",
      actionType: "all",
      organizationId: "all",
      tableName: "all",
    });
  };

  const actionTypes = ["INSERT", "UPDATE", "DELETE"];
  const tableNames = [
    "profiles",
    "organizations",
    "committees",
    "meetings",
    "action_items",
    "decisions_register",
    "meeting_documents",
    "subscriptions",
  ];

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount} active</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExportCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-xs">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate ? format(filters.startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.startDate}
                onSelect={(date) =>
                  onFiltersChange({ ...filters, startDate: date })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.endDate ? format(filters.endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.endDate}
                onSelect={(date) =>
                  onFiltersChange({ ...filters, endDate: date })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Action Type */}
        <div className="space-y-2">
          <Label className="text-xs">Action Type</Label>
          <Select
            value={filters.actionType}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, actionType: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {actionTypes.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table Name */}
        <div className="space-y-2">
          <Label className="text-xs">Table</Label>
          <Select
            value={filters.tableName}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, tableName: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All tables" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tables</SelectItem>
              {tableNames.map((table) => (
                <SelectItem key={table} value={table}>
                  {table.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Organization */}
        <div className="space-y-2">
          <Label className="text-xs">Organization</Label>
          <Select
            value={filters.organizationId}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, organizationId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All organizations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizations</SelectItem>
              {organizations?.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* User */}
        <div className="space-y-2">
          <Label className="text-xs">User</Label>
          <Select
            value={filters.userId}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, userId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users?.map((user) => (
                <SelectItem key={user.user_id} value={user.user_id}>
                  {user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
