import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (!supabase || !email || password.length < 6) {
      setMessage('Renseigne un e-mail et un mot de passe d’au moins 6 caractères.')
      return
    }
    setBusy(true)
    setMessage('')
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (result.error) setMessage(result.error.message)
    else if (mode === 'signup' && !result.data.session) setMessage('Compte créé. Vérifie ton e-mail pour confirmer la connexion.')
  }

  return <div className="login-screen"><div className="login-card"><div className="logo big">SP</div><p className="eyebrow">Stock partagé</p><h1>Stock Phyto</h1><p>Connecte-toi pour retrouver le même stock sur ton ordinateur, ton iPhone et ta tablette.</p><label>E-mail<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Mot de passe<input type="password" autoComplete={mode==='login'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="primary large" disabled={busy} onClick={submit}>{busy?'Connexion…':mode==='login'?'Se connecter':'Créer mon compte'}</button><button className="link-btn" onClick={()=>{setMode(mode==='login'?'signup':'login');setMessage('')}}>{mode==='login'?'Créer un compte':'J’ai déjà un compte'}</button>{message&&<p className="login-message">{message}</p>}</div></div>
}
