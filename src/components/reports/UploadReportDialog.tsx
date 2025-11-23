import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateReport, useDocumentCategories } from "@/hooks/useReportsLibrary";
import { useCanManageReports } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Upload, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reportUploadSchema } from "@/lib/validation-schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { z } from "zod";

interface UploadReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadReportDialog({ open, onOpenChange }: UploadReportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: categories } = useDocumentCategories();
  const createReport = useCreateReport();
  const { hasRole: canManageReports, isLoading: checkingRole } = useCanManageReports();

  const form = useForm<z.infer<typeof reportUploadSchema>>({
    resolver: zodResolver(reportUploadSchema),
    defaultValues: {
      title: '',
      description: '',
      report_type: 'annual_report',
      category_id: '',
      financial_year: '',
      classification: 'public',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (values: z.infer<typeof reportUploadSchema>) => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('reports-library')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create report record (storage bucket is now private, access via RLS)
      await createReport.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        report_type: values.report_type,
        category_id: values.category_id || undefined,
        financial_year: values.financial_year || undefined,
        classification: values.classification,
        file_path: filePath,
        document_url: null, // No public URL anymore
        file_size: file.size,
        publication_status: 'published',
        published_date: new Date().toISOString().split('T')[0],
      });

      toast.success("Report uploaded successfully");
      
      // Reset form
      setFile(null);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload report");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Report</DialogTitle>
          <DialogDescription>
            Upload a PDF report to the library with proper classification and metadata
          </DialogDescription>
        </DialogHeader>

        {!canManageReports && !checkingRole && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to upload reports. Only Admins, Coordinators, and Clerks can upload documents.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpload)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Annual Report 2023/24" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Brief description of the report" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="report_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="annual_report">Annual Report</SelectItem>
                        <SelectItem value="oversight_report">Oversight Report</SelectItem>
                        <SelectItem value="citizens_report">Citizens Report</SelectItem>
                        <SelectItem value="budget">Budget Document</SelectItem>
                        <SelectItem value="idp">IDP</SelectItem>
                        <SelectItem value="by_law">By-Law</SelectItem>
                        <SelectItem value="policy">Policy</SelectItem>
                        <SelectItem value="notice">Notice</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="financial_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Financial Year</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 2023/24" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classification *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="confidential">Confidential</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel htmlFor="file">PDF File *</FormLabel>
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
              />
              {file && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!file || isUploading || !canManageReports}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload Report"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}