/*
  # Initial Blog Schema Setup

  1. New Tables
    - categories
      - id (uuid, primary key)
      - name (text, unique)
      - slug (text, unique)
      - created_at (timestamp)
    
    - posts
      - id (uuid, primary key)
      - title (text)
      - content (text)
      - author_id (uuid, references auth.users)
      - category_id (uuid, references categories)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - comments
      - id (uuid, primary key)
      - content (text)
      - post_id (uuid, references posts)
      - user_id (uuid, references auth.users)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Public read access to categories and posts
      - Admin-only write access to categories and posts
      - Authenticated users can create comments
      - Users can read all comments
*/

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create posts table
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES auth.users NOT NULL,
  category_id uuid REFERENCES categories NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  post_id uuid REFERENCES posts NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Allow public read access to categories"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin to manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@example.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@example.com');

-- Posts policies
CREATE POLICY "Allow public read access to posts"
  ON posts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin to manage posts"
  ON posts FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@example.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@example.com');

-- Comments policies
CREATE POLICY "Allow authenticated users to create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow users to read all comments"
  ON comments FOR SELECT
  TO public
  USING (true);

-- Insert default categories
INSERT INTO categories (name, slug) VALUES
  ('Technology', 'technology'),
  ('Politics', 'politics'),
  ('Social', 'social'),
  ('AI', 'ai');