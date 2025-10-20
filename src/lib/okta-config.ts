import { OktaAuth } from '@okta/okta-auth-js';

// Okta configuration using environment variables
const oktaConfig = {
  issuer: `https://${import.meta.env.PUBLIC_OKTA_DOMAIN}/oauth2/default`,
  clientId: import.meta.env.PUBLIC_OKTA_CLIENT_ID,
  redirectUri: import.meta.env.PUBLIC_OKTA_REDIRECT_URI,
  scopes: ['openid', 'profile', 'email'],
  pkce: true, // Use PKCE flow for security in SPAs
  tokenManager: {
    storage: 'sessionStorage' // Store tokens in session storage
  }
};

// Create and export Okta Auth client instance
export const oktaAuth = new OktaAuth(oktaConfig);

// Helper function to get user information
export async function getUserInfo() {
  try {
    const user = await oktaAuth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}

// Helper function to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  return await oktaAuth.isAuthenticated();
}

// Helper function to handle login
export async function login() {
  await oktaAuth.signInWithRedirect();
}

// Helper function to handle logout
export async function logout() {
  await oktaAuth.signOut();
}

// Helper function to handle the callback after redirect
export async function handleLoginCallback() {
  if (oktaAuth.isLoginRedirect()) {
    try {
      await oktaAuth.handleLoginRedirect();
    } catch (error) {
      console.error('Error handling login redirect:', error);
      throw error;
    }
  }
}
