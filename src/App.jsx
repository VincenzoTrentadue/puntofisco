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
- Bandi e incentivi imprese (MISE, MIMIT, PNRR), crediti d imposta (R&S, formazione 4.0, transizione 5.0, Sud)
- Sabatini, Nuova Sabatini, Resto al Sud, Autoimprenditorialita, Autoimpiego (Invitalia)
- Contratti di sviluppo, fondi strutturali europei (FESR, FSE+), Horizon Europe
- Fondo di Garanzia PMI, SACE, startup e PMI innovative, decontribuzioni, Desonero Sud
- Patent Box, ZES (Zone Economiche Speciali), aree di crisi
Rispondi in italiano. Indica sempre requisiti, importi, come accedere. Vai dritto alla risposta senza preamboli.`,
};

const SUGGESTIONS = {
  italiana: ["Regime forfettario","Come funziona il 730","Detrazioni disponibili","Aprire Partita IVA","IMU prima casa","Capital gain in borsa"],
  internazionale: ["Doppia imposizione","Residenza fiscale estera","Regime impatriati","Conti esteri RW","Transfer pricing","IVA intracomunitaria"],
  agevolata: ["Nuova Sabatini","Credito imposta R&S","Resto al Sud","Fondi europei PMI","Zone Economiche Speciali","Startup innovative"],
};

const SECTIONS = [
  { key: "italiana", label: "Fiscalita Italiana", sub: "IRPEF - IVA - IMU - PARTITA IVA - BONUS", accent: "#1a3a5c", accentLight: "#e8f0f8", accentMid: "#3d6b9e", num: "01" },
  { key: "internazionale", label: "Fiscalita Internazionale", sub: "DOPPIA IMPOSIZIONE - RESIDENZA - IMPATRIATI", accent: "#2c1a4a", accentLight: "#ede8f5", accentMid: "#6b4a9e", num: "02" },
  { key: "agevolata", label: "Finanza Agevolata", sub: "BANDI - PNRR - CREDITI - FONDI UE - SABATINI", accent: "#1a3d2c", accentLight: "#e8f5ed", accentMid: "#3d9e6b", num: "03" },
];

export default function PuntoFisco() {
  const [view, setView] = useState("landing");
  const [section, setSection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const cardInputRefs = useRef({});

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (view === "chat") setTimeout(() => inputRef.current?.focus(), 100); }, [view]);

  const sec = section ? SECTIONS.find(s => s.key === section) : null;

  const sendMessage = async (text, hist = messages) => {
    const next = [...hist, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: PROMPTS[section], messages: next }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.content?.[0]?.text || "Errore." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Errore di connessione. Riprova." }]);
    } finally { setLoading(false); }
  };

  const startChat = (key, question = "") => {
    setSection(key); setView("chat"); setMessages([]);
    if (question) setTimeout(() => sendMessage(question, []), 80);
  };

  const goBack = () => { setView("landing"); setMessages([]); setSection(null); setInput(""); };

  if (view === "chat" && sec) return (
    <div style={{ minHeight:"100vh", background:"#fafaf8", display:"flex", flexDirection:"column", fontFamily:"Georgia,serif" }}>
      <style>{"@keyframes blink{0%,100%{opacity:1}50%{opacity:0}} input::placeholder{color:#aaa}"}</style>
      <header style={{ background:"#fff", borderBottom:"1px solid #e8e4dc", padding:"0 40px", display:"flex", alignItems:"center", justifyContent:"space-between", height:"64px", position:"sticky", top:0, zIndex:20 }}>
        <button onClick={goBack} style={{ background:"none", border:"none", cursor:"pointer", color:"#666", fontSize:"14px", fontFamily:"inherit" }}>TORNA ALLA HOME</button>
        <span style={{ fontSize:"14px", color:sec.accentMid, fontWeight:"600" }}>{sec.label.toUpperCase()}</span>
      </header>
      <div style={{ flex:1, overflowY:"auto", padding:"32px 16px", maxWidth:"800px", width:"100%", margin:"0 auto", boxSizing:"border-box" }}>
        {messages.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ fontSize:"20px", color:"#2a2a2a", marginBottom:"16px" }}>{sec.label}</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"center" }}>
              {SUGGESTIONS[section].map((s,i) => (
                <button key={i} onClick={() => sendMessage(s)} style={{ background:"#fff", border:"1px solid #ddd", color:sec.accentMid, borderRadius:"4px", padding:"7px 14px", fontSize:"12px", cursor:"pointer", fontFamily:"inherit" }}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m,i) => (
          <div key={i} style={{ marginBottom:"24px" }}>
            {m.role === "user"
              ? <div style={{ display:"flex", justifyContent:"flex-end" }}><div style={{ maxWidth:"70%", background:sec.accent, color:"#fff", borderRadius:"16px 16px 4px 16px", padding:"14px 20px", fontSize:"15px", lineHeight:"1.55" }}>{m.content}</div></div>
              : <div style={{ display:"flex", gap:"12px" }}><div style={{ flexShrink:0, width:"32px", height:"32px", borderRadius:"50%", background:sec.accentLight, border:"1.5px solid "+sec.accentMid, display:"flex", alignItems:"center", justifyContent:"center", color:sec.accentMid, fontWeight:"bold", fontSize:"13px" }}>P</div><div style={{ flex:1, background:"#fff", border:"1px solid #e8e4dc", borderRadius:"4px 16px 16px 16px", padding:"16px 20px", fontSize:"15px", lineHeight:"1.75", whiteSpace:"pre-wrap" }}>{m.content}</div></div>
            }
          </div>
        ))}
        {loading && <div style={{ display:"flex", gap:"12px" }}><div style={{ width:"32px", height:"32px", borderRadius:"50%", background:sec.accentLight, border:"1.5px solid "+sec.accentMid, display:"flex", alignItems:"center", justifyContent:"center", color:sec.accentMid, fontWeight:"bold" }}>P</div><div style={{ background:"#fff", border:"1px solid #e8e4dc", borderRadius:"4px 16px 16px 16px", padding:"16px 20px", display:"flex", gap:"6px" }}>{[0,1,2].map(i=><div key={i} style={{ width:"7px", height:"7px", borderRadius:"50%", background:sec.accentMid, opacity:0.4, animation:"blink 1.2s ease-in-out "+(i*.3)+"s infinite" }}/>)}</div></div>}
        <div ref={messagesEndRef}/>
      </div>
      <div style={{ background:"#fff", borderTop:"1px solid #e8e4dc", padding:"16px 24px" }}>
        <div style={{ maxWidth:"800px", margin:"0 auto", display:"flex", gap:"10px" }}>
          <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey&&input.trim()&&!loading){e.preventDefault();sendMessage(input.trim());}}} placeholder={"Domanda di "+sec.label.toLowerCase()+"..."} disabled={loading} style={{ flex:1, border:"1.5px solid #ddd", borderRadius:"8px", padding:"14px 18px", fontSize:"15px", fontFamily:"Georgia,serif", outline:"none" }}/>
          <button onClick={()=>{ if(input.trim()&&!loading) sendMessage(input.trim()); }} disabled={loading||!input.trim()} style={{ background:sec.accentMid, color:"#fff", border:"none", borderRadius:"8px", width:"48px", height:"48px", cursor:"pointer" }}>→</button>
        </div>
        <p style={{ textAlign:"center", color:"#bbb", fontSize:"11px", marginTop:"8px" }}>PuntoFisco fornisce informazioni orientative. Consulta un professionista per casi specifici.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#fafaf8", fontFamily:"Georgia,serif", color:"#1a1a1a" }}>
      <header style={{ background:"#fff", borderBottom:"1px solid #e8e4dc", padding:"0 40px", display:"flex", alignItems:"center", justifyContent:"space-between", height:"72px", position:"sticky", top:0, zIndex:20, boxShadow:"0 1px 12px rgba(0,0,0,.05)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"36px", height:"36px", background:"#1a3a5c", borderRadius:"6px", display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ color:"#fff", fontWeight:"700", fontSize:"16px" }}>P</span></div>
          <div><div style={{ fontSize:"19px", fontWeight:"700", color:"#1a1a1a" }}>PuntoFisco</div><div style={{ fontSize:"9px", letterSpacing:".16em", color:"#999" }}>CONSULENZA FISCALE AI</div></div>
        </div>
        <button style={{ background:"#1a3a5c", color:"#fff", border:"none", borderRadius:"6px", padding:"9px 22px", fontSize:"12px", cursor:"pointer", fontFamily:"inherit" }}>ACCEDI</button>
      </header>
      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"80px 40px 40px", textAlign:"center" }}>
        <h1 style={{ fontSize:"clamp(32px,4vw,56px)", fontWeight:"700", color:"#1a1a1a", marginBottom:"16px" }}>La risposta fiscale <em style={{ color:"#1a3a5c" }}>che cercavi</em></h1>
        <p style={{ fontSize:"17px", color:"#666", marginBottom:"48px" }}>Tre aree di competenza fiscale con intelligenza artificiale. Gratis, senza registrazione.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"24px" }}>
          {SECTIONS.map(s => (
            <div key={s.key} style={{ background:"#fff", border:"1px solid #e8e4dc", borderRadius:"12px", padding:"32px", boxShadow:"0 4px 20px rgba(0,0,0,.05)", textAlign:"left" }}>
              <div style={{ width:"44px", height:"44px", borderRadius:"10px", background:s.accentLight, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"16px" }}>
                <span style={{ fontSize:"16px", fontWeight:"700", color:s.accentMid }}>{s.num}</span>
              </div>
              <h3 style={{ fontSize:"18px", fontWeight:"700", color:"#1a1a1a", marginBottom:"6px" }}>{s.label}</h3>
              <div style={{ fontSize:"10px", letterSpacing:".1em", color:s.accentMid, marginBottom:"14px" }}>{s.sub}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"20px" }}>
                {SUGGESTIONS[s.key].map((sg,i) => (
                  <button key={i} onClick={()=>startChat(s.key,sg)} style={{ background:"#fafaf8", border:"1px solid #e0dbd0", color:"#777", borderRadius:"4px", padding:"5px 10px", fontSize:"11px", cursor:"pointer", fontFamily:"inherit" }}>{sg}</button>
                ))}
              </div>
              <div style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
                <input ref={el=>cardInputRefs.current[s.key]=el} placeholder="La tua domanda..." onKeyDown={e=>{ if(e.key==="Enter"){const v=cardInputRefs.current[s.key]?.value.trim();if(v)startChat(s.key,v);}}} style={{ flex:1, border:"1.5px solid #e0dbd0", borderRadius:"6px", padding:"10px 14px", fontSize:"13px", fontFamily:"Georgia,serif", outline:"none", background:"#fafaf8" }}/>
                <button onClick={()=>{const v=cardInputRefs.current[s.key]?.value.trim();if(v)startChat(s.key,v);}} style={{ background:s.accentMid, color:"#fff", border:"none", borderRadius:"6px", width:"40px", height:"40px", cursor:"pointer" }}>→</button>
              </div>
              <button onClick={()=>startChat(s.key)} style={{ width:"100%", background:"transparent", border:"1.5px solid "+s.accentMid+"40", color:s.accentMid, borderRadius:"6px", padding:"10px", fontSize:"12px", cursor:"pointer", fontFamily:"inherit", letterSpacing:".08em" }}>APRI LA CHAT</button>
            </div>
          ))}
        </div>
      </div>
      <footer style={{ background:"#1a1a1a", padding:"32px 40px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"16px", marginTop:"60px" }}>
        <span style={{ color:"#fff", fontWeight:"600" }}>PuntoFisco</span>
        <span style={{ color:"#666", fontSize:"11px" }}>2026 PuntoFisco - Le risposte hanno scopo informativo e non costituiscono consulenza professionale</span>
      </footer>
    </div>
  );
}
