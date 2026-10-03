import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import HomePage from "../pages/HomePage.tsx";
import LoginPage from "../pages/LoginPage.tsx";
import ElectionsPage from "../pages/ElectionsPage.tsx";
import VotePage from "../pages/VotePage.tsx";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/vote" element={<ElectionsPage />} />
        <Route path="/vote/:electionId" element={<VotePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;