# Setup Guide

This guide will help you set up the DayZ Discord Bot and Web Dashboard from scratch.

## Step 1: Discord Bot Creation

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "DayZ Server Manager")
4. Go to the "Bot" section
5. Click "Add Bot"
6. Under "Token", click "Reset Token" and copy it (you'll need this for `.env`)
7. Enable these Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent

## Step 2: Invite Bot to Your Server

1. Go to "OAuth2" > "URL Generator"
2. Select these scopes:
   - `bot`
   - `applications.commands`
3. Select these bot permissions:
   - Read Messages/View Channels
   - Send Messages
   - Manage Messages
   - Embed Links
   - Read Message History
   - Ban Members
   - Kick Members
   - Moderate Members
4. Copy the generated URL and open it in your browser
5. Select your server and authorize the bot

## Step 3: Supabase Setup

1. Go to [Supabase](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to finish setting up
4. The database schema has already been created via migration
5. Get your credentials:
   - Go to Project Settings > API
   - Copy the "Project URL" (for `SUPABASE_URL`)
   - Copy the "anon public" key (for `VITE_SUPABASE_ANON_KEY`)
   - Copy the "service_role" key (for `SUPABASE_SERVICE_ROLE_KEY`)

## Step 4: Nitrado API Token

1. Go to [Nitrado Dashboard](https://server.nitrado.net)
2. Log in to your account
3. Go to your account settings
4. Find the API section
5. Generate or copy your API token
6. Note your server ID (found in the server dashboard URL or server details)

## Step 5: Bot Configuration

1. Navigate to the `bot` directory:
```bash
cd bot
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Edit `.env` and add your credentials:
```env
DISCORD_BOT_TOKEN=your_discord_bot_token_from_step_1
SUPABASE_URL=your_supabase_url_from_step_3
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_from_step_3
```

4. Install dependencies:
```bash
npm install
```

5. Start the bot:
```bash
npm start
```

6. Verify the bot is online in Discord

## Step 6: Configure Nitrado in Discord

1. In your Discord server, run:
```
/setup [your_nitrado_token] [your_server_id]
```

2. The bot will verify the connection and save your settings

## Step 7: Web Dashboard Configuration

1. Navigate back to the project root:
```bash
cd ..
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Edit `.env` and add your credentials:
```env
VITE_SUPABASE_URL=your_supabase_url_from_step_3
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_from_step_3
```

4. Install dependencies (if not already done):
```bash
npm install
```

5. Build the dashboard:
```bash
npm run build
```

6. Preview the dashboard:
```bash
npm run preview
```

7. Open your browser to the provided URL

## Step 8: Create Dashboard Account

1. Open the dashboard in your browser
2. Click "Sign Up"
3. Enter your email and password
4. Sign in with your credentials

## Testing the Setup

### Test Discord Bot Commands

Try these commands in Discord:
- `/help` - Should show all available commands
- `/balance` - Should show your balance (starts at 0)
- `/server` - Should show your DayZ server status
- `/daily` - Should give you 1000 coins

### Test Web Dashboard

1. Log in to the dashboard
2. Check the Overview page for server status
3. Navigate to different sections to ensure everything loads

## Troubleshooting

### Bot Shows Offline
- Check if the bot process is running
- Verify your Discord bot token is correct
- Check console for error messages

### Database Connection Errors
- Verify Supabase URL and keys are correct
- Check if your Supabase project is active
- Ensure Row Level Security policies are properly set

### Nitrado Integration Not Working
- Verify your Nitrado API token is valid
- Check if the server ID is correct
- Ensure your Nitrado subscription is active

### Dashboard Won't Load
- Check browser console for errors
- Verify environment variables are set correctly
- Try clearing browser cache

## Production Deployment

### Bot Deployment
- Use a process manager like PM2: `pm2 start bot/index.js --name dayz-bot`
- Or use a hosting service like Railway, Heroku, or DigitalOcean

### Dashboard Deployment
- Build the dashboard: `npm run build`
- Deploy the `dist` folder to:
  - Vercel: `vercel --prod`
  - Netlify: `netlify deploy --prod`
  - Any static hosting service

## Support

If you encounter issues:
1. Check the logs for error messages
2. Verify all environment variables are correct
3. Ensure all dependencies are installed
4. Check the main README for additional troubleshooting

## Next Steps

Once everything is set up:
1. Explore all bot commands with `/help`
2. Set up moderation roles in Discord
3. Configure your server settings
4. Test the economy and gambling features
5. Monitor your server through the dashboard
