export const initializeGoogleAuth = (callback) => {
  if (!window.google) {
    console.error('Google Identity Services not loaded');
    return;
  }

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error('Google Client ID not found in environment variables');
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: callback, // Handle credential response
    auto_select: false, // Avoid auto-login unless desired
  });
};

export const renderGoogleButton = (elementId, options = { theme: 'outline', size: 'large' }) => {
  if (window.google) {
    window.google.accounts.id.renderButton(document.getElementById(elementId), options);
  }
};

export const promptGoogleLogin = () => {
  if (window.google) {
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.warn('Prompt not shown:', notification.getNotDisplayedReason() || notification.getSkippedReason());
      }
    });
  }
};
