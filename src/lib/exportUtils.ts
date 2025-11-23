import { AuditLog } from "@/hooks/useAuditLogs";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportAuditLogsToCSV(logs: AuditLog[], filename: string = "audit-logs.csv") {
  const headers = ["Timestamp", "User", "Email", "Action", "Table", "Record ID", "IP Address"];
  
  const rows = logs.map((log) => [
    format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
    log.profiles?.first_name && log.profiles?.last_name
      ? `${log.profiles.first_name} ${log.profiles.last_name}`
      : "System",
    log.profiles?.email || "",
    log.action.toUpperCase(),
    log.table_name,
    log.record_id?.substring(0, 8) || "",
    log.ip_address || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAuditLogsToPDF(logs: AuditLog[], filename: string = "audit-logs.pdf") {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Add title
  doc.setFontSize(18);
  doc.text("Audit Log Report", 14, 20);
  
  // Add generation date
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), "PPpp")}`, 14, 28);
  doc.text(`Total Records: ${logs.length}`, 14, 34);

  // Prepare table data
  const tableData = logs.map((log) => [
    format(new Date(log.created_at), "yyyy-MM-dd HH:mm"),
    log.profiles?.first_name && log.profiles?.last_name
      ? `${log.profiles.first_name} ${log.profiles.last_name}`
      : "System",
    log.action.toUpperCase(),
    log.table_name,
    log.record_id?.substring(0, 8) || "",
    log.ip_address || "",
  ]);

  // Add table
  autoTable(doc, {
    startY: 40,
    head: [["Timestamp", "User", "Action", "Table", "Record ID", "IP Address"]],
    body: tableData,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [14, 165, 233], // Primary color
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 40 },
      4: { cellWidth: 25 },
      5: { cellWidth: 30 },
    },
  });

  doc.save(filename);
}
