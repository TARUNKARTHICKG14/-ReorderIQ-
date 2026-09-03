import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DeliveryVideoBackground from './components/DeliveryVideoBackground';
import Dashboard from './pages/Dashboard';
import Components from './pages/Components';
import ComponentDetails from './pages/ComponentDetails';
import Suppliers from './pages/Suppliers';
import Recommendations from './pages/Recommendations';
import Simulation from './pages/Simulation';
import Comparison from './pages/Comparison';
import AuditHistory from './pages/AuditHistory';
import FailureTesting from './pages/FailureTesting';
import RiskRegister from './pages/RiskRegister';
import Login from './pages/Login';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('reorder_user');
    return saved ? JSON.parse(saved) : { user_id: 'planner01', role: 'PLANNER' };
  });

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('reorder_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('reorder_user');
  };

  return (
    <Router>
      <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Animated Delivery Video & Fleet Network Ambient Background */}
        <DeliveryVideoBackground />

        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login onLogin={handleLogin} />} />

          {/* Protected Application Routes */}
          <Route
            path="/*"
            element={
              currentUser ? (
                <div className="relative z-10 flex flex-col min-h-screen">
                  <Navbar currentUser={currentUser} onLogout={handleLogout} />

                  <div className="flex flex-1 pt-16 w-full">
                    {/* Fixed flex layout: Sidebar on left (w-64), Main content taking remaining flex-1 space */}
                    <Sidebar currentUser={currentUser} />

                    <main className="flex-1 p-6 overflow-y-auto min-w-0">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/components" element={<Components />} />
                        <Route path="/components/:id" element={<ComponentDetails />} />
                        <Route path="/suppliers" element={<Suppliers />} />
                        <Route path="/recommendations" element={<Recommendations currentUser={currentUser} />} />
                        <Route path="/simulation" element={<Simulation />} />
                        <Route path="/comparison" element={<Comparison />} />
                        <Route path="/audit-history" element={<AuditHistory />} />
                        <Route path="/failure-testing" element={<FailureTesting />} />
                        <Route path="/risk-register" element={<RiskRegister />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
