import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useAuthStore } from "@/store";
import { supabase } from "@/lib/supabase"; // <-- adjust if path is different

import ProtectedRoute from "@/components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import MenuSections from "./pages/MenuSections";
import MenuItems from "./pages/MenuItems";
import Settings from "./pages/Settings";
import Orders from "./pages/Orders";
import RestaurantProfile from "./pages/RestaurantProfile";
import PublicMenu from "./pages/PublicMenu";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/* Redirect authenticated users away from auth pages */
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isOnboarded } = useAuthStore();

  if (isAuthenticated) {
    if (!isOnboarded) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const {
    initialize,
    isLoading,
    isAuthenticated,
    isOnboarded,
  } = useAuthStore();

  useEffect(() => {
    const boot = async () => {
      try {
        // 🔹 Let Supabase read token from URL
        await supabase.auth.getSession();

        // 🔹 Remove access_token from URL after login
        if (window.location.hash.includes("access_token")) {
          window.history.replaceState({}, document.title, "/");
        }

        // 🔹 Now init auth store
        await initialize();

      } catch (err) {
        console.error("Auth boot error:", err);
      }
    };

    boot();
  }, [initialize]);

  /* Loading screen */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>

            {/* Root */}
            <Route
              path="/"
              element={
                isAuthenticated
                  ? <Navigate to="/dashboard" replace />
                  : <Navigate to="/login" replace />
              }
            />

            {/* Auth */}
            <Route
              path="/login"
              element={
                <AuthRoute>
                  <Login />
                </AuthRoute>
              }
            />

            <Route
              path="/signup"
              element={
                <AuthRoute>
                  <Signup />
                </AuthRoute>
              }
            />

            {/* Onboarding */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/sections"
              element={
                <ProtectedRoute>
                  <MenuSections />
                </ProtectedRoute>
              }
            />

            <Route
              path="/items"
              element={
                <ProtectedRoute>
                  <MenuItems />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
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
              path="/profile"
              element={
                <ProtectedRoute>
                  <RestaurantProfile />
                </ProtectedRoute>
              }
            />

            {/* Public menu */}
            <Route
              path="/menu/:uniqueKey"
              element={<PublicMenu />}
            />

            {/* 404 */}
            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;