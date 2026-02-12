-- ============================================
-- StudyFlow Database Migration
-- Version: 001_initial_schema
-- Description: 全テーブル、RLSポリシー、インデックスの作成
-- ============================================

-- ============================================
-- 1. テーブル作成
-- ============================================

-- profiles テーブル（ユーザープロフィール）
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  display_name VARCHAR(100),
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'Asia/Tokyo',
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'pro_plus')),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  ai_usage_count INTEGER DEFAULT 0,
  ai_usage_reset_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'ユーザープロフィール情報';
COMMENT ON COLUMN profiles.plan IS 'プラン: free / pro / pro_plus';
COMMENT ON COLUMN profiles.ai_usage_count IS '当月のAI使用回数';
COMMENT ON COLUMN profiles.stripe_customer_id IS 'StripeカスタマーID';
COMMENT ON COLUMN profiles.stripe_subscription_id IS 'StripeサブスクリプションID';

-- goals テーブル（学習目標）
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('programming', 'language', 'certification', 'other')),
  target_date DATE,
  target_hours INTEGER,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  color VARCHAR(7) DEFAULT '#6366f1',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE goals IS '学習目標';
COMMENT ON COLUMN goals.category IS 'カテゴリ: programming / language / certification / other';
COMMENT ON COLUMN goals.status IS 'ステータス: active / completed / paused / archived';

-- milestones テーブル（マイルストーン）
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  target_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE milestones IS '目標のマイルストーン';

-- study_logs テーブル（学習記録）
CREATE TABLE study_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  study_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  mood VARCHAR(20) CHECK (mood IN ('great', 'good', 'neutral', 'difficult')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE study_logs IS '学習記録ログ';
COMMENT ON COLUMN study_logs.mood IS '学習の感触: great / good / neutral / difficult';

-- ai_plans テーブル（AI生成学習計画）
CREATE TABLE ai_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  prompt_used TEXT NOT NULL,
  raw_response TEXT NOT NULL,
  total_days INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ai_plans IS 'AI生成の学習計画';

-- ai_plan_items テーブル（AI計画の各ステップ）
CREATE TABLE ai_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES ai_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  estimated_minutes INTEGER,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0
);

COMMENT ON TABLE ai_plan_items IS 'AI計画の日別アイテム';

-- subscriptions テーブル（サブスクリプション）
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('pro', 'pro_plus')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE subscriptions IS 'Stripeサブスクリプション情報';

-- ============================================
-- 2. インデックス作成
-- ============================================

-- goals インデックス
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_user_status ON goals(user_id, status);

-- study_logs インデックス
CREATE INDEX idx_study_logs_user_date ON study_logs(user_id, study_date DESC);
CREATE INDEX idx_study_logs_goal_date ON study_logs(goal_id, study_date DESC);

-- milestones インデックス
CREATE INDEX idx_milestones_goal_id ON milestones(goal_id);

-- ai_plans インデックス
CREATE INDEX idx_ai_plans_user_goal ON ai_plans(user_id, goal_id);

-- ai_plan_items インデックス
CREATE INDEX idx_ai_plan_items_plan ON ai_plan_items(plan_id, day_number);

-- subscriptions インデックス
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- profiles Stripe インデックス
CREATE INDEX idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX idx_profiles_stripe_subscription ON profiles(stripe_subscription_id);

-- ============================================
-- 3. Row Level Security (RLS) 有効化
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. RLS ポリシー作成
-- ============================================

-- profiles: ユーザーは自分のプロフィールのみアクセス可能
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- goals: ユーザーは自分の目標のみアクセス可能
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  USING (auth.uid() = user_id);

-- milestones: ユーザーは自分の目標に紐づくマイルストーンのみアクセス可能
CREATE POLICY "Users can view own milestones"
  ON milestones FOR SELECT
  USING (goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own milestones"
  ON milestones FOR INSERT
  WITH CHECK (goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own milestones"
  ON milestones FOR UPDATE
  USING (goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own milestones"
  ON milestones FOR DELETE
  USING (goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid()));

-- study_logs: ユーザーは自分の学習記録のみアクセス可能
CREATE POLICY "Users can view own study_logs"
  ON study_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study_logs"
  ON study_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study_logs"
  ON study_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own study_logs"
  ON study_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ai_plans: ユーザーは自分のAI計画のみアクセス可能
CREATE POLICY "Users can view own ai_plans"
  ON ai_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai_plans"
  ON ai_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai_plans"
  ON ai_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai_plans"
  ON ai_plans FOR DELETE
  USING (auth.uid() = user_id);

-- ai_plan_items: ユーザーは自分のAI計画アイテムのみアクセス可能
CREATE POLICY "Users can view own ai_plan_items"
  ON ai_plan_items FOR SELECT
  USING (plan_id IN (SELECT id FROM ai_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own ai_plan_items"
  ON ai_plan_items FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM ai_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own ai_plan_items"
  ON ai_plan_items FOR UPDATE
  USING (plan_id IN (SELECT id FROM ai_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own ai_plan_items"
  ON ai_plan_items FOR DELETE
  USING (plan_id IN (SELECT id FROM ai_plans WHERE user_id = auth.uid()));

-- subscriptions: ユーザーは自分のサブスクリプションのみアクセス可能
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. トリガー関数（updated_at 自動更新）
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles の updated_at トリガー
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- goals の updated_at トリガー
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- subscriptions の updated_at トリガー
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. ユーザー作成時のプロフィール自動作成トリガー
-- ============================================

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 完了
-- ============================================
