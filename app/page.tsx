import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import HomeContent from '@/components/HomeContent'

export default async function Home() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Get user profile if logged in
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    profile = data
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} profile={profile} />
      <HomeContent user={user} />
    </div>
  )
}
