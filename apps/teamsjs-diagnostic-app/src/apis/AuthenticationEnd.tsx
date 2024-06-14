import React, { useEffect } from 'react';
import { authentication } from '@microsoft/teams-js';
import { useNavigate } from 'react-router-dom';

const AuthEnd = () => {
    const navigate = useNavigate();

  useEffect(() => {
    const handleAuthResponse = () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const state = localStorage.getItem('simple.state');

      if (hashParams.get('error')) {
        console.error('Authentication error:', hashParams.get('error'));
        authentication.notifyFailure('AuthenticationFailed');
      } else if (hashParams.get('access_token') && hashParams.get('state') === state) {
        const authResult = {
          idToken: hashParams.get('id_token'),
          accessToken: hashParams.get('access_token'),
          tokenType: hashParams.get('token_type'),
          expiresIn: hashParams.get('expires_in'),
        };
        localStorage.setItem('authResult', JSON.stringify(authResult));
        authentication.notifySuccess('authResult');
      } else {
        console.error('State does not match or access token missing');
        authentication.notifyFailure('StateDoesNotMatch');
      }

      // Redirect to main app page after handling authentication response
      navigate('/');
    };

    handleAuthResponse();
  }, []);

  return <div>Handling authentication response...</div>;
};

export default AuthEnd;
