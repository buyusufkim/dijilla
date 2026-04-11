/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { FamilyProvider } from "./context/FamilyContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AppRoutes } from "./AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <FamilyProvider>
        <NotificationProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </NotificationProvider>
      </FamilyProvider>
    </AuthProvider>
  );
}
