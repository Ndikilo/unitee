import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userData = urlParams.get('user');

    if (token && userData) {
      localStorage.setItem('token', token);
      const parsed = JSON.parse(decodeURIComponent(userData));
      localStorage.setItem('user', JSON.stringify(parsed));

      // Redirect to the correct dashboard based on role
      const type = parsed?.userType || parsed?.role;
      if (type === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else if (type === 'organization' || type === 'organizer') {
        navigate('/organizer-dashboard', { replace: true });
      } else {
        navigate('/volunteer-dashboard', { replace: true });
      }
    } else {
      navigate('/login?error=auth_failed', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
