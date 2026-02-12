import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { startOfMonth } from 'date-fns'
import type { Profile, Goal, AIPlan } from '@/types/database'

interface PlanInput {
  goalId: string
  goalTitle: string
  goalDescription: string | null
  category: string
  skillLevel: 'beginner' | 'beginner_intermediate' | 'intermediate' | 'advanced'
  dailyHours: number
  targetDate: string
  additionalNotes: string
}

interface GeneratedPlanItem {
  day_number: number
  title: string
  description: string
  estimated_minutes: number
}

interface GeneratedPlan {
  title: string
  total_days: number
  items: GeneratedPlanItem[]
}

const skillLevelLabels: Record<string, string> = {
  beginner: '初心者',
  beginner_intermediate: '初中級',
  intermediate: '中級',
  advanced: '上級',
}

const categoryLabels: Record<string, string> = {
  programming: 'プログラミング',
  language: '語学',
  certification: '資格',
  other: 'その他',
}

function buildPrompt(input: PlanInput): string {
  return `あなたは学習計画のエキスパートです。以下の情報をもとに、
具体的で実行可能な日別学習計画を作成してください。

## 学習目標
- 目標: ${input.goalTitle}
- 詳細: ${input.goalDescription || '特になし'}
- カテゴリ: ${categoryLabels[input.category] || input.category}

## 学習者情報
- 現在のスキルレベル: ${skillLevelLabels[input.skillLevel] || input.skillLevel}
- 1日の学習可能時間: ${input.dailyHours}時間
- 達成期限: ${input.targetDate}
- 追加の希望: ${input.additionalNotes || '特になし'}

## 出力形式
以下のJSON形式で出力してください。他のテキストは含めないでください。

{
  "title": "計画タイトル",
  "total_days": 日数,
  "items": [
    {
      "day_number": 1,
      "title": "Day 1: ○○の基礎",
      "description": "具体的な学習内容と推奨リソース",
      "estimated_minutes": 120
    }
  ]
}

## 注意事項
- **計画は最大21日間（3週間）以内に収めること。期限が長くても21日以内で達成できる計画にすること**
- 各日の学習時間は${input.dailyHours}時間（${input.dailyHours * 60}分）以内に収めること
- 週1日は復習日を設けること
- 具体的な学習リソース（書籍、Udemy、公式ドキュメント等）を含めること
- 段階的に難易度を上げること
- 実践的なアウトプット（小さなプロジェクト等）を含めること
- 期限までの日数を考慮して現実的な計画を立てること
- **必ず純粋なJSONのみを出力すること。マークダウンのコードフェンス（\`\`\`json等）は使用しないこと**`
}

