import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Layout from "./components/Layout.js";
import RequireAuth from "./components/RequireAuth.js";
import { FamilyProvider } from './context/FamilyContext.js';
import { NotificationProvider } from './context/NotificationContext.js';

// Lazy load page components
const AuthPage = lazy(() => import("./pages/AuthPage.js"));
const RequestCenter = lazy(() => import('./pages/RequestCenter.js'));
const ApplicationSettings = lazy(() => import('./pages/ApplicationSettings.js'));
const Home = lazy(() => import("./pages/Home.js"));
const Services = lazy(() => import("./pages/Services.js"));
const SOS = lazy(() => import("./pages/SOS.js"));
const Garage = lazy(() => import("./pages/Garage.js"));
const Profile = lazy(() => import("./pages/Profile.js"));
const AIAssistant = lazy(() => import("./pages/AIAssistant.js"));
const Glovebox = lazy(() => import("./pages/Glovebox.js"));
const Fuel = lazy(() => import("./pages/Fuel.js"));
const Expenses = lazy(() => import("./pages/Expenses.js"));
const Maintenance = lazy(() => import("./pages/Maintenance.js"));
const TravelAdvisor = lazy(() => import("./pages/TravelAdvisor.js"));
const VehicleDetail = lazy(() => import("./pages/VehicleDetail.js"));
const ProtectionDashboard = lazy(() => import("./pages/ProtectionDashboard.js"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/reset-password" element={<AuthPage reset />} />
        <Route element={<RequireAuth />}>
        <Route element={<FamilyProvider><NotificationProvider><Layout /></NotificationProvider></FamilyProvider>}>
          <Route path="home" element={<Home />} />
          <Route path="insurance" element={<RequestCenter key="insurance" initialKind="insurance" />} />
          <Route path="requests" element={<RequestCenter key="requests" />} />
          <Route path="roadside" element={<RequestCenter key="roadside" initialKind="roadside" />} />
          <Route path="service-request" element={<RequestCenter key="service" initialKind="service" />} />
          <Route path="settings" element={<ApplicationSettings />} />
          <Route path="admin" element={<Navigate to="/settings" replace />} />
          <Route path="services" element={<Services />} />
          <Route path="sos" element={<SOS />} />
          <Route path="garage" element={<Garage />} />
          <Route path="garage/:id" element={<VehicleDetail />} />
          <Route path="protection/:id" element={<ProtectionDashboard />} />
          <Route path="insurance-purchase/:id" element={<RequestCenter key="insurance-purchase" initialKind="insurance" />} />
          <Route path="premium" element={<RequestCenter key="premium" initialKind="premium" />} />
          <Route path="profile" element={<Profile />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="tow-truck" element={<RequestCenter key="assistance" initialKind="assistance" />} />
          <Route path="glovebox" element={<Glovebox />} />
          <Route path="fuel" element={<Fuel />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="travel-advisor" element={<TravelAdvisor />} />
          <Route path="*" element={<div className="p-8"><h1>Sayfa bulunamadı</h1><a href="/home">Ana sayfaya dön</a></div>} />
        </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};
