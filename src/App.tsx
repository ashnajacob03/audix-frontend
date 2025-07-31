import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Premium from './pages/Premium';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import Messages from './pages/Messages';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Stats from './pages/Stats';
import LikedSongs from './pages/LikedSongs';
import Playlists from './pages/Playlists';
import NotFound from './pages/NotFound';
import GoogleCallback from './pages/GoogleCallback';
import MainLayout from './layout/MainLayout';
import AdminLayout from './layout/AdminLayout';
import AdminRedirectRoute from './components/AdminRedirectRoute';
import { Toaster } from 'react-hot-toast';

// Loading component
const Loading = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-white text-xl">Loading...</div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) return <Loading />;
  
  if (!isSignedIn) {
    console.log('User not signed in, redirecting to login...');
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirect if already signed in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) return <Loading />;
  
  if (isSignedIn) {
    console.log('User already signed in, redirecting to home...');
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route path="/auth/google-callback" element={<GoogleCallback />} />

        {/* Main app routes with Audix layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={
            <AdminRedirectRoute>
              <Home />
            </AdminRedirectRoute>
          } />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/premium" element={<Premium />} />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/stats" 
            element={
              <ProtectedRoute>
                <Stats />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/liked" 
            element={
              <ProtectedRoute>
                <LikedSongs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/playlists" 
            element={
              <ProtectedRoute>
                <Playlists />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin routes with dedicated layout */}
        <Route element={<AdminLayout />}>
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;

