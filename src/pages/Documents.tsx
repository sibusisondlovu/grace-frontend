import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocuments } from "@/hooks/useDocuments";
import { useDocumentUpload, useDeleteDocument } from "@/hooks/useDocumentUpload";
import { usePublishDocument } from "@/hooks/usePublishDocument";
import { useReportsLibrary, useDocumentCategories } from "@/hooks/useReportsLibrary";
import { useCanManageReports } from "@/hooks/useUserRole";
import { UploadReportDialog } from "@/components/reports/UploadReportDialog";
import { FileText, Upload, Download, Eye, Trash2, Lock, Unlock, Calendar, User, Search, Filter, ExternalLink } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentUploadSchema } from "@/lib/validation-schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { z } from "zod";

export default function Documents() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterClassification, setFilterClassification] = useState<string>("all");
  
  // Reports tab state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedReportType, setSelectedReportType] = useState<string>('all');
  const [isUploadReportOpen, setIsUploadReportOpen] = useState(false);
  
  const { data: documents, isLoading } = useDocuments();
  const uploadMutation = useDocumentUpload();
  const deleteMutation = useDeleteDocument();
  const publishMutation = usePublishDocument();

  const form = useForm<z.infer<typeof documentUploadSchema>>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      title: '',
      document_type: 'agenda',
      classification: 'open',
    },
  });
  
  // Reports hooks
  const { data: categories } = useDocumentCategories();
  const { data: reports, isLoading: reportsLoading } = useReportsLibrary({
    categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
    financialYear: selectedYear !== 'all' ? selectedYear : undefined,
    reportType: selectedReportType !== 'all' ? selectedReportType : undefined,
    publicationStatus: 'published'
  });
  const { hasRole: canManageReports } = useCanManageReports();

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      form.setError('title', { 
        message: 'Invalid file type. Only PDF, DOC, DOCX, XLS, and XLSX files are allowed.' 
      });
      e.target.value = ''; // Clear the input
      return;
    }

    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > maxSize) {
      form.setError('title', { 
        message: 'File size must be less than 20MB.' 
      });
      e.target.value = ''; // Clear the input
      return;
    }

    form.clearErrors('title');
    setSelectedFile(file);

    // Create preview URL for PDFs
    if (file.type === 'application/pdf') {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handlePreview = () => {
    if (!selectedFile) return;
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  const handleUpload = async (values: z.infer<typeof documentUploadSchema>) => {
    if (!selectedFile) {
      form.setError('title', { message: 'Please select a file' });
      return;
    }

    await uploadMutation.mutateAsync({
      meetingId: "00000000-0000-0000-0000-000000000000", // System-level documents
      file: selectedFile,
      documentType: values.document_type,
      title: values.title,
    });

    // Cleanup
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    setIsUploadOpen(false);
    setSelectedFile(null);
    form.reset();
  };

  const handleDelete = async (documentId: string, filePath?: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      await deleteMutation.mutateAsync({ documentId, filePath });
    }
  };

  const handleTogglePublish = async (documentId: string, currentStatus: boolean) => {
    await publishMutation.mutateAsync({
      documentId,
      published: !currentStatus,
    });
  };

  const filteredDocuments = documents?.filter((doc) => {
    const typeMatch = filterType === "all" || doc.document_type === filterType;
    const classMatch = filterClassification === "all" || 
      (filterClassification === "open" && doc.published) ||
      (filterClassification === "confidential" && !doc.published);
    return typeMatch && classMatch;
  });

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      agenda: "bg-blue-100 text-blue-800",
      minutes: "bg-green-100 text-green-800",
      report: "bg-purple-100 text-purple-800",
      annexure: "bg-orange-100 text-orange-800",
      attendance_register: "bg-gray-100 text-gray-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const financialYears = Array.from(
    new Set(reports?.map(r => r.financial_year).filter(Boolean))
  ).sort().reverse();

  const filteredReports = reports?.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      annual_report: 'Annual Report',
      oversight_report: 'Oversight Report',
      citizens_report: 'Citizens Report',
      budget: 'Budget Document',
      idp: 'IDP',
      by_law: 'By-Law',
      policy: 'Policy',
      notice: 'Notice',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'public':
        return 'bg-green-500';
      case 'internal':
        return 'bg-yellow-500';
      case 'confidential':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Document Management</h1>
            <p className="text-muted-foreground">
              Manage agendas, minutes, reports, annexures and all legislative documents
            </p>
          </div>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Upload a new legislative document with proper classification
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleUpload)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Title *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter document title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="document_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="agenda">Agenda</SelectItem>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="report">Report</SelectItem>
                            <SelectItem value="annexure">Annexure</SelectItem>
                            <SelectItem value="attendance_register">Attendance Register</SelectItem>
                          </SelectContent>
                        </Select>
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
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="confidential">Confidential (In-Committee)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <Label htmlFor="file">File *</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                    />
                    {selectedFile && (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handlePreview}
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview File
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit"
                    disabled={!selectedFile || uploadMutation.isPending}
                    className="w-full"
                  >
                    {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Preview Dialog */}
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Document Preview</DialogTitle>
                <DialogDescription>
                  Preview of {selectedFile?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {selectedFile && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">File Name:</span> {selectedFile.name}
                      </div>
                      <div>
                        <span className="font-medium">File Size:</span> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      <div>
                        <span className="font-medium">File Type:</span> {selectedFile.type || 'Unknown'}
                      </div>
                      <div>
                        <span className="font-medium">Last Modified:</span> {new Date(selectedFile.lastModified).toLocaleDateString()}
                      </div>
                    </div>

                    {previewUrl && selectedFile.type === 'application/pdf' ? (
                      <div className="border rounded-lg overflow-hidden" style={{ height: '500px' }}>
                        <iframe
                          src={previewUrl}
                          className="w-full h-full"
                          title="PDF Preview"
                        />
                      </div>
                    ) : (
                      <div className="border rounded-lg p-8 text-center bg-muted">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Preview not available for {selectedFile.type.includes('word') ? 'Word' : 'Excel'} documents.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          The file will be uploaded and can be downloaded later for viewing.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={closePreview}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="agendas">Agendas</TabsTrigger>
            <TabsTrigger value="minutes">Minutes</TabsTrigger>
            <TabsTrigger value="reports">Reports Library</TabsTrigger>
            <TabsTrigger value="annexures">Annexures</TabsTrigger>
          </TabsList>

          <div className="flex gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="agenda">Agendas</SelectItem>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="report">Reports</SelectItem>
                <SelectItem value="annexure">Annexures</SelectItem>
                <SelectItem value="attendance_register">Attendance Registers</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterClassification} onValueChange={setFilterClassification}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="confidential">Confidential</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">Loading documents...</p>
                </CardContent>
              </Card>
            ) : filteredDocuments && filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <CardTitle className="text-lg">{doc.title}</CardTitle>
                        </div>
                        <CardDescription className="space-y-2">
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge className={getDocumentTypeColor(doc.document_type)}>
                              {doc.document_type.replace("_", " ").toUpperCase()}
                            </Badge>
                            <Badge variant={doc.published ? "default" : "secondary"}>
                              {doc.published ? (
                                <><Unlock className="h-3 w-3 mr-1" /> Open</>
                              ) : (
                                <><Lock className="h-3 w-3 mr-1" /> Confidential</>
                              )}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTogglePublish(doc.id, doc.published)}
                        >
                          {doc.published ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(doc.id, doc.file_path || undefined)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    No documents found. Upload your first document to get started.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">Reports Library</h2>
                <p className="text-muted-foreground">
                  City of Johannesburg official reports and documents
                </p>
              </div>
              {canManageReports && (
                <Button onClick={() => setIsUploadReportOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Report
                </Button>
              )}
            </div>

            <UploadReportDialog
              open={isUploadReportOpen}
              onOpenChange={setIsUploadReportOpen}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Financial Year</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {financialYears.map((year) => (
                          <SelectItem key={year} value={year!}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Report Type</Label>
                    <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="annual_report">Annual Reports</SelectItem>
                        <SelectItem value="oversight_report">Oversight Reports</SelectItem>
                        <SelectItem value="citizens_report">Citizens Reports</SelectItem>
                        <SelectItem value="budget">Budget Documents</SelectItem>
                        <SelectItem value="idp">IDP Documents</SelectItem>
                        <SelectItem value="policy">Policies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {reportsLoading ? (
              <div className="text-center py-12">Loading reports...</div>
            ) : filteredReports && filteredReports.length > 0 ? (
              <div className="grid gap-4">
                {filteredReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-primary mt-1" />
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">{report.title}</h3>
                              {report.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {report.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">
                              {getReportTypeLabel(report.report_type)}
                            </Badge>
                            {report.financial_year && (
                              <Badge variant="secondary">
                                FY {report.financial_year}
                              </Badge>
                            )}
                            {report.category && (
                              <Badge variant="secondary">
                                {report.category.name}
                              </Badge>
                            )}
                            <Badge className={getClassificationColor(report.classification)}>
                              {report.classification}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {report.published_date && (
                              <span>
                                Published: {format(new Date(report.published_date), 'PPP')}
                              </span>
                            )}
                            {report.committee && (
                              <>
                                <span>•</span>
                                <span>{report.committee.name}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {report.document_url && (
                            <Button
                              variant="default"
                              size="sm"
                              asChild
                            >
                              <a href={report.document_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Report
                              </a>
                            </Button>
                          )}
                          {report.file_path && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                const { data, error } = await supabase.storage
                                  .from('reports-library')
                                  .download(report.file_path!);
                                
                                if (error) {
                                  console.error('Download error:', error);
                                  return;
                                }
                                
                                const url = URL.createObjectURL(data);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = report.title + '.pdf';
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-semibold mb-2">No reports found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search terms
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
  );
}
