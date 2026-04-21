/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "./context/AuthContext.js";
import { FamilyProvider } from "./context/FamilyContext.js";
import { NotificationProvider } from "./context/NotificationContext.js";
import { AppRoutes } from "./AppRoutes.js";

export default function App() {
  return (
    <AuthProvider>
      <FamilyProvider>
        <NotificationProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          <Analytics />
        </NotificationProvider>
      </FamilyProvider>
    </AuthProvider>
  );
}
