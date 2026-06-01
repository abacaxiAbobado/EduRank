import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { useEffect, useState } from 'react';

function AnimatedRoutes() {
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(location);

  useEffect(() => {
    if (location.key !== currentLocation.key) {
      setVisible(false);
      const timer = setTimeout(() => {
        setCurrentLocation(location);
        setVisible(true);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className={`page-transition ${visible ? 'page-visible' : 'page-hidden'}`}>
      <AppRoutes location={currentLocation} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}