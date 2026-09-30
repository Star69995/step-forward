import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/useAuth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FormPage from "./pages/FormPage";
import Profile from "./pages/Profile";
import Providers from "./pages/Providers";
import RecipientPlans from "./pages/RecipientPlans";
import Header from "./components/Header";

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

// FormPage keeps its plan id in state, so moving between plans without
// leaving /form (the header's PlanSwitcher, a linked previous plan) has to
// remount it - keyed by the plan it shows. A new plan mints its own id and
// swaps it into the URL (marked with state.mintedPlanId); that swap is the
// same plan, so it keeps the "new" key instead of remounting mid-creation.
const FormRoute = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const planId = params.get("planId");
  const isFresh = !planId || planId === "new" || location.state?.mintedPlanId === planId;
  return <FormPage key={`${params.get("ownerUid") || ""}:${isFresh ? "new" : planId}`} />;
};

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/form"
          element={
            <PrivateRoute>
              <FormRoute />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/providers"
          element={
            <PrivateRoute>
              <Providers />
            </PrivateRoute>
          }
        />
        <Route
          path="/recipients/:recipientUid"
          element={
            <PrivateRoute>
              <RecipientPlans />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
