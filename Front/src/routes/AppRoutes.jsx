import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Content from '../pages/Content';
import ConteudoDetalhe from '../pages/ConteudoDetalhe';
import Quiz from '../pages/Quiz';
import Ranking from '../pages/Ranking';
import Profile from '../pages/Profile';
import Admin from '../pages/Admin';
import NotFound from '../pages/NotFound';

export default function AppRoutes({ location }) {
  return (
    <Routes location={location}>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/content"     element={<ProtectedRoute><Content /></ProtectedRoute>} />
      <Route path="/content/:id" element={<ProtectedRoute><ConteudoDetalhe /></ProtectedRoute>} />
      <Route path="/quiz"        element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
      <Route path="/ranking"     element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
      <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/admin"       element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
