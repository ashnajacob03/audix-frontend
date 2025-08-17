# Admin Dashboard

This directory contains the admin dashboard components for the Audix music streaming platform.

## Components

### UserManagement.tsx
A comprehensive user management interface that allows admins to:
- View all users with pagination and search functionality
- Filter users by account type, status, and other criteria
- Edit user details including account type and admin privileges
- View user activity and engagement metrics

### Analytics.tsx
Advanced analytics dashboard featuring:
- Real-time user growth metrics
- Revenue and engagement analytics
- Interactive charts and visualizations
- Time-based filtering (24h, 7d, 30d, 90d)
- Export capabilities for reports

## Features

### Dashboard Overview
- Real-time statistics and metrics
- Quick action buttons for common admin tasks
- System status monitoring
- Recent activity feed

### User Management
- **User Search**: Search users by name, email, or other criteria
- **Account Management**: Update user account types (Free, Premium, Family, Student)
- **Admin Controls**: Grant or revoke admin privileges
- **User Status**: Monitor user activity and account status
- **Bulk Operations**: Perform actions on multiple users (coming soon)

### Analytics & Reporting
- **User Growth**: Track new user registrations and growth trends
- **Engagement Metrics**: Monitor user activity and session data
- **Revenue Analytics**: Track subscription revenue and conversion rates
- **Content Performance**: Analyze music streaming and content metrics
- **Export Reports**: Generate and download detailed reports

### System Monitoring
- **Health Checks**: Monitor system services and uptime
- **Performance Metrics**: Track server response times and resource usage
- **Error Logging**: View system logs and error reports
- **Real-time Alerts**: Get notified of system issues

## API Endpoints

The admin dashboard uses the following API endpoints:

### Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/analytics` - Get detailed analytics data
- `GET /api/admin/system-status` - Get system health status

### User Management
- `GET /api/admin/users` - Get paginated user list with filters
- `PUT /api/admin/users/:userId` - Update user details
- `DELETE /api/admin/users/:userId` - Deactivate user account

### System Management
- `GET /api/admin/logs` - Get system logs
- `POST /api/admin/broadcast` - Send broadcast notifications

## Setup Instructions

### 1. Make a User Admin
To access the admin dashboard, a user must have admin privileges. Use the provided script:

```bash
cd audix-backend
node scripts/makeAdmin.js <user-email>
```

### 2. Access Admin Dashboard
1. Log in with an admin account
2. Navigate to `/admin` in the application
3. The system will automatically verify admin access

### 3. Admin Authentication
The admin dashboard uses middleware to verify admin access:
- Checks if user is authenticated
- Verifies `isAdmin` flag in user document
- Redirects non-admin users to home page

## Security Features

- **Role-based Access Control**: Only users with `isAdmin: true` can access admin features
- **API Protection**: All admin endpoints are protected with authentication middleware
- **Audit Logging**: All admin actions are logged for security purposes
- **Input Validation**: All user inputs are validated and sanitized

## Future Enhancements

### Planned Features
- **Content Management**: Music upload and playlist management
- **Advanced Analytics**: Machine learning insights and predictions
- **User Communication**: In-app messaging and notification system
- **Bulk Operations**: Mass user management and data import/export
- **Advanced Reporting**: Custom report builder and scheduled reports

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live data updates
- **Caching**: Redis integration for improved performance
- **Advanced Search**: Elasticsearch integration for better user search
- **Mobile Admin App**: React Native admin application

## Troubleshooting

### Common Issues

1. **Access Denied Error**
   - Ensure user has `isAdmin: true` in database
   - Check authentication token is valid
   - Verify user is logged in

2. **API Errors**
   - Check server logs for detailed error messages
   - Verify database connection
   - Ensure all required environment variables are set

3. **Performance Issues**
   - Monitor database query performance
   - Check server resource usage
   - Consider implementing caching for frequently accessed data

### Support
For technical support or feature requests, please contact the development team or create an issue in the project repository. 