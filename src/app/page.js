'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="landing-page">
      {/* ===== HERO SECTION ===== */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            🎯 Il tracker usato dai professionisti
          </div>
          <h1 className="hero-title">
            Smetti di <span className="highlight-red">perdere soldi</span> senza sapere dove.<br />
            Inizia a <span className="highlight-green">vincere con i dati</span>.
          </h1>
          <p className="hero-subtitle">
            Schedine Tracker è il gestionale professionale che trasforma le tue scommesse
            in un business: analizza, ottimizza e massimizza il tuo ROI con statistiche avanzate.
          </p>
          <div className="hero-cta-group">
            <Link href="/login" className="cta-primary">
              Inizia Gratis →
            </Link>
            <span className="cta-note">Nessuna carta richiesta • Setup in 30 secondi</span>
          </div>
        </div>

        {/* Social Proof Bar */}
        <div className="social-proof-bar">
          <div className="proof-item">
            <span className="proof-number">2.500+</span>
            <span className="proof-label">Schedine tracciate</span>
          </div>
          <div className="proof-item">
            <span className="proof-number">94%</span>
            <span className="proof-label">Tasso di soddisfazione</span>
          </div>
          <div className="proof-item">
            <span className="proof-number">+18%</span>
            <span className="proof-label">ROI medio utenti</span>
          </div>
        </div>
      </section>

      {/* ===== PROBLEM SECTION ===== */}
      <section className="problem-section">
        <h2 className="section-title">
          ⚠️ Il problema che ogni scommettitore ignora
        </h2>
        <div className="problem-grid">
          <div className="problem-card">
            <div className="problem-icon">📉</div>
            <h3>Perdi senza sapere dove</h3>
            <p>
              Segni le giocate su carta o Excel? Non sai quale sport, quale tipo
              di scommessa o quale bookmaker ti fa perdere di più.
            </p>
          </div>
          <div className="problem-card">
            <div className="problem-icon">🎲</div>
            <h3>Giochi d'istinto, non di strategia</h3>
            <p>
              Senza dati storici, ogni schedina è un tiro nel buio.
              I professionisti decidono basandosi su numeri, non sensazioni.
            </p>
          </div>
          <div className="problem-card">
            <div className="problem-icon">💸</div>
            <h3>Bankroll fuori controllo</h3>
            <p>
              Quanto hai vinto quest'anno? Quanto hai perso? Se non sai
              rispondere al centesimo, stai già perdendo.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SOLUTION SECTION ===== */}
      <section className="solution-section">
        <h2 className="section-title">
          ✅ La soluzione: gestisci le scommesse come un business
        </h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Dashboard in tempo reale</h3>
            <p>
              Visualizza profitti, perdite, ROI e bankroll a colpo d'occhio.
              Tutto aggiornato automaticamente.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Grafici di performance</h3>
            <p>
              Traccia l'andamento mensile con grafici professionali.
              Identifica trend positivi e negativi.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏷️</div>
            <h3>Categorie personalizzate</h3>
            <p>
              Organizza le schedine per sport, tipster o strategia.
              Scopri cosa funziona e cosa no.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Gestione Tipster</h3>
            <p>
              Segui più tipster? Traccia i risultati di ciascuno separatamente
              e identifica i migliori.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Calcolo ROI automatico</h3>
            <p>
              Smetti di calcolare a mano. Il ROI viene calcolato
              automaticamente su ogni categoria.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Accesso ovunque</h3>
            <p>
              Web app responsive: usa Schedine Tracker da desktop,
              tablet o smartphone.
            </p>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="how-it-works-section">
        <h2 className="section-title">
          🚀 Come funziona
        </h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Registrati gratis</h3>
            <p>Crea il tuo account in 30 secondi. Nessuna carta di credito.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Inserisci le schedine</h3>
            <p>Aggiungi puntata, quota e risultato. Il sistema fa il resto.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Analizza e migliora</h3>
            <p>Studia i grafici, identifica pattern, ottimizza la strategia.</p>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIAL ===== */}
      <section className="testimonial-section">
        <div className="testimonial-card">
          <p className="testimonial-text">
            "Prima usavo Excel e non capivo dove perdevo. Con Schedine Tracker
            ho scoperto che il 70% delle mie perdite venivano dal tennis.
            Ho tagliato quella categoria e in 3 mesi sono tornato in profitto."
          </p>
          <div className="testimonial-author">
            <span className="author-name">Marco T.</span>
            <span className="author-role">Scommettitore professionista</span>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="final-cta-section">
        <h2>Pronto a smettere di perdere alla cieca?</h2>
        <p>Unisciti agli scommettitori che hanno scelto di vincere con i dati.</p>
        <Link href="/login" className="cta-primary cta-large">
          Inizia Gratis Ora →
        </Link>
        <p className="cta-subtext">
          ✓ Gratis per sempre sul piano base &nbsp;•&nbsp; ✓ Nessuna carta richiesta
        </p>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <p>© 2025 Schedine Tracker. Tutti i diritti riservati.</p>
        <p className="disclaimer">
          ⚠️ Il gioco d'azzardo può creare dipendenza. Gioca responsabilmente.
        </p>
      </footer>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%);
          color: #fff;
        }

        /* Hero Section */
        .hero-section {
          padding: 80px 24px;
          text-align: center;
          max-width: 900px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-block;
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          color: #00ff88;
          padding: 8px 20px;
          border-radius: 50px;
          font-size: 0.9rem;
          margin-bottom: 24px;
        }

        .hero-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }

        .highlight-red {
          color: #ff4757;
        }

        .highlight-green {
          color: #00ff88;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #9ca3af;
          max-width: 650px;
          margin: 0 auto 32px;
          line-height: 1.6;
        }

        .hero-cta-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .cta-primary {
          display: inline-block;
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          color: #000;
          padding: 16px 40px;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
        }

        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 255, 136, 0.4);
        }

        .cta-note {
          color: #6b7280;
          font-size: 0.85rem;
        }

        /* Social Proof Bar */
        .social-proof-bar {
          display: flex;
          justify-content: center;
          gap: 48px;
          margin-top: 60px;
          padding-top: 40px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          flex-wrap: wrap;
        }

        .proof-item {
          text-align: center;
        }

        .proof-number {
          display: block;
          font-size: 2rem;
          font-weight: 800;
          color: #00ff88;
        }

        .proof-label {
          color: #6b7280;
          font-size: 0.9rem;
        }

        /* Section Styling */
        section {
          padding: 80px 24px;
          max-width: 1100px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 48px;
        }

        /* Problem Section */
        .problem-section {
          background: rgba(255, 71, 87, 0.03);
        }

        .problem-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .problem-card {
          background: rgba(255, 71, 87, 0.05);
          border: 1px solid rgba(255, 71, 87, 0.2);
          border-radius: 16px;
          padding: 28px;
        }

        .problem-icon {
          font-size: 2.5rem;
          margin-bottom: 16px;
        }

        .problem-card h3 {
          font-size: 1.2rem;
          margin-bottom: 12px;
          color: #ff4757;
        }

        .problem-card p {
          color: #9ca3af;
          line-height: 1.6;
        }

        /* Solution Section */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .feature-card {
          background: rgba(0, 255, 136, 0.03);
          border: 1px solid rgba(0, 255, 136, 0.15);
          border-radius: 16px;
          padding: 28px;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          border-color: rgba(0, 255, 136, 0.4);
          transform: translateY(-4px);
        }

        .feature-icon {
          font-size: 2rem;
          margin-bottom: 16px;
        }

        .feature-card h3 {
          font-size: 1.15rem;
          margin-bottom: 10px;
          color: #fff;
        }

        .feature-card p {
          color: #9ca3af;
          line-height: 1.5;
          font-size: 0.95rem;
        }

        /* How It Works */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 32px;
        }

        .step-card {
          text-align: center;
          padding: 24px;
        }

        .step-number {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          color: #000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0 auto 20px;
        }

        .step-card h3 {
          font-size: 1.2rem;
          margin-bottom: 10px;
        }

        .step-card p {
          color: #9ca3af;
        }

        /* Testimonial */
        .testimonial-section {
          background: rgba(0, 168, 255, 0.03);
        }

        .testimonial-card {
          max-width: 700px;
          margin: 0 auto;
          text-align: center;
          padding: 48px;
          background: rgba(0, 168, 255, 0.05);
          border: 1px solid rgba(0, 168, 255, 0.2);
          border-radius: 20px;
        }

        .testimonial-text {
          font-size: 1.2rem;
          font-style: italic;
          line-height: 1.7;
          color: #e0e0e0;
          margin-bottom: 24px;
        }

        .author-name {
          display: block;
          font-weight: 700;
          color: #00a8ff;
        }

        .author-role {
          color: #6b7280;
          font-size: 0.9rem;
        }

        /* Final CTA */
        .final-cta-section {
          text-align: center;
          padding: 100px 24px;
        }

        .final-cta-section h2 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 16px;
        }

        .final-cta-section > p {
          color: #9ca3af;
          font-size: 1.1rem;
          margin-bottom: 32px;
        }

        .cta-large {
          padding: 20px 50px;
          font-size: 1.2rem;
        }

        .cta-subtext {
          color: #6b7280;
          font-size: 0.9rem;
          margin-top: 16px;
        }

        /* Footer */
        .landing-footer {
          text-align: center;
          padding: 40px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: #6b7280;
          font-size: 0.9rem;
        }

        .disclaimer {
          margin-top: 12px;
          color: #ff9800;
          font-size: 0.8rem;
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 60px 20px;
          }

          .social-proof-bar {
            gap: 24px;
          }

          section {
            padding: 60px 20px;
          }
        }
      `}</style>
    </div>
  )
}
