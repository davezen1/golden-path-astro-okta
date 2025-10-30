# Astro + Okta Reference Application

A simple static website built with Astro that demonstrates authentication using Okta's JavaScript SDK with OAuth 2.0 + PKCE flow. This application is designed as a reference implementation for static deployment scenarios like AWS S3.

## Features

- OAuth 2.0 with PKCE (Proof Key for Code Exchange) flow
- Login and logout functionality
- Display authenticated user's name and email
- Client-side authentication (static deployment ready)
- TypeScript for type safety
- Clean, minimal UI

## Prerequisites

- Node.js 18+ installed
- An Okta account with an application configured
- Okta application must be configured as a Single-Page Application (SPA)

## Okta Application Setup

Before running this application, you need to configure an Okta application:

1. **Log in to your Okta Admin Console**

2. **Create a new application**:
   - Navigate to Applications > Applications
   - Click "Create App Integration"
   - Select "OIDC - OpenID Connect"
   - Select "Single-Page Application"

3. **Configure the application**:
   - **App integration name**: Choose a name (e.g., "Astro Reference App")
   - **Sign-in redirect URIs**:
     - For local: `http://localhost:4321`
     - For production: `https://your-s3-bucket-url.com` (or your domain)
   - **Sign-out redirect URIs**: Same as above
   - **Controlled access**: Choose who can access this application

4. **Save your configuration**:
   - Note your **Client ID**
   - Note your **Okta domain** (e.g., `dev-123456.okta.com`)

5. **Assign users**:
   - Go to the Assignments tab
   - Assign users or groups who should have access

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd golden-path-astro-okta
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file** with your Okta configuration:
   ```env
   PUBLIC_OKTA_DOMAIN=your-okta-domain.okta.com
   PUBLIC_OKTA_CLIENT_ID=your-client-id
   PUBLIC_OKTA_REDIRECT_URI=http://localhost:4321
   ```

## Development

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:4321`

### Diagnostics Tool

If you encounter authentication issues, visit the diagnostics page:

```
http://localhost:4321/diagnostics
```

This tool will automatically:
- Check environment variable configuration
- Verify redirect URI matches current URL
- Test connectivity to your Okta domain
- Provide detailed troubleshooting guidance

The diagnostics will also run automatically in the browser console on the main page.

## Building for Production

Build the static site:

```bash
npm run build
```

The static files will be generated in the `dist/` directory.

Preview the production build locally:

```bash
npm run preview
```

## Deployment Options

### Option 1: AWS Elastic Beanstalk with Docker (Recommended)

This option deploys the application as a Docker container to AWS Elastic Beanstalk, providing easier management, auto-scaling, and monitoring.

#### Prerequisites
- AWS CLI installed and configured
- EB CLI installed (`pip install awsebcli`)
- Docker installed (for local testing)

#### Local Docker Testing

1. **Test with docker-compose**:
   ```bash
   # Build and run the container
   docker-compose up --build

   # Access at http://localhost:8080
   ```

2. **Or test with Docker directly**:
   ```bash
   # Build the image
   docker build \
     --build-arg PUBLIC_OKTA_DOMAIN=your-okta-domain.okta.com \
     --build-arg PUBLIC_OKTA_CLIENT_ID=your-client-id \
     --build-arg PUBLIC_OKTA_REDIRECT_URI=http://localhost:8080 \
     -t astro-okta-app .

   # Run the container
   docker run -p 8080:80 astro-okta-app
   ```

#### Deploy to Elastic Beanstalk

1. **Initialize EB application** (first time only):
   ```bash
   eb init
   ```
   - Choose your region (e.g., us-east-1)
   - Application name: `astro-okta-app`
   - Platform: Docker running on 64bit Amazon Linux 2023
   - Select "no" for CodeCommit

2. **Configure environment variables**:

   Edit `.ebextensions/01_environment.config` with your Okta settings:
   ```yaml
   option_settings:
     aws:elasticbeanstalk:application:environment:
       PUBLIC_OKTA_DOMAIN: "your-okta-domain.okta.com"
       PUBLIC_OKTA_CLIENT_ID: "your-client-id"
       PUBLIC_OKTA_REDIRECT_URI: "https://your-app.elasticbeanstalk.com"
   ```

   Or set them via EB CLI:
   ```bash
   eb setenv \
     PUBLIC_OKTA_DOMAIN=your-okta-domain.okta.com \
     PUBLIC_OKTA_CLIENT_ID=your-client-id \
     PUBLIC_OKTA_REDIRECT_URI=https://your-app.elasticbeanstalk.com
   ```

3. **Create and deploy environment**:
   ```bash
   # Create environment (first time)
   eb create astro-okta-prod

   # Or deploy to existing environment
   eb deploy
   ```

4. **Get your application URL**:
   ```bash
   eb status
   # Or open in browser
   eb open
   ```

5. **Update Okta application**:
   - In Okta Admin Console, add your EB URL to Sign-in redirect URIs
   - Example: `https://astro-okta-prod.us-east-1.elasticbeanstalk.com`

