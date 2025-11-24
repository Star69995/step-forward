import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import FormPage from "./pages/FormPage";
import Profile from "./pages/Profile";
import Header from "./components/Header";

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/" />;
};

const WithHeader = ({ children }) => {
  const location = useLocation();
  const hideHeader = location.pathname === "/";
  return (
    <>
      {!hideHeader && <Header />}
      {children}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <WithHeader>
        <Routes>
          <Route path="/" element={<Login />} />
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
        </Routes>
      </WithHeader>
    </Router>
  );
};

export default App;