async function checkAIUsage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  plan: Profile['plan']
): Promise<{ allowed: boolean; error?: string; remaining?: number }> {
  if (plan === 'free') {
    return { allowed: false, error: 'AI機能はProプラン以上で利用できます' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('ai_usage_count, ai_usage_reset_at')
    .eq('id', userId)
    .single() as { data: Pick<Profile, 'ai_usage_count' | 'ai_usage_reset_at'> | null }

  if (!profile) {
    return { allowed: false, error: 'プロフィールが見つかりません' }
  }

  const now = new Date()
  const monthStart = startOfMonth(now)

  // 月初リセット
  if (!profile.ai_usage_reset_at || new Date(profile.ai_usage_reset_at) < monthStart) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('profiles')
      .update({ ai_usage_count: 0, ai_usage_reset_at: now.toISOString() })
      .eq('id', userId)

    const remaining = plan === 'pro' ? 10 : Infinity
    return { allowed: true, remaining }
  }

  if (plan === 'pro' && profile.ai_usage_count >= 10) {
    return { allowed: false, error: '今月のAI生成回数上限（10回）に達しました' }
  }

  const remaining = plan === 'pro' ? 10 - profile.ai_usage_count : Infinity
  return { allowed: true, remaining }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // プロフィール取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single() as { data: Pick<Profile, 'plan'> | null }

    if (!profile) {
      return NextResponse.json({ error: 'プロフィールが見つかりません' }, { status: 404 })
    }

    // AI使用回数チェック
    const usageCheck = await checkAIUsage(supabase, user.id, profile.plan)
    if (!usageCheck.allowed) {
      return NextResponse.json({ error: usageCheck.error }, { status: 403 })
    }

    // リクエストボディ取得
    const body: PlanInput = await request.json()

    // 目標の存在確認
    const { data: goal } = await supabase
      .from('goals')
      .select('id, title, description, category')
      .eq('id', body.goalId)
      .eq('user_id', user.id)
      .single() as { data: Pick<Goal, 'id' | 'title' | 'description' | 'category'> | null }

    if (!goal) {
      return NextResponse.json({ error: '目標が見つかりません' }, { status: 404 })
    }

    // プロンプト構築
    const prompt = buildPrompt({
      ...body,
      goalTitle: goal.title,
      goalDescription: goal.description,
      category: goal.category,
    })

    // Claude API呼び出し
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // レスポンスからテキスト抽出
    const responseText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')

    // JSONパース
    let generatedPlan: GeneratedPlan
    try {
      // マークダウンのコードフェンスを除去
      let jsonString = responseText.trim()

      // ```json ... ``` または ``` ... ``` を除去
      const codeBlockMatch = jsonString.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/m)
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1].trim()
      } else {
        // 部分的なコードフェンスの除去（開始のみ、終了のみのケースにも対応）
        jsonString = jsonString
          .replace(/^```(?:json)?\s*/m, '')
          .replace(/\s*```$/m, '')
          .trim()
      }

      generatedPlan = JSON.parse(jsonString)
    } catch {
      console.error('Failed to parse AI response:', responseText)
      return NextResponse.json(
        { error: 'AI応答の解析に失敗しました。もう一度お試しください。' },
        { status: 500 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any

    // ai_plans テーブルに保存
    const { data: planData, error: planError } = await sb
      .from('ai_plans')
      .insert({
        user_id: user.id,
        goal_id: body.goalId,
        title: generatedPlan.title,
        prompt_used: prompt,
        raw_response: responseText,
        total_days: generatedPlan.total_days,
        is_active: true,
      })
      .select()
      .single()

    if (planError) {
      console.error('Failed to save plan:', planError)
      return NextResponse.json({ error: '計画の保存に失敗しました' }, { status: 500 })
    }

    // ai_plan_items テーブルに保存
    const planItems = generatedPlan.items.map((item, index) => ({
      plan_id: planData.id,
      day_number: item.day_number,
      title: item.title,
      description: item.description,
      estimated_minutes: item.estimated_minutes,
      is_completed: false,
      sort_order: index,
    }))

    const { error: itemsError } = await sb
      .from('ai_plan_items')
      .insert(planItems)

    if (itemsError) {
      console.error('Failed to save plan items:', itemsError)
      // ロールバック
      await sb.from('ai_plans').delete().eq('id', planData.id)
      return NextResponse.json({ error: '計画アイテムの保存に失敗しました' }, { status: 500 })
    }

    // AI使用回数をインクリメント
    await sb
      .from('profiles')
      .update({ ai_usage_count: (await supabase
        .from('profiles')
        .select('ai_usage_count')
        .eq('id', user.id)
        .single() as { data: { ai_usage_count: number } | null }).data?.ai_usage_count! + 1 })
      .eq('id', user.id)

    return NextResponse.json({
      success: true,
      plan: {
        id: planData.id,
        title: generatedPlan.title,
        total_days: generatedPlan.total_days,
        items: generatedPlan.items,
      },
      remaining: profile.plan === 'pro' ? (usageCheck.remaining! - 1) : undefined,
    })
  } catch (error) {
    console.error('Generate plan error:', error)
    return NextResponse.json(
      { error: '計画の生成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