#### Managing Your EB Environment

```bash
# View logs
eb logs

# Check status
eb status

# SSH into instance
eb ssh

# Update environment variables
eb setenv KEY=value

# Terminate environment (WARNING: destroys resources)
eb terminate
```

#### Optional: Configure HTTPS

For production, enable HTTPS:

1. **In AWS Console**:
   - Go to EB environment → Configuration → Load balancer
   - Add HTTPS listener on port 443
   - Select or upload SSL certificate (via AWS Certificate Manager)

2. **Configure custom domain** (optional):
   - Add CNAME record pointing to EB URL
   - Update Okta redirect URIs with your custom domain

### Option 2: AWS S3 Static Hosting

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Update `.env` for production**:
   - Set `PUBLIC_OKTA_REDIRECT_URI` to your S3 bucket URL or CloudFront distribution
   - Rebuild after changing environment variables

3. **Upload to S3**:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

4. **Configure S3 bucket**:
   - Enable static website hosting
   - Set index document to `index.html`
   - Set error document to `index.html` (for client-side routing)
   - Configure bucket policy for public read access (or use CloudFront)

5. **Update Okta application**:
   - Add your S3/CloudFront URL to the Sign-in redirect URIs in your Okta app configuration

## Project Structure

```
/
├── src/
│   ├── pages/
│   │   ├── index.astro          # Main page with auth logic
│   │   └── diagnostics.astro    # Configuration diagnostics tool
│   ├── lib/
│   │   ├── okta-config.ts       # Okta client configuration
│   │   └── cors-checker.ts      # Configuration checker utility
│   └── env.d.ts                 # TypeScript environment types
├── public/
│   └── styles.css               # CSS styles
├── .elasticbeanstalk/
│   └── config.yml               # EB CLI configuration
├── .ebextensions/
│   ├── 01_environment.config    # Environment variables config
│   └── 02_https_redirect.config # HTTPS configuration (optional)
├── .env.example                 # Environment variable template
├── Dockerfile                   # Docker build configuration
├── docker-compose.yml           # Local Docker testing
├── nginx.conf                   # Nginx web server configuration
├── .dockerignore                # Docker build exclusions
├── astro.config.mjs             # Astro configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

## How It Works

1. **Client-side authentication**: All authentication happens in the browser using Okta's JavaScript SDK
2. **PKCE flow**: Uses OAuth 2.0 with PKCE for enhanced security (no client secret needed)
3. **Token storage**: Tokens are stored in browser sessionStorage
4. **OAuth redirect flow**:
   - User clicks "Sign In"
   - Redirected to Okta login page
   - After authentication, redirected back to app with authorization code
   - App exchanges code for tokens (PKCE ensures security)
   - User info is retrieved and displayed

## Configuration Details

### Environment Variables

All environment variables must be prefixed with `PUBLIC_` to be available in the browser:

- `PUBLIC_OKTA_DOMAIN`: Your Okta domain (e.g., `dev-123456.okta.com`)
- `PUBLIC_OKTA_CLIENT_ID`: Your Okta application's client ID
- `PUBLIC_OKTA_REDIRECT_URI`: Where Okta should redirect after authentication

### Okta Configuration

The Okta client is configured in `src/lib/okta-config.ts`:

- **Issuer**: `https://{domain}/oauth2/default` (uses default authorization server)
- **Scopes**: `openid`, `profile`, `email`
- **PKCE**: Enabled for security
- **Token storage**: sessionStorage (tokens cleared when browser closes)

## Troubleshooting

### Using the Diagnostics Tool

**First step:** Visit `/diagnostics` to run automated configuration checks.

The tool will verify:
- Environment variables are properly set
- Redirect URI matches current URL
- Okta domain is reachable
- HTTPS requirements (for production)

Check the browser console for detailed diagnostic output.

### "Invalid redirect_uri"
- Ensure the redirect URI in your `.env` file exactly matches what's configured in your Okta application
- Check for trailing slashes or http vs https mismatches

### "User is not assigned to the client application"
- In Okta Admin Console, go to your application's Assignments tab
- Assign the user or group trying to log in

### Tokens not persisting
- This is expected behavior with sessionStorage
- Tokens are cleared when the browser is closed
- To persist across sessions, modify `tokenManager.storage` to `localStorage` in `okta-config.ts`

### CORS errors
- Ensure your Okta application is configured as a Single-Page Application (SPA)
- Check that Trusted Origins are configured correctly in Okta (Security > API > Trusted Origins)

## Security Considerations

- **PKCE**: Protects against authorization code interception attacks
- **No client secret**: SPA uses PKCE instead of client secrets (which can't be secured in browser)
- **Token storage**: Using sessionStorage (more secure) vs localStorage (persistent)
- **HTTPS in production**: Always use HTTPS for production deployments

## License

MIT

## Resources

- [Okta Auth JS Documentation](https://github.com/okta/okta-auth-js)
- [Astro Documentation](https://docs.astro.build)
- [OAuth 2.0 PKCE](https://oauth.net/2/pkce/)
