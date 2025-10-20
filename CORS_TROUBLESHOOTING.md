# CORS Troubleshooting Guide

## Quick Diagnostics

Visit the built-in diagnostics page:
```
http://localhost:4321/diagnostics
```

This will automatically check your configuration and provide specific guidance.

## Manual CORS Setup in Okta

### Step 1: Add Trusted Origin

1. Log in to **Okta Admin Console**
2. Navigate to **Security > API > Trusted Origins**
3. Click **Add Origin**
4. Configure:
   - **Name**: Local Development (or Production)
   - **Origin URL**:
     - Local: `http://localhost:4321`
     - Production: `https://your-domain.com`
   - **Type**: Check BOTH:
     - ✅ CORS
     - ✅ Redirect
5. Click **Save**

### Step 2: Verify Application Type

1. Go to **Applications > Applications**
2. Select your application
3. Verify **Application type** is: **Single-Page App**
   - If not, you may need to create a new application

### Step 3: Check Redirect URIs

In your application settings, verify **Sign-in redirect URIs** includes:
- `http://localhost:4321` (for local)
- Your production URL (for deployment)

**Important:** URIs must match EXACTLY (no trailing slashes)

## Common CORS Errors

### Error: "No 'Access-Control-Allow-Origin' header is present"

**Cause:** Okta doesn't trust your origin

**Solution:**
1. Add origin to Trusted Origins (see Step 1 above)
2. Ensure application type is SPA
3. Clear browser cache and try again

### Error: "redirect_uri_mismatch"

**Cause:** Redirect URI doesn't match Okta configuration

**Solution:**
1. Check `.env` file - ensure `PUBLIC_OKTA_REDIRECT_URI` matches current URL
2. Add exact URI to Okta app's Sign-in redirect URIs
3. Rebuild application: `npm run build`

### Error: "The client is not authorized to use the provided grant type"

**Cause:** Application not configured for PKCE/implicit flow

**Solution:**
1. Verify application is Single-Page App type
2. Check Grant types in Okta app settings:
   - ✅ Authorization Code with PKCE
   - ✅ Refresh Token (optional)

## Testing Checklist

Use this checklist when setting up locally:

- [ ] Okta application created as "Single-Page Application"
- [ ] Client ID copied to `.env` file
- [ ] Okta domain copied to `.env` (without https://)
- [ ] Redirect URI set to `http://localhost:4321` in `.env`
- [ ] Same redirect URI added to Okta app settings
- [ ] User assigned to application (Assignments tab)
- [ ] Trusted Origin added for `http://localhost:4321`
- [ ] Trusted Origin has both CORS and Redirect checked
- [ ] Browser cache cleared
- [ ] Dev server restarted (`npm run dev`)

## Production Deployment Checklist

- [ ] Update `.env` with production URL
- [ ] Rebuild application (`npm run build`)
- [ ] Add production URL to Okta app's redirect URIs
- [ ] Add production URL to Trusted Origins
- [ ] Verify HTTPS is used (required for production)
- [ ] Test authentication in production environment

## Diagnostic Output

The application automatically logs diagnostics to the browser console. Look for:

```
🔍 Okta Configuration Check
✅ Okta Domain: Domain configured
✅ Client ID: Client ID configured
✅ Redirect URI: Redirect URI matches
✅ Okta Reachability: Successfully connected
✅ HTTPS: Using HTTP (allowed for localhost)
```

Any ❌ or ⚠️ indicators show issues that need attention.

## Getting Help

If you're still experiencing issues:

1. Check browser console for detailed error messages
2. Visit `/diagnostics` page for automated checks
3. Review Okta application logs in Admin Console
4. Verify all checklist items above

## Additional Resources

- [Okta CORS Documentation](https://developer.okta.com/docs/guides/enable-cors/)
- [OAuth 2.0 PKCE Flow](https://oauth.net/2/pkce/)
- [Okta Auth JS GitHub](https://github.com/okta/okta-auth-js)
