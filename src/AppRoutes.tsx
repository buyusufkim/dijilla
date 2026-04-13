import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Layout from "./components/Layout.js";

// Lazy load page components
const Onboarding = lazy(() => import("./pages/Onboarding.js"));
const Home = lazy(() => import("./pages/Home.js"));
const Services = lazy(() => import("./pages/Services.js"));
const SOS = lazy(() => import("./pages/SOS.js"));
const Garage = lazy(() => import("./pages/Garage.js"));
const Profile = lazy(() => import("./pages/Profile.js"));
const Insurance = lazy(() => import("./pages/Insurance.js"));
const AIAssistant = lazy(() => import("./pages/AIAssistant.js"));
const TowTruck = lazy(() => import("./pages/TowTruck.js"));
const Glovebox = lazy(() => import("./pages/Glovebox.js"));
const Fuel = lazy(() => import("./pages/Fuel.js"));
const Expenses = lazy(() => import("./pages/Expenses.js"));
const Maintenance = lazy(() => import("./pages/Maintenance.js"));
const TravelAdvisor = lazy(() => import("./pages/TravelAdvisor.js"));
const VehicleDetail = lazy(() => import("./pages/VehicleDetail.js"));
const ProtectionDashboard = lazy(() => import("./pages/ProtectionDashboard.js"));
const InsurancePurchase = lazy(() => import("./pages/InsurancePurchase.js"));
const PremiumPitch = lazy(() => import("./pages/PremiumPitch.js"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Onboarding />} />
          <Route path="home" element={<Home />} />
          <Route path="insurance" element={<Insurance />} />
          <Route path="services" element={<Services />} />
          <Route path="sos" element={<SOS />} />
          <Route path="garage" element={<Garage />} />
          <Route path="garage/:id" element={<VehicleDetail />} />
          <Route path="protection/:id" element={<ProtectionDashboard />} />
          <Route path="insurance-purchase/:id" element={<InsurancePurchase />} />
          <Route path="premium" element={<PremiumPitch />} />
          <Route path="profile" element={<Profile />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="tow-truck" element={<TowTruck />} />
          <Route path="glovebox" element={<Glovebox />} />
          <Route path="fuel" element={<Fuel />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="travel-advisor" element={<TravelAdvisor />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
