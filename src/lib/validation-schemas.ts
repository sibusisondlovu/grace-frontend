import { z } from 'zod';

// Action Items validation
export const actionItemSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .trim()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
  assigned_to_department: z.string()
    .min(1, 'Department is required'),
  due_date: z.string()
    .optional()
    .refine((date) => !date || new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: 'Due date cannot be in the past'
    }),
  priority: z.enum(['high', 'medium', 'low']),
  status: z.enum(['pending', 'in_progress', 'completed', 'overdue']).default('pending'),
});

// Information Requests validation
export const informationRequestSchema = z.object({
  request_number: z.string()
    .trim()
    .min(1, 'Request number is required')
    .max(50, 'Request number must be less than 50 characters')
    .regex(/^[A-Z0-9\-\/]+$/i, 'Request number can only contain letters, numbers, hyphens, and slashes'),
  request_type: z.enum(['information_request', 'summons', 'section_54', 'section_55']),
  subject: z.string()
    .trim()
    .min(1, 'Subject is required')
    .max(300, 'Subject must be less than 300 characters'),
  request_details: z.string()
    .trim()
    .min(10, 'Request details must be at least 10 characters')
    .max(5000, 'Request details must be less than 5000 characters'),
  addressed_to: z.string()
    .trim()
    .min(1, 'Addressed to is required')
    .max(200, 'Addressed to must be less than 200 characters'),
  addressed_to_dept: z.string()
    .trim()
    .max(200, 'Department name must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  issue_date: z.string()
    .min(1, 'Issue date is required'),
  deadline_date: z.string()
    .min(1, 'Deadline date is required'),
  committee_id: z.string()
    .uuid('Invalid committee selected'),
}).refine((data) => new Date(data.deadline_date) > new Date(data.issue_date), {
  message: 'Deadline date must be after issue date',
  path: ['deadline_date'],
});

// Motions validation
export const motionSchema = z.object({
  motion_number: z.string()
    .trim()
    .min(1, 'Motion number is required')
    .max(50, 'Motion number must be less than 50 characters')
    .regex(/^[A-Z0-9\-\/]+$/i, 'Motion number can only contain letters, numbers, hyphens, and slashes'),
  motion_type: z.enum(['ordinary', 'urgent', 'procedural', 'amendment', 'substantive']),
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(300, 'Title must be less than 300 characters'),
  motion_text: z.string()
    .trim()
    .min(20, 'Motion text must be at least 20 characters')
    .max(10000, 'Motion text must be less than 10,000 characters'),
  notice_date: z.string()
    .min(1, 'Notice date is required'),
  committee_id: z.string()
    .uuid('Invalid committee selected'),
});

// Site Visits validation
export const siteVisitSchema = z.object({
  visit_number: z.string()
    .trim()
    .min(1, 'Visit number is required')
    .max(50, 'Visit number must be less than 50 characters')
    .regex(/^[A-Z0-9\-\/]+$/i, 'Visit number can only contain letters, numbers, hyphens, and slashes'),
  committee_id: z.string()
    .uuid('Invalid committee selected'),
  site_location: z.string()
    .trim()
    .min(1, 'Site location is required')
    .max(300, 'Site location must be less than 300 characters'),
  site_address: z.string()
    .trim()
    .max(500, 'Site address must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  visit_date: z.string()
    .min(1, 'Visit date is required')
    .refine((date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: 'Visit date cannot be in the past'
    }),
  visit_purpose: z.string()
    .trim()
    .min(10, 'Visit purpose must be at least 10 characters')
    .max(2000, 'Visit purpose must be less than 2000 characters'),
  participants: z.array(z.string().uuid())
    .min(1, 'At least one participant is required'),
});

// Document Upload validation
export const documentUploadSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  document_type: z.enum(['agenda', 'minutes', 'report', 'annexure', 'attendance_register']),
  classification: z.enum(['open', 'confidential']),
});

// Report Upload validation
export const reportUploadSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(300, 'Title must be less than 300 characters'),
  description: z.string()
    .trim()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
  report_type: z.enum([
    'annual_report',
    'oversight_report',
    'citizens_report',
    'budget',
    'idp',
    'by_law',
    'policy',
    'notice',
    'other'
  ]),
  category_id: z.string()
    .uuid('Invalid category')
    .optional()
    .or(z.literal('')),
  financial_year: z.string()
    .trim()
    .max(20, 'Financial year must be less than 20 characters')
    .regex(/^\d{4}\/\d{2,4}$|^$/, 'Financial year must be in format YYYY/YY or YYYY/YYYY')
    .optional()
    .or(z.literal('')),
  classification: z.enum(['public', 'internal', 'confidential']),
});
