/**
 * CORS and Configuration Checker
 * Helps diagnose common Okta authentication issues before attempting login
 */

export interface ConfigCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

export async function checkOktaConfiguration(): Promise<ConfigCheck[]> {
  const checks: ConfigCheck[] = [];

  // Check 1: Environment variables are set
  const domain = import.meta.env.PUBLIC_OKTA_DOMAIN;
  const clientId = import.meta.env.PUBLIC_OKTA_CLIENT_ID;
  const redirectUri = import.meta.env.PUBLIC_OKTA_REDIRECT_URI;

  if (!domain || domain === 'your-okta-domain.okta.com') {
    checks.push({
      name: 'Okta Domain',
      status: 'fail',
      message: 'PUBLIC_OKTA_DOMAIN not configured in .env file'
    });
  } else {
    checks.push({
      name: 'Okta Domain',
      status: 'pass',
      message: `Domain configured: ${domain}`
    });
  }

  if (!clientId || clientId === 'your-client-id') {
    checks.push({
      name: 'Client ID',
      status: 'fail',
      message: 'PUBLIC_OKTA_CLIENT_ID not configured in .env file'
    });
  } else {
    checks.push({
      name: 'Client ID',
      status: 'pass',
      message: `Client ID configured: ${clientId.substring(0, 8)}...`
    });
  }

  // Check 2: Redirect URI matches current location
  const currentUrl = window.location.origin;
  if (!redirectUri || redirectUri === 'http://localhost:4321') {
    if (currentUrl !== 'http://localhost:4321') {
      checks.push({
        name: 'Redirect URI',
        status: 'warning',
        message: `Redirect URI (${redirectUri}) doesn't match current URL (${currentUrl})`
      });
    } else {
      checks.push({
        name: 'Redirect URI',
        status: 'pass',
        message: `Redirect URI matches current URL: ${redirectUri}`
      });
    }
  } else if (redirectUri !== currentUrl) {
    checks.push({
      name: 'Redirect URI',
      status: 'warning',
      message: `Redirect URI (${redirectUri}) doesn't match current URL (${currentUrl}). Update .env if needed.`
    });
  } else {
    checks.push({
      name: 'Redirect URI',
      status: 'pass',
      message: `Redirect URI matches: ${redirectUri}`
    });
  }

  // Check 3: Test Okta domain reachability
  if (domain && domain !== 'your-okta-domain.okta.com') {
    try {
      const issuerUrl = `https://${domain}/oauth2/default/.well-known/openid-configuration`;
      const response = await fetch(issuerUrl, {
        method: 'GET',
        mode: 'cors'
      });

      if (response.ok) {
        checks.push({
          name: 'Okta Reachability',
          status: 'pass',
          message: 'Successfully connected to Okta authorization server'
        });
      } else {
        checks.push({
          name: 'Okta Reachability',
          status: 'fail',
          message: `Okta responded with status: ${response.status}. Check your domain.`
        });
      }
    } catch (error) {
      checks.push({
        name: 'Okta Reachability',
        status: 'fail',
        message: `Cannot reach Okta: ${error instanceof Error ? error.message : 'Network error'}`
      });
    }
  }

  // Check 4: HTTPS in production
  if (window.location.protocol === 'http:' && !window.location.hostname.includes('localhost')) {
    checks.push({
      name: 'HTTPS',
      status: 'warning',
      message: 'Using HTTP in production. Okta requires HTTPS for non-localhost URLs.'
    });
  } else {
    checks.push({
      name: 'HTTPS',
      status: 'pass',
      message: window.location.protocol === 'https:'
        ? 'Using secure HTTPS connection'
        : 'Using HTTP (allowed for localhost)'
    });
  }

  return checks;
}

export function printConfigChecks(checks: ConfigCheck[]): void {
  console.group('🔍 Okta Configuration Check');

  checks.forEach(check => {
    const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
    const style = check.status === 'pass' ? 'color: green' : check.status === 'fail' ? 'color: red' : 'color: orange';

    console.log(`%c${icon} ${check.name}: ${check.message}`, style);
  });

  const failures = checks.filter(c => c.status === 'fail').length;
  const warnings = checks.filter(c => c.status === 'warning').length;

  if (failures > 0) {
    console.error(`\n❌ ${failures} configuration error(s) found. Please fix before attempting login.`);
  } else if (warnings > 0) {
    console.warn(`\n⚠️ ${warnings} warning(s) found. Authentication may still work.`);
  } else {
    console.log('\n✅ All configuration checks passed!');
  }

  console.groupEnd();
}

// Troubleshooting tips
export const troubleshootingTips = {
  cors: `
CORS Issues:
1. Add your origin to Okta Trusted Origins (Security > API > Trusted Origins)
2. Ensure your Okta app is configured as "Single-Page Application"
3. Verify redirect URIs match exactly (no trailing slashes)
  `,

  redirectUri: `
Redirect URI Mismatch:
1. Update .env file to match current URL
2. Add the URL to Okta app's Sign-in redirect URIs
3. Rebuild the app after changing .env (npm run build)
  `,

  domain: `
Okta Domain Issues:
1. Domain should be in format: dev-123456.okta.com
2. Do NOT include https:// prefix
3. Do NOT include any path (like /oauth2/default)
  `,

  notAssigned: `
User Not Assigned:
1. Go to your Okta app > Assignments tab
2. Assign yourself or your group to the application
  `
};
