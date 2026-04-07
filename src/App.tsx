/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { FamilyProvider } from "./context/FamilyContext";
import { NotificationProvider } from "./context/NotificationContext";
import Layout from "./components/Layout";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Services from "./pages/Services";
import SOS from "./pages/SOS";
import Garage from "./pages/Garage";
import Profile from "./pages/Profile";
import Insurance from "./pages/Insurance";
import AIAssistant from "./pages/AIAssistant";
import TowTruck from "./pages/TowTruck";
import Glovebox from "./pages/Glovebox";
import Fuel from "./pages/Fuel";
import Expenses from "./pages/Expenses";
import Maintenance from "./pages/Maintenance";
import TravelAdvisor from "./pages/TravelAdvisor";

import VehicleDetail from "./pages/VehicleDetail";
import ProtectionDashboard from "./pages/ProtectionDashboard";
import InsurancePurchase from "./pages/InsurancePurchase";
import PremiumPitch from "./pages/PremiumPitch";

export default function App() {
  return (
    <AuthProvider>
      <FamilyProvider>
        <NotificationProvider>
          <BrowserRouter>
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
          </BrowserRouter>
        </NotificationProvider>
      </FamilyProvider>
    </AuthProvider>
  );
}
