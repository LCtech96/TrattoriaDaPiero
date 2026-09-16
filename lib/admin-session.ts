/**
 * Verifica lato client se esiste una sessione admin valida.
 *
 * Il cookie di sessione è httpOnly, quindi il browser non può leggerlo:
 * si chiede al server. Sostituisce il vecchio flag in sessionStorage, che
 * chiunque poteva impostare a mano dalla console per entrare nel pannello.
 */
export async function checkAdminSession(): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/session', { cache: 'no-store' })
    if (!response.ok) return false
    const data = await response.json()
    return data?.authenticated === true
  } catch {
    return false
  }
}

export async function adminLogout(): Promise<void> {
  try {
    await fetch('/api/admin/logout', { method: 'POST' })
  } catch {
    // Anche se la chiamata fallisce reindirizziamo comunque al login.
  }
}
