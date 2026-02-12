import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GoalForm } from '@/components/goals/GoalForm'
import { updateGoal } from '../../actions'

export default async function EditGoalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return notFound()

  const { data: goal } = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!goal) return notFound()

  const handleUpdate = async (formData: FormData) => {
    'use server'
    return updateGoal(id, formData)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <GoalForm goal={goal} action={handleUpdate} submitLabel="変更を保存" />
    </div>
  )
}
