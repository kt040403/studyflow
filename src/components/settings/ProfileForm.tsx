'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/app/(dashboard)/settings/actions'
import type { Profile } from '@/types/database'
import { toast } from 'sonner'

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateProfile(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('プロフィールを更新しました')
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          type="email"
          value={profile.email || ''}
          disabled
          className="bg-zinc-50 dark:bg-zinc-900"
        />
        <p className="text-xs text-muted-foreground">
          メールアドレスは変更できません
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="display_name">表示名</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={profile.display_name || ''}
          placeholder="表示名を入力"
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            保存中...
          </>
        ) : (
          '保存'
        )}
      </Button>
    </form>
  )
}
