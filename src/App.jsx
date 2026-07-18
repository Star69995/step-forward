import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
              <FormPage />
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
