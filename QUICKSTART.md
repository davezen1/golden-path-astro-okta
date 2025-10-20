# Quick Start Guide

## Setup in 3 Steps

### 1. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your Okta configuration:
```env
PUBLIC_OKTA_DOMAIN=your-okta-domain.okta.com
PUBLIC_OKTA_CLIENT_ID=your-client-id
PUBLIC_OKTA_REDIRECT_URI=http://localhost:4321
```

### 2. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:4321`

### 3. Build for Production
```bash
npm run build
```

Static files generated in `dist/` directory, ready for S3 deployment.

---

**See README.md for complete documentation including Okta setup.**
