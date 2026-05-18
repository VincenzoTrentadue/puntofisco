import { useState, useRef, useEffect } from "react";

const PROMPTS = {
  italiana: `Sei PuntoFisco, esperto di fiscalita italiana. Rispondi in modo chiaro e pratico su:
- Dichiarazioni redditi (730, Redditi PF), partita IVA, regimi fiscali (forfettario, ordinario)
- Detrazioni e deduzioni, IMU, TARI, IVA, fatturazione elettronica
- Successioni, donazioni, imposte di registro, bonus fiscali, superbonus
- Lavoro dipendente, CUD, buste paga, capital gain, dividendi
Rispondi in italiano. Sii conciso ma completo. Per casi complessi suggerisci un commercialista. Mai consigli che configurino evasione. Vai dritto alla risposta senza preamboli.`,
  internazionale: `Sei PuntoFisco, esperto di fiscalita internazionale. Rispondi in modo chiaro e pratico su:
- Convenzioni doppia imposizione, residenza fiscale internazionale, trasferimento all'estero
- CFC, transfer pricing, IVIE, IVAFE, monitoraggio fiscale RW, FATCA/CRS
- Redditi esteri di residenti italiani, non residenti con redditi in Italia
- Regime impatriati (art. 5 D.Lgs. 209/2023), IVA intracomunitaria, paradisi fiscali
Rispondi in italiano. Per casi complessi suggerisci un commercialista internazionalista. Mai consigli di evasione. Vai dritto alla risposta senza preamboli.`,
  agevolata: `Sei PuntoFisco, esperto di finanza agevolata italiana ed europea. Rispondi in modo chiaro e pratico su:
- Bandi e incentivi imprese (MISE, MIMIT, PNRR), crediti d'imposta (R&S, formazione 4.0, transizione 5.0, Sud)
- Sabatini, Nuova Sabatini, Resto al Sud, Autoimprenditorialita, Autoimpiego (Invitalia)
- Contratti di sviluppo, fondi strutturali europei (FESR, FSE+), Horizon Europe
- Fondo di Garanzia PMI, SACE, startup e PMI innovative, decontribuzioni, Desonero Sud
- Patent Box, ZES (Zone Economiche Speciali), aree di crisi
Rispondi in italiano. Indica sempre requisiti, importi, come accedere. Per scadenze ravvicinate segnala di verificare sul sito ufficiale. Vai dritto alla risposta senza preamboli.`,
};

const SUGGESTIONS = {
  italiana:      ["Regime forfettario", "Come funziona il 730", "Detrazioni disponibili", "Aprire Partita IVA", "IMU prima casa", "Capital gain in borsa"],
  internazionale:["Doppia imposizione", "Residenza fiscale estera", "Regime impatriati", "Conti esteri RW", "Transfer pricing", "IVA intracomunitaria"],
  agevolata:     ["Nuova Sabatini", "Credito imposta R&S", "Resto al Sud", "Fondi europei PMI", "Zone Economiche Speciali", "Startup innovative"],
};

