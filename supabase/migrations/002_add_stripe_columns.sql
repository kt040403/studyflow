-- ============================================
-- StudyFlow Database Migration
-- Version: 002_add_stripe_columns
-- Description: profilesテーブルにStripe関連カラムとemailを追加
-- ============================================

-- 既存のprofilesテーブルにカラムを追加
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);

-- display_nameをNULL許可に変更（既存データがある場合）
ALTER TABLE profiles ALTER COLUMN display_name DROP NOT NULL;

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription ON profiles(stripe_subscription_id);

-- コメント追加
COMMENT ON COLUMN profiles.email IS 'ユーザーのメールアドレス';
COMMENT ON COLUMN profiles.stripe_customer_id IS 'StripeカスタマーID';
COMMENT ON COLUMN profiles.stripe_subscription_id IS 'StripeサブスクリプションID';

-- 既存ユーザーのemailを更新（auth.usersから取得）
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- ユーザー作成トリガー関数を更新
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 完了
-- ============================================
