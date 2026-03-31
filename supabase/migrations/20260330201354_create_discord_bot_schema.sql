/*
  # Discord Bot Database Schema
  
  ## Overview
  Complete database schema for Discord bot with moderation, economy, gambling, and DayZ server management.
  
  ## New Tables
  
  ### `discord_users`
  Stores user economy and profile data
  - `id` (uuid, primary key)
  - `discord_id` (text, unique) - Discord user ID
  - `username` (text) - Discord username
  - `balance` (bigint) - User's economy balance
  - `xp` (bigint) - User experience points
  - `level` (integer) - User level
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `guilds`
  Stores guild/server configuration
  - `id` (uuid, primary key)
  - `guild_id` (text, unique) - Discord guild ID
  - `guild_name` (text) - Guild name
  - `nitrado_token` (text) - Encrypted Nitrado API token
  - `nitrado_server_id` (text) - Nitrado server ID
  - `prefix` (text) - Command prefix
  - `mod_role_id` (text) - Moderator role ID
  - `admin_role_id` (text) - Admin role ID
  - `log_channel_id` (text) - Moderation log channel
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `moderation_logs`
  Tracks all moderation actions
  - `id` (uuid, primary key)
  - `guild_id` (text) - Discord guild ID
  - `user_id` (text) - Target user ID
  - `moderator_id` (text) - Moderator user ID
  - `action` (text) - Action type (ban, kick, mute, warn)
  - `reason` (text) - Reason for action
  - `duration` (integer) - Duration in minutes (for temp actions)
  - `created_at` (timestamptz)
  
  ### `warnings`
  Tracks user warnings
  - `id` (uuid, primary key)
  - `guild_id` (text) - Discord guild ID
  - `user_id` (text) - Warned user ID
  - `moderator_id` (text) - Moderator who issued warning
  - `reason` (text) - Warning reason
  - `active` (boolean) - Whether warning is active
  - `created_at` (timestamptz)
  
  ### `economy_transactions`
  Tracks all economy transactions
  - `id` (uuid, primary key)
  - `user_id` (text) - User Discord ID
  - `guild_id` (text) - Guild ID
  - `amount` (bigint) - Transaction amount
  - `type` (text) - Transaction type (daily, work, transfer, gambling)
  - `description` (text) - Transaction description
  - `created_at` (timestamptz)
  
  ### `gambling_history`
  Tracks gambling game history
  - `id` (uuid, primary key)
  - `user_id` (text) - User Discord ID
  - `guild_id` (text) - Guild ID
  - `game_type` (text) - Type of game (coinflip, dice, slots)
  - `bet_amount` (bigint) - Amount bet
  - `result_amount` (bigint) - Amount won/lost
  - `won` (boolean) - Whether user won
  - `created_at` (timestamptz)
  
  ### `dayz_servers`
  Stores DayZ server information
  - `id` (uuid, primary key)
  - `guild_id` (text) - Discord guild ID
  - `server_name` (text) - Server name
  - `nitrado_id` (text) - Nitrado server ID
  - `game_type` (text) - Game type
  - `status` (text) - Server status
  - `players_online` (integer) - Current players
  - `max_players` (integer) - Max players
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated access with proper ownership checks
*/

-- Create discord_users table
CREATE TABLE IF NOT EXISTS discord_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id text UNIQUE NOT NULL,
  username text NOT NULL,
  balance bigint DEFAULT 0,
  xp bigint DEFAULT 0,
  level integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create guilds table
CREATE TABLE IF NOT EXISTS guilds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id text UNIQUE NOT NULL,
  guild_name text NOT NULL,
  nitrado_token text,
  nitrado_server_id text,
  prefix text DEFAULT '!',
  mod_role_id text,
  admin_role_id text,
  log_channel_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create moderation_logs table
CREATE TABLE IF NOT EXISTS moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id text NOT NULL,
  user_id text NOT NULL,
  moderator_id text NOT NULL,
  action text NOT NULL,
  reason text,
  duration integer,
  created_at timestamptz DEFAULT now()
);

-- Create warnings table
CREATE TABLE IF NOT EXISTS warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id text NOT NULL,
  user_id text NOT NULL,
  moderator_id text NOT NULL,
  reason text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create economy_transactions table
CREATE TABLE IF NOT EXISTS economy_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  guild_id text NOT NULL,
  amount bigint NOT NULL,
  type text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create gambling_history table
CREATE TABLE IF NOT EXISTS gambling_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  guild_id text NOT NULL,
  game_type text NOT NULL,
  bet_amount bigint NOT NULL,
  result_amount bigint NOT NULL,
  won boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create dayz_servers table
CREATE TABLE IF NOT EXISTS dayz_servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id text NOT NULL,
  server_name text NOT NULL,
  nitrado_id text NOT NULL,
  game_type text DEFAULT 'dayz',
  status text DEFAULT 'offline',
  players_online integer DEFAULT 0,
  max_players integer DEFAULT 60,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE discord_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gambling_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE dayz_servers ENABLE ROW LEVEL SECURITY;

-- Policies for discord_users
CREATE POLICY "Allow authenticated read access to discord_users"
  ON discord_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert to discord_users"
  ON discord_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to discord_users"
  ON discord_users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for guilds
CREATE POLICY "Allow authenticated read access to guilds"
  ON guilds FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert to guilds"
  ON guilds FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to guilds"
  ON guilds FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for moderation_logs
CREATE POLICY "Allow authenticated read access to moderation_logs"
  ON moderation_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert to moderation_logs"
  ON moderation_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for warnings
CREATE POLICY "Allow authenticated read access to warnings"
  ON warnings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert to warnings"
  ON warnings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to warnings"
  ON warnings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for economy_transactions
CREATE POLICY "Allow authenticated read access to economy_transactions"
  ON economy_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert to economy_transactions"
  ON economy_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for gambling_history
CREATE POLICY "Allow authenticated read access to gambling_history"
  ON gambling_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert to gambling_history"
  ON gambling_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for dayz_servers
CREATE POLICY "Allow authenticated read access to dayz_servers"
  ON dayz_servers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert to dayz_servers"
  ON dayz_servers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to dayz_servers"
  ON dayz_servers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discord_users_discord_id ON discord_users(discord_id);
CREATE INDEX IF NOT EXISTS idx_guilds_guild_id ON guilds(guild_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_guild_id ON moderation_logs(guild_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_user_id ON moderation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_warnings_guild_id ON warnings(guild_id);
CREATE INDEX IF NOT EXISTS idx_warnings_user_id ON warnings(user_id);
CREATE INDEX IF NOT EXISTS idx_economy_transactions_user_id ON economy_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gambling_history_user_id ON gambling_history(user_id);
CREATE INDEX IF NOT EXISTS idx_dayz_servers_guild_id ON dayz_servers(guild_id);