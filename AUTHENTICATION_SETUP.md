# Authentication Setup Guide

This guide explains how to set up the professional login and signup pages with Google Sign-In integration.

## Features

✅ **Professional Login Page** - Clean, modern design with Spotify-inspired dark theme
✅ **Professional Signup Page** - Complete registration form with password strength indicator
✅ **Google Sign-In Integration** - One-click authentication with Google
✅ **Forgot Password Page** - Password reset functionality
✅ **Authentication Context** - Global state management for user authentication
✅ **Responsive Design** - Works perfectly on all devices
✅ **Form Validation** - Client-side validation with user-friendly error messages
✅ **Password Security** - Password strength indicator and show/hide toggle

## Pages Structure

```
src/
├── pages/
│   ├── Login.tsx          # Professional login page
│   ├── Signup.tsx         # Professional signup page
│   ├── ForgotPassword.tsx # Password reset page
│   └── index.ts           # Page exports
├── contexts/
│   └── AuthContext.tsx    # Authentication state management
├── utils/
│   └── googleAuth.ts      # Google OAuth integration
└── components/
    └── TopNavbar.tsx      # Updated with auth state
```

## Setup Instructions

### 1. Install Dependencies

The following packages are already installed:
- `react-router-dom` - For navigation between pages
- `@types/react-router-dom` - TypeScript types for React Router

### 2. Google OAuth Setup

To enable Google Sign-In, you need to:

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google+ API**:
   - In the Google Cloud Console, go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add your domain to "Authorized JavaScript origins" (e.g., `http://localhost:5175`)

4. **Update the Client ID**:
   - Open `src/utils/googleAuth.ts`
   - Replace `'your-google-client-id-here'` with your actual Google Client ID

### 3. Navigation

The login button in the top navigation bar will now navigate to the login page. Users can:
- Click "Log in" to go to the login page
- Navigate to signup from the login page
- Use "Forgot password?" link for password reset
- Sign in with Google using the Google button

### 4. Authentication Flow

1. **Login Process**:
   - User enters email/password OR clicks Google Sign-In
   - On successful authentication, user is redirected to home page
   - User state is managed globally via AuthContext

2. **Signup Process**:
   - User fills out registration form with validation
   - Password strength is indicated in real-time
   - Terms and conditions agreement required
   - Google Sign-Up option available

3. **User State Management**:
   - Authentication state persists across page refreshes
   - User information stored in localStorage
   - Global auth context provides user data to all components

## Customization

### Styling
The pages use Tailwind CSS with a Spotify-inspired dark theme:
- Primary color: `#1db954` (Spotify green)
- Background: Dark gradients
- Cards: Dark with subtle borders
- Hover effects and smooth transitions

### Form Validation
- Email validation
- Password strength checking
- Confirm password matching
- Required field validation
- Terms agreement validation

### Google Sign-In Customization
You can customize the Google Sign-In button appearance and behavior in `src/utils/googleAuth.ts`.

## Security Notes

1. **Client ID**: Keep your Google Client ID secure and don't commit it to public repositories
2. **Token Handling**: In production, implement proper token validation on your backend
3. **HTTPS**: Always use HTTPS in production for OAuth flows
4. **Session Management**: Consider implementing proper session management with secure cookies

## Testing

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5175/`
3. Click the "Log in" button in the top navigation
4. Test the login, signup, and forgot password flows
5. Test Google Sign-In (requires proper OAuth setup)

## Production Deployment

Before deploying to production:

1. Update the Google OAuth authorized origins with your production domain
2. Implement backend authentication validation
3. Set up proper session management
4. Configure HTTPS
5. Update any hardcoded URLs or client IDs

## Troubleshooting

**Google Sign-In not working?**
- Check that your Client ID is correct
- Verify authorized origins in Google Cloud Console
- Check browser console for errors

**Styling issues?**
- Ensure Tailwind CSS is properly configured
- Check that all required classes are available

**Navigation not working?**
- Verify React Router is properly set up
- Check that all routes are defined in App.tsx