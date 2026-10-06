"use client"

import { useState } from "react"
import { Button, Icon, Logo } from "@/components/shared/ui"
export function Auth({
  onLogin,
  onBack,
}: {
  onLogin: (role: "parent" | "admin") => void
  onBack: () => void
}) {
  const [forgot, setForgot] = useState(0)
  const [role, setRole] = useState<"parent" | "admin">("parent")
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
          {forgot === 0 ? (
            <>
              <div className="mobile-logo">
                <Logo />
              </div>
              <span className="eyebrow">Espace sécurisé</span>
              <h1>Bienvenue</h1>
              <p>Connectez-vous à votre espace.</p>
              <div className="role-switch">
                <button
                  className={role === "parent" ? "active" : ""}
                  onClick={() => setRole("parent")}
                >
                  Parent / Tuteur
                </button>
                <button
                  className={role === "admin" ? "active" : ""}
                  onClick={() => setRole("admin")}
                >
                  Administration
                </button>
              </div>
              <label>
                Numéro de téléphone ou adresse e-mail
                <input
                  defaultValue={
                    role === "parent"
                      ? "+225 07 00 00 00 00"
                      : "admin@horizon.edu"
                  }
                />
              </label>
              <label>
                Mot de passe
                <div className="input-icon">
                  <input type="password" defaultValue="horizon2026" />
                  <Icon name="eye" size={18} />
                </div>
              </label>
              <div className="form-options">
                <label className="check">
                  <input type="checkbox" defaultChecked /> Se souvenir de moi
                </label>
                <button onClick={() => setForgot(1)}>
                  Mot de passe oublié ?
                </button>
              </div>
              <Button onClick={() => onLogin(role)}>
                Se connecter <Icon name="arrow" size={18} />
              </Button>
              <div className="secure-note">
                <Icon name="shield" size={17} /> Connexion protégée et données
                chiffrées
              </div>
              <a className="help">Besoin d’aide ? Contactez l’établissement</a>
            </>
          ) : (
            <ForgotStep step={forgot} setStep={setForgot} />
          )}
        </div>
      </div>
    </div>
  )
}

export function ForgotStep({
  step,
  setStep,
}: {
  step: number
  setStep: (n: number) => void
}) {
  const titles = [
    "",
    "Réinitialiser votre mot de passe",
    "Vérification",
    "Nouveau mot de passe",
    "Mot de passe modifié",
  ]
  return (
    <div className="forgot">
      <button
        className="icon-btn"
        onClick={() => setStep(step === 1 ? 0 : step - 1)}
      >
        <Icon name="arrow" />
      </button>
      <span className={`success-orb ${step === 4 ? "done" : ""}`}>
        <Icon name={step === 4 ? "check" : step === 2 ? "shield" : "user"} />
      </span>
      <h1>{titles[step]}</h1>
      <p>
        {step === 1
          ? "Saisissez l’adresse e-mail ou le numéro associé à votre compte."
          : step === 2
            ? "Un code à 6 chiffres vient de vous être envoyé."
            : step === 3
              ? "Choisissez un mot de passe sûr et facile à retenir."
              : "Votre mot de passe a été réinitialisé avec succès."}
      </p>
      {step === 1 && (
        <label>
          Adresse e-mail ou numéro de téléphone
          <input placeholder="ex. +225 07 00 00 00 00" />
        </label>
      )}
      {step === 2 && (
        <div className="otp">
          {[0, 0, 0, 0, 0, 0].map((_, i) => (
            <input
              key={i}
              maxLength={1}
              defaultValue={i < 2 ? String(i + 3) : ""}
            />
          ))}
        </div>
      )}
      {step === 3 && (
        <>
          <label>
            Nouveau mot de passe
            <input type="password" defaultValue="horizon2027" />
          </label>
          <label>
            Confirmer le mot de passe
            <input type="password" defaultValue="horizon2027" />
          </label>
        </>
      )}
      {step < 4 ? (
        <Button onClick={() => setStep(step + 1)}>
          {step === 3 ? "Réinitialiser" : "Continuer"}
        </Button>
      ) : (
        <Button onClick={() => setStep(0)}>Revenir à la connexion</Button>
      )}
      {step === 2 && (
        <small className="center">
          Code non reçu ? <b>Renvoyer dans 00:48</b>
        </small>
      )}
    </div>
  )
}
