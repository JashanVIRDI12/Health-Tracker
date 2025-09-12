# Google OAuth Setup Instructions

## 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3001/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google` (backup)
     - `https://health-tracker-amber-ten.vercel.app/api/auth/callback/google` (production)
   - Copy the Client ID and Client Secret

## 2. Update Environment Variables

Replace the placeholder values in `.env.local`:

```env
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=generate_a_random_secret_here
```

### Generate NEXTAUTH_SECRET:
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

## 3. Restart the Development Server

After updating the environment variables:
```bash
npm run dev
```

## 4. Test Google OAuth

1. Go to your app at `http://localhost:3001`
2. Click "Continue with Google" on login or signup
3. You'll be redirected to Google's OAuth consent screen
4. After authorization, you'll be redirected back to your app

## Important Notes

- Make sure your Google Cloud project has the correct authorized redirect URIs
- The NEXTAUTH_URL should match your development server URL
- Keep your Client Secret secure and never commit it to version control
- For production, update the redirect URIs to your production domain
- Set NEXTAUTH_URL to your production URL in Vercel environment variables

## Production Deployment Setup

For your Vercel deployment at `https://health-tracker-amber-ten.vercel.app/`:

1. **Vercel Environment Variables:**
   ```
   NEXTAUTH_URL=https://health-tracker-amber-ten.vercel.app
   GOOGLE_CLIENT_ID=your_actual_google_client_id
   GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
   NEXTAUTH_SECRET=your_generated_secret
   ```

2. **Google Console Redirect URI:**
   - Add: `https://health-tracker-amber-ten.vercel.app/api/auth/callback/google`

## Troubleshooting

- **Error 400: redirect_uri_mismatch**: Check that your redirect URI in Google Console matches exactly
- **Error 403: access_blocked**: Make sure Google+ API is enabled
- **Session issues**: Verify NEXTAUTH_SECRET is set and restart the server
