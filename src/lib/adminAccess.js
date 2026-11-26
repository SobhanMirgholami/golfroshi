import { supabase, isDemo } from './supabaseClient'

const DEMO_KEY = 'golfroshi-demo-admin'
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || 'golfroshi'

// Demo mode has no server, so this password only guards the demo UI, not real data
function demoSignedIn() {
  try {
    return sessionStorage.getItem(DEMO_KEY) === '1'
  } catch {
    return false
  }
}

export async function signIn(email, password) {
  if (isDemo) {
    if (password !== DEMO_PASSWORD) throw new Error('invalid')
    try {
      sessionStorage.setItem(DEMO_KEY, '1')
    } catch {
      // storage blocked: sign-in lasts until the page reloads
    }
    window.dispatchEvent(new Event('golfroshi-auth'))
    return
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signOut() {
  if (isDemo) {
    try {
      sessionStorage.removeItem(DEMO_KEY)
    } catch {
      // nothing stored
    }
    window.dispatchEvent(new Event('golfroshi-auth'))
    return
  }
  await supabase.auth.signOut()
}

// Signed in is not enough: the account must also be listed in admin_users
export async function getAdminAccess() {
  if (isDemo) return { status: demoSignedIn() ? 'allowed' : 'signedOut', userId: demoSignedIn() ? 'demo' : null }

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) {
    if (authError.name === 'AuthSessionMissingError' || authError.status === 401) return { status: 'signedOut', userId: null }
    throw authError
  }
  const user = authData.user
  if (!user) return { status: 'signedOut', userId: null }

  const { data, error } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle()
  if (error) throw error
  return { status: data?.user_id === user.id ? 'allowed' : 'denied', userId: user.id }
}

export function onAuthChange(callback) {
  if (isDemo) {
    window.addEventListener('golfroshi-auth', callback)
    return () => window.removeEventListener('golfroshi-auth', callback)
  }
  const { data } = supabase.auth.onAuthStateChange((event, session) => callback(event, session))
  return () => data.subscription.unsubscribe()
}
