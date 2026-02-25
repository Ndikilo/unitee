
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/NewAuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminRegister from "./pages/AdminRegister";
import Dashboard from "./pages/Dashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import OrganizerDashboardEnhanced from "./pages/OrganizerDashboardEnhanced";
import AdminDashboard from "./pages/AdminDashboard";
import RoleBasedDashboard from "./pages/RoleBasedDashboard";
import NotFound from "./pages/NotFound";
import AuthSuccess from "./pages/AuthSuccess";
import BackendLogin from "@/components/BackendLogin";
import Opportunities from "./pages/Opportunities";
import EmailVerification from "./pages/EmailVerification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import MyOpportunities from "./pages/MyOpportunities";
import Communities from "./pages/Communities";
import CommunityDetail from "./pages/CommunityDetail";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <LanguageProvider>
              <AuthProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/admin-register" element={<AdminRegister />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/verify-email/:token" element={<EmailVerification />} />
                  <Route path="/opportunities" element={<Opportunities />} />
                  <Route path="/my-opportunities" element={<MyOpportunities />} />
                  <Route path="/communities" element={<Communities />} />
                  <Route path="/community/:id" element={<CommunityDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/dashboard" element={<RoleBasedDashboard />} />
                  <Route path="/volunteer-dashboard" element={<Dashboard />} />
                  <Route path="/organizer-dashboard" element={<OrganizerDashboardEnhanced />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/auth/success" element={<AuthSuccess />} />
                  <Route path="/backend-test" element={<BackendLogin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </LanguageProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