const SECTIONS = [
  { key: "italiana",       label: "Fiscalità Italiana",       sub: "IRPEF · IVA · IMU · PARTITA IVA · BONUS",        accent: "#1a3a5c", accentLight: "#e8f0f8", accentMid: "#3d6b9e", num: "01" },
  { key: "internazionale", label: "Fiscalità Internazionale",  sub: "DOPPIA IMPOSIZIONE · RESIDENZA · IMPATRIATI",     accent: "#2c1a4a", accentLight: "#ede8f5", accentMid: "#6b4a9e", num: "02" },
  { key: "agevolata",      label: "Finanza Agevolata",         sub: "BANDI · PNRR · CREDITI · FONDI UE · SABATINI",   accent: "#1a3d2c", accentLight: "#e8f5ed", accentMid: "#3d9e6b", num: "03" },
];

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function PuntoFisco() {
  const [view, setView]         = useState("landing");
  const [section, setSection]   = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const messagesEndRef  = useRef(null);
  const inputRef        = useRef(null);
  const cardInputRefs   = useRef({});

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (view === "chat") setTimeout(() => inputRef.current?.focus(), 100); }, [view]);

  const sec = section ? SECTIONS.find(s => s.key === section) : null;

  const sendMessage = async (text, hist = messages) => {
    const next = [...hist, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: PROMPTS[section], messages: next }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.content?.[0]?.text || "Errore nella risposta." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Errore di connessione. Riprova." }]);
    } finally { setLoading(false); }
  };

  const startChat = (key, question = "") => {
    setSection(key);
    setView("chat");
    setMessages([]);
    if (question) setTimeout(() => sendMessage(question, []), 80);
  };

  const goBack = () => { setView("landing"); setMessages([]); setSection(null); setInput(""); };

  // ─── CHAT ──────────────────────────────────────────────────────────────────
  if (view === "chat" && sec) return (
    <div style={{ minHeight: "100vh", background: "#fafaf8", display: "flex", flexDirection: "column", fontFamily: "'Palatino Linotype', Palatino, 'Book Antiqua', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Source+Serif+4:ital,wght@0,300;0,400;1,300&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .chat-input:focus{border-color:${sec.accentMid}!important;box-shadow:0 0 0 3px ${sec.accentLight}!important}
        .send-btn:hover{background:${sec.accent}!important}
        .send-btn:disabled{opacity:.4;cursor:default}
        input::placeholder,textarea::placeholder{color:#aaa}
      `}</style>

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e8e4dc", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px", position: "sticky", top: 0, zIndex: 20, boxShadow: "0 1px 12px rgba(0,0,0,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <button onClick={goBack} style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "#666", fontSize: "13px", letterSpacing: ".06em", fontFamily: "inherit", padding: "6px 0", transition: "color .2s" }}
            onMouseEnter={e => e.currentTarget.style.color = sec.accent}
            onMouseLeave={e => e.currentTarget.style.color = "#666"}>
            <BackIcon /> TORNA ALLA HOME
          </button>
          <div style={{ width: "1px", height: "20px", background: "#ddd" }} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: "600", color: "#1a1a1a", letterSpacing: ".02em" }}>PuntoFisco</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: sec.accentMid }} />
          <span style={{ fontSize: "12px", letterSpacing: ".1em", color: sec.accentMid, fontWeight: "600" }}>{sec.label.toUpperCase()}</span>
        </div>
      </header>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "40px 24px", maxWidth: "800px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: sec.accentLight, border: `2px solid ${sec.accentMid}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "22px" }}>
              {section === "italiana" ? "§" : section === "internazionale" ? "⊕" : "€"}
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#2a2a2a", marginBottom: "8px" }}>{sec.label}</div>
            <div style={{ fontSize: "13px", color: "#999", letterSpacing: ".06em" }}>{sec.sub}</div>
            <div style={{ marginTop: "32px", display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", maxWidth: "560px", marginLeft: "auto", marginRight: "auto" }}>
              {SUGGESTIONS[section].map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)} style={{ background: "#fff", border: `1px solid ${sec.accentMid}40`, color: sec.accentMid, borderRadius: "4px", padding: "7px 14px", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", letterSpacing: ".04em", transition: "all .2s" }}
                  onMouseEnter={e => { e.target.style.background = sec.accentLight; e.target.style.borderColor = sec.accentMid; }}
                  onMouseLeave={e => { e.target.style.background = "#fff"; e.target.style.borderColor = `${sec.accentMid}40`; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "28px", animation: "fadeIn .3s ease both" }}>
            {m.role === "user" ? (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ maxWidth: "70%", background: sec.accent, color: "#fff", borderRadius: "16px 16px 4px 16px", padding: "14px 20px", fontSize: "15px", lineHeight: "1.55", fontFamily: "'Source Serif 4', serif" }}>
                  {m.content}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, width: "34px", height: "34px", borderRadius: "50%", background: sec.accentLight, border: `1.5px solid ${sec.accentMid}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: sec.accentMid, fontWeight: "bold", fontFamily: "'Playfair Display', serif" }}>P</div>
                <div style={{ flex: 1, background: "#fff", border: "1px solid #e8e4dc", borderRadius: "4px 16px 16px 16px", padding: "18px 22px", fontSize: "15px", lineHeight: "1.75", color: "#1a1a1a", fontFamily: "'Source Serif 4', serif", boxShadow: "0 2px 8px rgba(0,0,0,.04)", whiteSpace: "pre-wrap" }}>
                  {m.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "28px" }}>
            <div style={{ flexShrink: 0, width: "34px", height: "34px", borderRadius: "50%", background: sec.accentLight, border: `1.5px solid ${sec.accentMid}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: sec.accentMid, fontWeight: "bold", fontFamily: "'Playfair Display', serif" }}>P</div>
            <div style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: "4px 16px 16px 16px", padding: "18px 22px", boxShadow: "0 2px 8px rgba(0,0,0,.04)", display: "flex", alignItems: "center", gap: "6px" }}>
              {[0,1,2].map(i => <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: sec.accentMid, opacity: 0.4, animation: `blink 1.2s ease-in-out ${i*.3}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ background: "#fff", borderTop: "1px solid #e8e4dc", padding: "20px 24px", boxShadow: "0 -4px 20px rgba(0,0,0,.04)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && input.trim() && !loading) { e.preventDefault(); sendMessage(input.trim()); }}}
              placeholder={`Poni una domanda di ${sec.label.toLowerCase()}...`} disabled={loading} className="chat-input"
              style={{ flex: 1, border: "1.5px solid #ddd", borderRadius: "8px", padding: "14px 18px", fontSize: "15px", fontFamily: "'Source Serif 4', serif", color: "#1a1a1a", background: "#fafaf8", outline: "none", transition: "all .2s" }} />
            <button onClick={() => { if (input.trim() && !loading) sendMessage(input.trim()); }} disabled={loading || !input.trim()} className="send-btn"
              style={{ background: sec.accentMid, color: "#fff", border: "none", borderRadius: "8px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
              <SendIcon />
            </button>
          </div>
          <p style={{ margin: "10px 0 0", fontSize: "11px", color: "#bbb", textAlign: "center", letterSpacing: ".04em" }}>
            PuntoFisco fornisce informazioni a scopo orientativo. Per consulenza specifica rivolgiti a un professionista abilitato.
          </p>
        </div>
      </div>
    </div>
  );

  // ─── LANDING ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#fafaf8", fontFamily: "'Palatino Linotype', Palatino, serif", color: "#1a1a1a", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Source+Serif+4:ital,wght@0,300;0,400;1,300&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes lineGrow{from{width:0}to{width:60px}}
        .nav-link:hover{color:#1a3a5c!important}
        .sec-card{transition:all .35s cubic-bezier(.16,1,.3,1)}
        .sec-card:hover{transform:translateY(-6px);box-shadow:0 20px 60px rgba(0,0,0,.1)!important}
        .sugg-pill:hover{background:var(--al)!important;color:var(--am)!important;border-color:var(--am)!important}
        .cta-card:hover{opacity:.88}
        input::placeholder{color:#bbb}
        .card-input:focus{outline:none;border-color:var(--am)!important;box-shadow:0 0 0 3px var(--al)!important}
        .enter-btn:hover{color:#fff!important;background:var(--am)!important}
        .feature-item:hover{border-color:#c8bfa8!important}
      `}</style>

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e8e4dc", padding: "0 60px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "72px", position: "sticky", top: 0, zIndex: 20, boxShadow: "0 1px 16px rgba(0,0,0,.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", background: "#1a3a5c", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700" }}>P</span>
          </div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "19px", fontWeight: "700", color: "#1a1a1a", letterSpacing: ".01em", lineHeight: 1 }}>PuntoFisco</div>
            <div style={{ fontSize: "9px", letterSpacing: ".16em", color: "#999", marginTop: "2px" }}>CONSULENZA FISCALE AI</div>
          </div>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {["Servizi", "Come funziona", "Professionisti"].map(l => (
            <span key={l} className="nav-link" style={{ fontSize: "13px", letterSpacing: ".06em", color: "#777", cursor: "pointer", transition: "color .2s" }}>{l}</span>
          ))}
          <button style={{ background: "#1a3a5c", color: "#fff", border: "none", borderRadius: "6px", padding: "9px 22px", fontSize: "12px", letterSpacing: ".08em", cursor: "pointer", fontFamily: "inherit", transition: "opacity .2s" }}
            onMouseEnter={e => e.target.style.opacity = ".85"} onMouseLeave={e => e.target.style.opacity = "1"}>
            ACCEDI
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 60px 60px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
        <div style={{ animation: "fadeUp .7s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
            <div style={{ width: "32px", height: "1px", background: "#1a3a5c" }} />
            <span style={{ fontSize: "11px", letterSpacing: ".18em", color: "#1a3a5c", fontWeight: "600" }}>INTELLIGENZA FISCALE ARTIFICIALE</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(34px,3.5vw,52px)", fontWeight: "700", lineHeight: "1.12", color: "#1a1a1a", marginBottom: "24px", letterSpacing: "-.01em" }}>
            La risposta fiscale<br />
            <em style={{ fontStyle: "italic", color: "#1a3a5c" }}>che cercavi,</em><br />
            quando serve.
          </h1>
          <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "17px", color: "#555", lineHeight: "1.75", marginBottom: "36px", fontWeight: "300" }}>
            Tre aree di competenza fiscale assistite da intelligenza artificiale. Risposte immediate, precise, in italiano. Senza registrazione.
          </p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <button onClick={() => startChat("italiana")} style={{ background: "#1a3a5c", color: "#fff", border: "none", borderRadius: "6px", padding: "14px 28px", fontSize: "13px", letterSpacing: ".08em", cursor: "pointer", fontFamily: "inherit", transition: "opacity .2s" }}
              onMouseEnter={e => e.target.style.opacity=".85"} onMouseLeave={e => e.target.style.opacity="1"}>
              INIZIA ORA — GRATIS
            </button>
            <button style={{ background: "transparent", color: "#1a3a5c", border: "1.5px solid #1a3a5c40", borderRadius: "6px", padding: "14px 28px", fontSize: "13px", letterSpacing: ".08em", cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }}
              onMouseEnter={e => { e.target.style.background="#e8f0f8"; e.target.style.borderColor="#1a3a5c"; }}
              onMouseLeave={e => { e.target.style.background="transparent"; e.target.style.borderColor="#1a3a5c40"; }}>
              SCOPRI I SERVIZI
            </button>
          </div>
        </div>

        {/* Stats panel */}
        <div style={{ animation: "fadeUp .7s .15s ease both", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: "16px", padding: "40px", boxShadow: "0 8px 40px rgba(0,0,0,.07)" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "13px", letterSpacing: ".1em", color: "#999", marginBottom: "28px" }}>AREE DI COMPETENZA</div>
            {SECTIONS.map((s, i) => (
              <div key={s.key} onClick={() => startChat(s.key)} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 0", borderBottom: i < 2 ? "1px solid #f0ece4" : "none", cursor: "pointer", transition: "all .2s" }}
                onMouseEnter={e => e.currentTarget.style.paddingLeft = "8px"}
                onMouseLeave={e => e.currentTarget.style.paddingLeft = "0"}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: s.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "13px", fontWeight: "700", color: s.accentMid }}>{s.num}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a1a", marginBottom: "2px" }}>{s.label}</div>
                  <div style={{ fontSize: "10px", letterSpacing: ".08em", color: "#aaa" }}>{s.sub}</div>
                </div>
                <div style={{ color: "#ccc", fontSize: "18px" }}>›</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: "1100px", margin: "0 auto 60px", padding: "0 60px" }}>
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #e8e4dc 20%, #e8e4dc 80%, transparent)" }} />
      </div>

      {/* Service cards */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 60px 80px" }}>
        <div style={{ marginBottom: "48px", animation: "fadeUp .6s ease both" }}>
          <div style={{ fontSize: "11px", letterSpacing: ".18em", color: "#999", marginBottom: "12px" }}>I NOSTRI SERVIZI</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px,2.5vw,36px)", fontWeight: "700", color: "#1a1a1a", marginBottom: 0 }}>Tre aree, un unico strumento</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {SECTIONS.map((s) => (
            <div key={s.key} className="sec-card"
              style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: "12px", padding: "36px 32px", boxShadow: "0 4px 20px rgba(0,0,0,.05)", boxSizing: "border-box", "--al": s.accentLight, "--am": s.accentMid }}>

              {/* Card header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: s.accentLight, border: `1.5px solid ${s.accentMid}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: "700", color: s.accentMid }}>{s.num}</span>
                </div>
                <span style={{ fontSize: "10px", letterSpacing: ".12em", color: s.accentMid, background: s.accentLight, padding: "4px 10px", borderRadius: "100px" }}>AI POWERED</span>
              </div>

              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", color: "#1a1a1a", marginBottom: "6px", letterSpacing: "-.01em" }}>{s.label}</h3>
              <div style={{ fontSize: "10px", letterSpacing: ".1em", color: s.accentMid, marginBottom: "16px" }}>{s.sub}</div>
              <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: "#666", lineHeight: "1.65", marginBottom: "24px", fontWeight: "300" }}>
                {s.key === "italiana" && "Risposte immediate su 730, partita IVA, detrazioni, IMU, bonus edilizi e tutto ciò che riguarda il fisco italiano."}
                {s.key === "internazionale" && "Residenza fiscale, doppia imposizione, conti esteri, regime impatriati e convenzioni internazionali spiegati chiaramente."}
                {s.key === "agevolata" && "Incentivi, bandi, crediti d'imposta, Resto al Sud, Sabatini e fondi europei: trova le agevolazioni per la tua impresa."}
              </p>

              {/* Pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "24px" }}>
                {SUGGESTIONS[s.key].map((sg, i) => (
                  <button key={i} onClick={() => startChat(s.key, sg)} className="sugg-pill"
                    style={{ background: "#fafaf8", border: "1px solid #e0dbd0", color: "#777", borderRadius: "4px", padding: "5px 11px", fontSize: "11px", letterSpacing: ".05em", cursor: "pointer", fontFamily: "inherit", transition: "all .2s", "--al": s.accentLight, "--am": s.accentMid }}>
                    {sg}
                  </button>
                ))}
              </div>

              {/* Card input */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                <input ref={el => cardInputRefs.current[s.key] = el} placeholder="Poni una domanda..." className="card-input"
                  onKeyDown={e => { if (e.key === "Enter") { const v = cardInputRefs.current[s.key]?.value.trim(); if (v) startChat(s.key, v); }}}
                  style={{ flex: 1, border: "1.5px solid #e0dbd0", borderRadius: "6px", padding: "10px 14px", fontSize: "13px", fontFamily: "'Source Serif 4', serif", color: "#1a1a1a", background: "#fafaf8", outline: "none", transition: "all .2s", "--al": s.accentLight, "--am": s.accentMid }} />
                <button onClick={() => { const v = cardInputRefs.current[s.key]?.value.trim(); if (v) startChat(s.key, v); }}
                  style={{ background: s.accentMid, color: "#fff", border: "none", borderRadius: "6px", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "opacity .2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity=".8"} onMouseLeave={e => e.currentTarget.style.opacity="1"}>
                  <SendIcon />
                </button>
              </div>

              <button onClick={() => startChat(s.key)} className="enter-btn"
                style={{ width: "100%", background: "#fafaf8", border: `1.5px solid ${s.accentMid}40`, color: s.accentMid, borderRadius: "6px", padding: "11px", fontSize: "12px", letterSpacing: ".1em", cursor: "pointer", fontFamily: "inherit", transition: "all .25s", "--al": s.accentLight, "--am": s.accentMid }}>
                APRI LA CHAT →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section style={{ background: "#fff", borderTop: "1px solid #e8e4dc", borderBottom: "1px solid #e8e4dc", padding: "48px 60px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "32px" }}>
          {[
            { n: "3", label: "Aree di specializzazione", desc: "Fiscalità italiana, internazionale e finanza agevolata" },
            { n: "24/7", label: "Disponibilità", desc: "Risposte immediate in qualsiasi momento della giornata" },
            { n: "0", label: "Dati richiesti", desc: "Nessuna registrazione, nessun dato personale necessario" },
            { n: "100%", label: "Orientato all'Italia", desc: "Normativa italiana e europea sempre al centro" },
          ].map((f, i) => (
            <div key={i} className="feature-item" style={{ borderLeft: "2px solid #e8e4dc", paddingLeft: "24px", transition: "border-color .2s" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: "700", color: "#1a3a5c", lineHeight: 1, marginBottom: "8px" }}>{f.n}</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a1a", marginBottom: "4px", letterSpacing: ".02em" }}>{f.label}</div>
              <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#888", lineHeight: "1.5", fontWeight: "300" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: "700px", margin: "0 auto", padding: "80px 60px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px,3vw,38px)", fontWeight: "700", color: "#1a1a1a", marginBottom: "16px", lineHeight: "1.2" }}>
          Hai una domanda fiscale?
        </div>
        <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "16px", color: "#777", marginBottom: "36px", lineHeight: "1.7", fontWeight: "300" }}>
          Inizia subito, gratuitamente. Nessuna registrazione richiesta.
        </p>
        <button onClick={() => startChat("italiana")} style={{ background: "#1a3a5c", color: "#fff", border: "none", borderRadius: "6px", padding: "16px 40px", fontSize: "13px", letterSpacing: ".1em", cursor: "pointer", fontFamily: "inherit", transition: "opacity .2s" }}
          onMouseEnter={e => e.target.style.opacity=".85"} onMouseLeave={e => e.target.style.opacity="1"}>
          INIZIA ORA — È GRATIS
        </button>
      </section>

      {/* Footer */}
      <footer style={{ background: "#1a1a1a", padding: "40px 60px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "28px", height: "28px", background: "#fff", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#1a1a1a", fontFamily: "'Playfair Display', serif", fontSize: "13px", fontWeight: "700" }}>P</span>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", color: "#fff", fontWeight: "600" }}>PuntoFisco</span>
        </div>
        <div style={{ fontSize: "11px", color: "#666", letterSpacing: ".05em", textAlign: "center" }}>
          © 2026 PuntoFisco · Le risposte hanno scopo informativo e non costituiscono consulenza professionale
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          {["Privacy", "Termini", "Contatti"].map(l => (
            <span key={l} style={{ fontSize: "11px", letterSpacing: ".08em", color: "#666", cursor: "pointer", transition: "color .2s" }}
              onMouseEnter={e => e.target.style.color="#fff"} onMouseLeave={e => e.target.style.color="#666"}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
