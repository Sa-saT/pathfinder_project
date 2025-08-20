-- Pathfinder 音源アプリ データベース初期化スクリプト

-- LoginAccounts table
CREATE TABLE login_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  display_name text,
  created_at timestamptz DEFAULT now()
);

-- Sounds table
CREATE TABLE sounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  tags text[],
  duration_seconds numeric,
  bitrate_kbps integer,
  blob_url text NOT NULL,
  thumbnail_blob_url text,
  is_public boolean DEFAULT true,
  author_id uuid REFERENCES login_accounts(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- インデックスの作成
CREATE INDEX idx_sounds_author_id ON sounds(author_id);
CREATE INDEX idx_sounds_is_public ON sounds(is_public);
CREATE INDEX idx_sounds_created_at ON sounds(created_at);
CREATE INDEX idx_login_accounts_email ON login_accounts(email);
