import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AuditLog } from "@/hooks/useAuditLogs";
import { format } from "date-fns";
import { Activity, Database, Edit, Plus, Trash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityLogTableProps {
  logs: AuditLog[] | undefined;
  isLoading: boolean;
  showOrganization?: boolean;
}

export function ActivityLogTable({ logs, isLoading, showOrganization }: ActivityLogTableProps) {
  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'insert':
        return <Plus className="h-3 w-3" />;
      case 'update':
        return <Edit className="h-3 w-3" />;
      case 'delete':
        return <Trash className="h-3 w-3" />;
      default:
        return <Database className="h-3 w-3" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'insert':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatUserName = (log: AuditLog) => {
    if (log.profiles?.first_name && log.profiles?.last_name) {
      return `${log.profiles.first_name} ${log.profiles.last_name}`;
    }
    return log.profiles?.email || 'System';
  };

  const formatTableName = (tableName: string) => {
    return tableName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No activity logs yet</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Activity logs will appear here as users interact with the system
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Table</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} className="hover:bg-muted/50">
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{formatUserName(log)}</span>
                  {log.profiles?.email && (
                    <span className="text-xs text-muted-foreground">{log.profiles.email}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getActionColor(log.action)} className="flex items-center gap-1 w-fit">
                  {getActionIcon(log.action)}
                  {log.action.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium">{formatTableName(log.table_name)}</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {log.record_id && (
                    <span className="text-xs text-muted-foreground">
                      ID: {log.record_id.substring(0, 8)}...
                    </span>
                  )}
                  {log.ip_address && (
                    <span className="text-xs text-muted-foreground">
                      IP: {log.ip_address}
                    </span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
