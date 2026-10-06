"use client"

import {
  Amount,
  Badge,
  Button,
  Icon,
  Logo,
  type IconName,
} from "@/components/shared/ui"
export function Landing({
  onLogin,
  onExplore,
}: {
  onLogin: () => void
  onExplore: () => void
}) {
  return (
    <div className="landing">
      <header className="marketing-nav wrap">
        <Logo />
        <nav>
          <a href="#atouts">Pourquoi Horizon</a>
          <a href="#fonctionnement">Fonctionnement</a>
          <a href="#confiance">Transparence</a>
        </nav>
        <Button onClick={onLogin}>Se connecter</Button>
      </header>
      <main>
        <section className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow">
              <Icon name="shield" size={16} /> Fiable. Clair. Toujours
              accessible.
            </div>
            <h1>
              Le suivi scolaire financier, <em>simplement.</em>
            </h1>
            <p>
              Permettez aux parents de suivre en toute transparence les
              contributions scolaires, les paiements et les échéances de leurs
              enfants.
            </p>
            <div className="hero-actions">
              <Button onClick={onLogin}>
                Se connecter <Icon name="arrow" size={18} />
              </Button>
              <Button variant="secondary" onClick={onExplore}>
                Découvrir la plateforme
              </Button>
            </div>
            <div className="hero-trust">
              <span>
                <Icon name="check" size={15} /> Données sécurisées
              </span>
              <span>
                <Icon name="check" size={15} /> Accessible 24h/24
              </span>
            </div>
          </div>
          <div
            className="hero-visual"
            aria-label="Aperçu du tableau de bord financier"
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="phone">
              <div className="phone-top">
                <Logo compact />
                <span className="mini-avatar">AK</span>
              </div>
              <small>Bonjour, Aminata</small>
              <h3>Situation de David</h3>
              <div className="mini-balance">
                <span>Reste à payer</span>
                <strong>
                  150 000 <small>FCFA</small>
                </strong>
                <div className="progress">
                  <span className="w-67" />
                </div>
                <small>67% de la scolarité réglée</small>
              </div>
              <div className="mini-row">
                <span className="mini-icon green">
                  <Icon name="check" size={16} />
                </span>
                <div>
                  <b>Paiement enregistré</b>
                  <small>100 000 FCFA • 02 sept.</small>
                </div>
              </div>
              <div className="mini-row">
                <span className="mini-icon orange">
                  <Icon name="calendar" size={16} />
                </span>
                <div>
                  <b>Prochaine échéance</b>
                  <small>50 000 FCFA • 15 oct.</small>
                </div>
              </div>
            </div>
            <div className="float-card float-paid">
              <span className="mini-icon green">
                <Icon name="check" size={18} />
              </span>
              <div>
                <small>Déjà payé</small>
                <b>300 000 FCFA</b>
              </div>
            </div>
            <div className="float-card float-date">
              <Icon name="bell" size={18} />
              <div>
                <b>Échéance à venir</b>
                <small>Dans 9 jours</small>
              </div>
            </div>
          </div>
        </section>
        <section className="trust-strip">
          <div className="wrap stats-strip">
            <div>
              <b>100%</b>
              <span>transparent</span>
            </div>
            <div>
              <b>24h/24</b>
              <span>accessible</span>
            </div>
            <div>
              <b>1 espace</b>
              <span>pour toute la famille</span>
            </div>
            <p>Conçu pour rapprocher les familles et leur établissement.</p>
          </div>
        </section>
        <section className="section wrap" id="atouts">
          <div className="section-heading">
            <span>Tout ce qui compte</span>
            <h2>Vos finances scolaires, sans zones d’ombre.</h2>
            <p>
              Une information utile, présentée au bon moment et comprise en
              quelques secondes.
            </p>
          </div>
          <div className="feature-grid">
            {[
              [
                "wallet",
                "Suivi des paiements",
                "Visualisez instantanément ce qui a été payé et ce qu’il reste à régler.",
              ],
              [
                "calendar",
                "Échéances claires",
                "Anticipez chaque date et chaque montant, sans mauvaise surprise.",
              ],
              [
                "receipt",
                "Historique transparent",
                "Retrouvez chaque transaction et son reçu numérique en un seul endroit.",
              ],
              [
                "bell",
                "Notifications automatiques",
                "Recevez les rappels utiles avant une échéance ou après un paiement.",
              ],
            ].map(([icon, title, text], i) => (
              <article className="feature-card" key={title}>
                <span className={`feature-icon f-${i}`}>
                  <Icon name={icon as IconName} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
                <a onClick={onExplore}>
                  En savoir plus <Icon name="arrow" size={15} />
                </a>
              </article>
            ))}
          </div>
        </section>
        <section className="section how" id="fonctionnement">
          <div className="wrap">
            <div className="section-heading light">
              <span>Simple par nature</span>
              <h2>
                Une expérience fluide, du premier jour au dernier paiement.
              </h2>
            </div>
            <div className="steps">
              {[
                "L’établissement enregistre l’apprenant",
                "Le parent accède à son espace",
                "La situation est toujours visible",
                "Les paiements sont enregistrés",
                "Les rappels arrivent au bon moment",
              ].map((step, i) => (
                <div className="step" key={step}>
                  <b>0{i + 1}</b>
                  <span>{step}</span>
                  {i < 4 && <Icon name="arrow" />}
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="section wrap transparency" id="confiance">
          <div className="quote-card">
            <div>
              <span className="eyebrow">La transparence au quotidien</span>
              <h2>
                Plus de visibilité.
                <br />
                <em>Moins de confusion.</em>
              </h2>
              <p>
                Parents et administration partagent enfin la même information,
                au même moment. Les échanges deviennent plus simples, et la
                confiance grandit.
              </p>
              <Button onClick={onExplore}>Voir un exemple</Button>
            </div>
            <div className="quote-metrics">
              <div>
                <span>Progression annuelle</span>
                <b>66,7%</b>
                <div className="progress large">
                  <span className="w-67" />
                </div>
              </div>
              <div className="metric-row">
                <span>
                  <small>Montant total</small>
                  <b>450 000 FCFA</b>
                </span>
                <span>
                  <small>Déjà payé</small>
                  <b className="green-text">300 000 FCFA</b>
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="cta wrap">
          <div>
            <span>Prêt à simplifier le suivi scolaire ?</span>
            <h2>
              Une gestion plus simple pour l’établissement et les parents.
            </h2>
          </div>
          <Button onClick={onLogin}>
            Accéder à la plateforme <Icon name="arrow" size={18} />
          </Button>
        </section>
      </main>
      <footer>
        <div className="wrap footer-grid">
          <div>
            <Logo />
            <p>
              La plateforme de confiance pour le suivi des contributions
              scolaires.
            </p>
          </div>
          <div>
            <b>Plateforme</b>
            <a>À propos</a>
            <a>Assistance</a>
          </div>
          <div>
            <b>Nous contacter</b>
            <a>contact@horizon.edu</a>
            <a>+225 07 00 00 00 00</a>
          </div>
          <div>
            <b>Informations</b>
            <a>Confidentialité</a>
            <a>Conditions d’utilisation</a>
          </div>
        </div>
        <div className="wrap copyright">
          © 2026 Complexe Scolaire Horizon{" "}
          <span>Une éducation sereine commence par la confiance.</span>
        </div>
      </footer>
    </div>
  )
}
