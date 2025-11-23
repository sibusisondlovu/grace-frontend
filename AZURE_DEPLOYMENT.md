# Azure Marketplace Deployment Guide

## Overview
G.R.A.C.E. (Government Reporting And Committee Execution) is ready for Azure Marketplace deployment with comprehensive committee management, compliance tracking, and governance features.

## Prerequisites
- Active Azure subscription
- Azure AD tenant configured
- Supabase project set up (or use provided instance)

## Configuration

### 1. Environment Variables
The following environment variables must be configured in your Azure deployment:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://ynslelukmmfbcjlfzppa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
VITE_SUPABASE_PROJECT_ID=ynslelukmmfbcjlfzppa

# Email Notifications (Resend)
RESEND_API_KEY=<your-resend-api-key>
```

### 2. Azure AD Authentication Setup
1. Navigate to Azure Portal > Azure Active Directory > App Registrations
2. Create new registration or use existing
3. Configure redirect URIs:
   - Add your deployment URL + `/auth/callback`
   - Add `https://ynslelukmmfbcjlfzppa.supabase.co/auth/v1/callback`

4. In Supabase Dashboard:
   - Go to Authentication > Providers > Azure
   - Enable Azure provider
   - Add your Azure AD Application (client) ID
   - Add your Azure AD Directory (tenant) ID
   - Add client secret from Azure AD

5. Update Site URL in Supabase:
   - Authentication > URL Configuration
   - Set Site URL to your deployment domain
   - Add redirect URLs for your deployment

### 3. Database Setup
The application automatically handles database migrations. Initial setup includes:
- Organizations and multi-tenancy support
- User roles and permissions (RBAC)
- Meeting and committee management tables
- Document storage policies
- Email notification tracking
- Audit logging

### 4. Edge Functions
The following Supabase Edge Functions are automatically deployed:
- `ai-assistant` - AI-powered assistance for committee operations
- `send-notification-email` - Email notifications for meetings and action items
- `teams-notify` - Microsoft Teams integration notifications
- `health-check` - Health check endpoint for monitoring

## Health Check Endpoint
Monitor application health at:
```
https://ynslelukmmfbcjlfzppa.supabase.co/functions/v1/health-check
```

Response format:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-10T12:00:00Z",
  "version": "1.0.0",
  "checks": {
    "database": "healthy",
    "authentication": "healthy",
    "edgeFunctions": "healthy"
  }
}
```

## Security Features

### Data Protection
- **Encryption**: All data encrypted in transit (TLS 1.3) and at rest (AES-256)
- **Row Level Security (RLS)**: Database-level isolation between organizations
- **Role-Based Access Control (RBAC)**: Granular permissions system
- **Audit Logging**: Comprehensive activity tracking

### Compliance
- POPIA (Protection of Personal Information Act) compliant
- GDPR-ready for international deployments
- ISO 27001 security standards alignment
- Microsoft Azure compliance framework adherence

## Subscription Tiers

### Standard Tier
- Up to 10 committees
- Basic reporting and analytics
- Document management (10GB storage)
- Email notifications
- Standard support

### Premium Tier
- Unlimited committees
- Advanced analytics and compliance reporting
- Document management (100GB storage)
- Email and Teams notifications
- Priority support
- Custom branding

### Enterprise Tier
- All Premium features
- Dedicated instance option
- Advanced security features
- Custom integrations
- 24/7 enterprise support
- SLA guarantees
- Custom training

## Monitoring and Logging

### Application Insights Integration
Configure Azure Application Insights for:
- Performance monitoring
- Error tracking
- Usage analytics
- Custom telemetry

### Log Analytics
Edge function logs available in Supabase Dashboard:
- Functions > [function-name] > Logs
- Real-time streaming and search capabilities

## Scaling

### Frontend Scaling
- Static assets served via CDN
- Automatic scaling with Azure App Service
- Global distribution support

### Backend Scaling
- Supabase automatically scales database connections
- Edge functions scale automatically with demand
- Connection pooling enabled by default

## Backup and Disaster Recovery

### Automated Backups
- Daily automated database backups (30-day retention)
- Point-in-time recovery available
- Cross-region replication option for enterprise

### Data Export
Users can export their data in multiple formats:
- CSV export for tables
- PDF export for reports and documents
- Full database export available for administrators

## Support and Maintenance

### Support Channels
- Email: support@grace.gov.za
- Privacy concerns: privacy@grace.gov.za
- Documentation: In-app help and tooltips

### SLA (Enterprise Tier)
- 99.9% uptime guarantee
- < 1 hour response time for critical issues
- < 4 hours for high-priority issues
- < 24 hours for normal priority

## Post-Deployment Checklist

- [ ] Verify Azure AD authentication working
- [ ] Test health check endpoint
- [ ] Confirm email notifications functioning
- [ ] Verify organization creation and isolation
- [ ] Test role-based access control
- [ ] Validate document upload and storage
- [ ] Confirm meeting scheduling and notifications
- [ ] Test compliance reporting
- [ ] Verify audit logging
- [ ] Configure monitoring alerts
- [ ] Set up backup verification
- [ ] Review security settings
- [ ] Test user onboarding flow

## Troubleshooting

### Common Issues

**Authentication fails:**
- Verify Azure AD redirect URIs match deployment URL
- Check Supabase Site URL configuration
- Ensure Azure AD app has correct permissions

**Email notifications not sending:**
- Verify RESEND_API_KEY is configured
- Check edge function logs for errors
- Confirm email addresses are valid

**Health check returns unhealthy:**
- Check Supabase database connectivity
- Verify environment variables are set
- Review edge function deployment status

### Getting Help
For deployment assistance:
1. Check Supabase Dashboard for errors
2. Review edge function logs
3. Contact support with:
   - Deployment timestamp
   - Error messages
   - Health check response
   - Azure subscription ID

## Updating the Application
Updates are deployed through the standard Lovable deployment process:
1. Changes pushed to repository
2. Automatic deployment triggered
3. Zero-downtime deployment
4. Database migrations run automatically
5. Edge functions updated automatically

## Legal and Compliance Links
- Terms of Service: `/terms-of-service`
- Privacy Policy: `/privacy-policy`
- Contact: support@grace.gov.za
