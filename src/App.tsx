import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useCustomAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { AudioPlayerProvider } from './contexts/AudioPlayerContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Premium from './pages/Premium';
import CancelPremium from './pages/CancelPremium';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import Messages from './pages/Messages';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import PaymentInvoices from './pages/PaymentInvoices';
import SettingsMenu from './pages/SettingsMenu';
import Stats from './pages/Stats';
import LikedSongs from './pages/LikedSongs';
import Playlists from './pages/Playlists';
import NotFound from './pages/NotFound';
import Downloads from './pages/Downloads';
import Artists from './pages/Artists';
import ArtistProfile from './pages/ArtistProfile';
import ArtistDashboard from './pages/ArtistDashboard';
import Song from './pages/Song';

import MainLayout from './layout/MainLayout';
import AdminLayout from './layout/AdminLayout';
import ArtistLayout from './layout/ArtistLayout';
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
  const { isAuthenticated, isLoading } = useCustomAuth();

  if (isLoading) return <Loading />;

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login...');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if already signed in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useCustomAuth();

  if (isLoading) return <Loading />;

  if (isAuthenticated) {
    console.log('User already authenticated, redirecting to home...');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AudioPlayerProvider>
      <SocketProvider>
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
          path="/verify-otp"
          element={<VerifyOTP />}
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
          element={<ResetPassword />}
        />


        {/* Main app routes with Audix layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={
            <AdminRedirectRoute>
              <Home />
            </AdminRedirectRoute>
          } />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/song/:id" element={<Song />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/artist/:name" element={<ArtistProfile />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/downloads" element={
            <ProtectedRoute>
              <Downloads />
            </ProtectedRoute>
          } />
          <Route path="/cancel-premium" element={
            <ProtectedRoute>
              <CancelPremium />
            </ProtectedRoute>
          } />
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
            path="/settings-menu"
            element={
              <ProtectedRoute>
                <SettingsMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/PaymentInvoices"
            element={
              <ProtectedRoute>
                <PaymentInvoices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/invoices"
            element={
              <ProtectedRoute>
                <PaymentInvoices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/paymentinoice"
            element={
              <ProtectedRoute>
                <PaymentInvoices />
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

        {/* Artist routes with dedicated layout */}
        <Route element={<ArtistLayout />}>
          <Route
            path="/artist"
            element={
              <ProtectedRoute>
                <ArtistDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
      <Toaster />
        </SocketProvider>
      </AudioPlayerProvider>
  );
}

export default App;

