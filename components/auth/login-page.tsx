"use client"

import { useEffect, useState, type FormEvent } from "react"

import { Button, Icon, Logo } from "@/components/shared/ui"

import { createSupabaseBrowserClient } from "@/lib/supabase/browser"

type PortalRole = "parent" | "admin"

type AuthView = "login" | "forgot" | "recovery" | "recovery-complete"

export function Auth({
  onLogin,

  onBack,

  onDemo,

  supabaseConfigured,

  demoEnabled,
}: {
  onLogin: (role: PortalRole) => void

  onBack: () => void

  onDemo: (role: PortalRole) => Promise<void>

  supabaseConfigured: boolean

  demoEnabled: boolean
}) {
  const [view, setView] = useState<AuthView>("login")

  const [role, setRole] = useState<PortalRole>("parent")

  const [email, setEmail] = useState("")

  const [password, setPassword] = useState("")

  const [newPassword, setNewPassword] = useState("")

  const [confirmation, setConfirmation] = useState("")

  const [message, setMessage] = useState("")

  const [error, setError] = useState("")

  const [pending, setPending] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const recovery = params.get("recovery")
    const reason = params.get("reason")

    if (recovery === "1") {
      setView("recovery")
    } else if (recovery === "error") {
      setError("Le lien de réinitialisation est invalide ou expiré.")
    } else if (reason === "role") {
      setError(
        "Votre compte n’est pas autorisé à accéder à cet espace. Contactez l’administration.",
      )
    }
  }, [])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError("")

    setMessage("")

    if (!supabaseConfigured) {
      setError("La connexion Supabase n’est pas configurée.")

      return
    }

    setPending(true)

    try {
      const supabase = createSupabaseBrowserClient()

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),

          password,
        })

      if (signInError) {
        setError("Adresse e-mail ou mot de passe incorrect.")

        return
      }

      onLogin(role)
    } catch (caughtError) {
      console.error("Échec de la connexion Supabase.", caughtError)

      setError("La connexion a échoué. Réessayez dans un instant.")
    } finally {
      setPending(false)
    }
  }

  async function requestPasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError("")

    setMessage("")

    if (!supabaseConfigured) {
      setError("La récupération du mot de passe nécessite Supabase.")

      return
    }

    setPending(true)

    try {
      const redirectTo = new URL("/auth/callback", window.location.origin)

      redirectTo.searchParams.set("next", "/login?recovery=1")

      const { error: resetError } =
        await createSupabaseBrowserClient().auth.resetPasswordForEmail(
          email.trim(),

          { redirectTo: redirectTo.toString() },
        )

      if (resetError) throw resetError

      setMessage(
        "Si un compte correspond à cette adresse, un lien de réinitialisation va vous être envoyé.",
      )
    } catch (caughtError) {
      console.error("Échec de la demande de réinitialisation.", caughtError)

      setError(
        "Impossible d’envoyer le lien. Vérifiez l’adresse et la configuration e-mail Supabase.",
      )
    } finally {
      setPending(false)
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError("")

    setMessage("")

    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.")

      return
    }

    if (newPassword !== confirmation) {
      setError("Les mots de passe ne correspondent pas.")

      return
    }

    setPending(true)

    try {
      const { error: updateError } =
        await createSupabaseBrowserClient().auth.updateUser({
          password: newPassword,
        })

      if (updateError) throw updateError

      setView("recovery-complete")
    } catch (caughtError) {
      console.error("Échec de la mise à jour du mot de passe.", caughtError)

      setError(
        "Le lien est invalide ou expiré. Demandez un nouveau lien de réinitialisation.",
      )
    } finally {
      setPending(false)
    }
  }

  async function enterDemo() {
    setError("")

    setPending(true)

    try {
      await onDemo(role)
    } catch (caughtError) {
      console.error(
        "Impossible d’ouvrir le portail de démonstration.",
        caughtError,
      )

      setError("Impossible d’ouvrir la démonstration.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="auth-page">
      <button className="back-link" onClick={onBack}>
        <Icon name="arrow" size={18} /> Retour à l’accueil
      </button>
      <div className="auth-brand">
        <Logo />
        <div>
          <span>Un espace. Une information claire.</span>
          <h2>
            Suivez l’essentiel,
            <br />
            en toute sérénité.
          </h2>
          <p>
            Vos paiements, vos échéances et vos reçus sont accessibles à tout
            moment.
          </p>
        </div>
        <blockquote>
          “Je sais toujours où j’en suis, sans avoir à appeler l’école.”
          <small>Aminata K., parent d’élève</small>
        </blockquote>
      </div>
      <div className="auth-panel">
        <div className="auth-box">
          {view === "login" && (
            <>
              <div className="mobile-logo">
                <Logo />
              </div>
              <span className="eyebrow">Espace sécurisé</span>
              <h1>Bienvenue</h1>
              <p>Connectez-vous à votre espace.</p>
              <div className="role-switch">
                <button
                  type="button"
                  className={role === "parent" ? "active" : ""}
                  onClick={() => setRole("parent")}
                >
                  Parent / Tuteur
                </button>
                <button
                  type="button"
                  className={role === "admin" ? "active" : ""}
                  onClick={() => setRole("admin")}
                >
                  Administration
                </button>
              </div>
              <form onSubmit={handleLogin}>
                <label htmlFor="login-email">
                  Adresse e-mail
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nom@exemple.com"
                  />
                </label>
                <label htmlFor="login-password">
                  Mot de passe
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>
                <div className="form-options">
                  <span />
                  <button type="button" onClick={() => setView("forgot")}>
                    Mot de passe oublié ?
                  </button>
                </div>
                {error && (
                  <p className="auth-feedback error" role="alert">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={pending || !supabaseConfigured}>
                  {pending ? "Connexion…" : "Se connecter"}{" "}
                  <Icon name="arrow" size={18} />
                </Button>
              </form>
              {!supabaseConfigured && (
                <p className="auth-feedback error" role="alert">
                  Supabase n’est pas configuré pour cette application.
                </p>
              )}
              {demoEnabled && (
                <Button
                  variant="secondary"
                  disabled={pending}
                  onClick={() => void enterDemo()}
                >
                  Explorer la démo avec les données fictives
                </Button>
              )}
              {message && <p className="auth-feedback success">{message}</p>}
              <div className="secure-note">
                <Icon name="shield" size={17} /> Connexion protégée et données
                chiffrées
              </div>
              <a className="help">Besoin d’aide ? Contactez l’établissement</a>
            </>
          )}

          {view === "forgot" && (
            <form className="forgot" onSubmit={requestPasswordReset}>
              <button
                className="icon-btn"
                type="button"
                onClick={() => {
                  setError("")

                  setMessage("")

                  setView("login")
                }}
                aria-label="Retour à la connexion"
              >
                <Icon name="arrow" />
              </button>
              <span className="success-orb">
                <Icon name="user" />
              </span>
              <h1>Réinitialiser votre mot de passe</h1>
              <p>
                Saisissez l’adresse e-mail associée à votre compte. Nous vous
                enverrons un lien sécurisé.
              </p>
              <label htmlFor="reset-email">
                Adresse e-mail
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nom@exemple.com"
                />
              </label>
              {error && (
                <p className="auth-feedback error" role="alert">
                  {error}
                </p>
              )}
              {message && <p className="auth-feedback success">{message}</p>}
              <Button type="submit" disabled={pending}>
                {pending ? "Envoi…" : "Envoyer le lien"}
              </Button>
            </form>
          )}

          {view === "recovery" && (
            <form className="forgot" onSubmit={updatePassword}>
              <span className="success-orb">
                <Icon name="shield" />
              </span>
              <h1>Nouveau mot de passe</h1>
              <p>Choisissez un mot de passe d’au moins 8 caractères.</p>
              <label htmlFor="new-password">
                Nouveau mot de passe
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </label>
              <label htmlFor="confirm-password">
                Confirmer le mot de passe
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                />
              </label>
              {error && (
                <p className="auth-feedback error" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={pending}>
                {pending ? "Mise à jour…" : "Modifier le mot de passe"}
              </Button>
            </form>
          )}

          {view === "recovery-complete" && (
            <div className="forgot">
              <span className="success-orb done">
                <Icon name="check" />
              </span>
              <h1>Mot de passe modifié</h1>
              <p>Votre mot de passe a été mis à jour.</p>
              <Button
                onClick={() => {
                  setPassword("")

                  setView("login")
                }}
              >
                Revenir à la connexion
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
