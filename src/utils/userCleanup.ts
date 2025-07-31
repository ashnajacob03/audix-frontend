/**
 * Utility functions for user cleanup operations
 * Use these functions for development/testing purposes only
 */

interface CleanupResponse {
  success: boolean;
  message: string;
  details?: {
    mongoUserDeleted: boolean;
    clerkUserDeleted: boolean;
    email: string;
  };
  error?: string;
}

/**
 * Delete a user from both MongoDB and Clerk systems
 * WARNING: This is for development/testing only
 * @param email - The email address of the user to delete
 * @returns Promise with cleanup results
 */
export const cleanupUser = async (email: string): Promise<CleanupResponse> => {
  try {
    const response = await fetch(`http://localhost:3002/api/auth/cleanup-user/${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Cleanup failed');
    }

    return data;
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return {
      success: false,
      message: error.message || 'Failed to cleanup user',
      error: error.message
    };
  }
};

/**
 * Check if a user exists in the system before attempting signup
 * @param email - The email address to check
 * @returns Promise with existence check results
 */
export const checkUserExists = async (email: string): Promise<{ exists: boolean; message?: string }> => {
  try {
    // Try to signup with a dummy request to see if email exists
    const response = await fetch('http://localhost:3002/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: email.trim(),
        password: 'TempPassword123!'
      }),
    });

    const data = await response.json();
    
    if (response.status === 409) {
      // User exists
      return { exists: true, message: data.message };
    }
    
    // If we get here, the user doesn't exist (or there's another error)
    return { exists: false };
  } catch (error: any) {
    console.error('Check user exists error:', error);
    return { exists: false, message: 'Error checking user existence' };
  }
};

// Development helper function to log cleanup instructions
export const logCleanupInstructions = (email: string) => {
  console.log(`
🧹 USER CLEANUP INSTRUCTIONS
============================

If you're getting "email already exists" errors, run this in your browser console:

// Method 1: Use the cleanup utility
import { cleanupUser } from './utils/userCleanup';
cleanupUser('${email}').then(result => console.log(result));

// Method 2: Manual API call
fetch('http://localhost:3002/api/auth/cleanup-user/${encodeURIComponent(email)}', {
  method: 'DELETE'
}).then(r => r.json()).then(console.log);

// Method 3: Check if user exists first
import { checkUserExists } from './utils/userCleanup';
checkUserExists('${email}').then(result => console.log(result));

============================
  `);
};
