# Security and Segregation of Duties Guide

This document outlines the security measures and access control implemented in the system.

## Access Control Model

### 1. Role-Based Access Control (RBAC)

The system implements a hierarchical role structure:

#### Super Admin
- **Access**: All organizations and all data
- **Permissions**: Full system access, can manage organizations
- **Use Case**: System administrators

#### Admin
- **Access**: Their organization's data only
- **Permissions**: 
  - Manage users within their organization
  - Create/edit/delete committees
  - Manage all meetings and documents
  - Access all committees in their organization
- **Use Case**: Organization administrators

#### Committee Roles
- **Chair/Deputy Chair**: Full access to their committee
- **Member**: Read access to committee data, limited write access
- **Clerk**: Administrative access to committee meetings and documents
- **Legal/CFO**: Specialized access based on committee type

#### Public
- **Access**: Public meetings and published documents only
- **Permissions**: Read-only access to public information

### 2. Organization-Level Data Segregation

**Multi-Tenancy**: Each organization's data is completely isolated.

- Users can only access data from their organization
- All queries automatically filter by `organization_id`
- Super admins can access all organizations
- Admins are restricted to their own organization

**Implementation**:
- Automatic filtering in all database queries
- Organization ID enforced on insert operations
- Cross-organization access blocked

### 3. Committee-Level Access Control

**Committee Membership**: Users can only access committees they belong to.

- Regular users see only committees they're members of
- Admins see all committees in their organization
- Committee-specific roles grant additional permissions
- Access verified before any committee-related operation

**Protected Resources**:
- Meetings
- Agenda items
- Action items
- Committee members
- Committee documents

### 4. Operation-Level Permissions

#### Read Operations (GET)
- Filtered by organization and committee membership
- Public data accessible to all authenticated users
- Confidential data requires appropriate role

#### Write Operations (POST/PATCH)
- Organization ID automatically assigned
- Committee access verified before insert/update
- Admin-only tables require admin role:
  - `user_roles`
  - `organizations`
  - `committees`
  - `users`
  - `profiles`

#### Delete Operations (DELETE)
- Same restrictions as write operations
- Additional verification of record ownership
- Audit logging for all deletions

## Security Features

### 1. Authentication
- JWT-based authentication
- Token expiration (configurable, default 7 days)
- Secure password hashing (bcrypt)

### 2. Authorization Middleware
- `authenticate`: Verifies JWT token
- `loadUserContext`: Loads user roles and permissions
- `hasRole`: Checks for specific roles
- `isAdmin`: Verifies admin access
- `hasOrganizationAccess`: Verifies organization access
- `checkCommitteeAccess`: Verifies committee access

### 3. SQL Injection Protection
- Parameterized queries for all database operations
- Table name sanitization
- Input validation

### 4. Audit Logging
All sensitive operations are logged:
- User ID
- Action type (create, update, delete, view, export)
- Table name
- Record ID
- Changes made (for updates)
- Timestamp

**Audited Operations**:
- User management
- Role assignments
- Committee management
- Meeting creation/modification
- Document operations
- Action item changes

## Access Control Matrix

| Resource | Public | Member | Chair | Clerk | Admin | Super Admin |
|----------|--------|--------|-------|-------|-------|-------------|
| Public Meetings | ✅ Read | ✅ Read | ✅ Read | ✅ Read | ✅ Read | ✅ Read |
| Own Committee Data | ❌ | ✅ Read | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Other Committees | ❌ | ❌ | ❌ | ❌ | ✅ Org Only | ✅ All |
| User Management | ❌ | ❌ | ❌ | ❌ | ✅ Org Only | ✅ All |
| Role Assignment | ❌ | ❌ | ❌ | ❌ | ✅ Org Only | ✅ All |
| Organization Settings | ❌ | ❌ | ❌ | ❌ | ✅ Own Org | ✅ All |

## Best Practices

### For Administrators
1. **Principle of Least Privilege**: Assign minimum necessary roles
2. **Regular Audits**: Review audit logs regularly
3. **Role Reviews**: Periodically review user roles and access
4. **Secure Credentials**: Use strong passwords and rotate JWT secrets

### For Developers
1. **Always Use Middleware**: Apply authentication and authorization middleware
2. **Verify Access**: Check committee/organization access before operations
3. **Log Sensitive Operations**: Use audit logging for important changes
4. **Test Access Control**: Verify restrictions work as expected

### For Users
1. **Report Suspicious Activity**: Contact administrators if you see unauthorized access
2. **Secure Your Account**: Use strong passwords
3. **Understand Your Role**: Know what data you can access

## Compliance

This access control model supports:
- **Separation of Duties**: Different roles for different functions
- **Data Isolation**: Organization and committee-level segregation
- **Audit Trail**: Complete logging of sensitive operations
- **Access Reviews**: Ability to review and audit user access

## Troubleshooting Access Issues

### "Access denied" errors
1. Verify user has correct role assigned
2. Check organization membership
3. Verify committee membership for committee-specific resources
4. Check if operation requires admin access

### "User context not loaded" errors
1. Ensure authentication middleware is applied
2. Verify JWT token is valid
3. Check user exists in database

### Cross-organization access attempts
- Normal users: Automatically blocked
- Admins: Can only access their organization
- Super admins: Can access all organizations

## Security Checklist

- [x] Authentication implemented (JWT)
- [x] Role-based access control
- [x] Organization-level data segregation
- [x] Committee-level access control
- [x] SQL injection protection
- [x] Audit logging
- [x] Admin-only operations protected
- [x] Input validation
- [x] Parameterized queries

