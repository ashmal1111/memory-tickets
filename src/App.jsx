import { useState, useRef, useMemo } from "react";

const CATEGORIES = ["All", "Travel", "Food", "Nature", "Events", "Friends", "Family", "Other"];
const COLORS = ["#7EC8C8","#F4A261","#A8DADC","#E9C46A","#C77DFF","#90BE6D","#F9844A","#4CC9F0"];
const EMOJIS = ["📷","🌊","🏔","🌸","🎉","🍜","🏯","❄️","🌇","🎵","🌿","✈️","🎡","🏖","🎭","🧁","🦋","🌙"];

const sampleTickets = [
  { id: 1, title: "Ghibli Park", location: "Nagakute, Japan", date: "2025.05.08", note: "Howl's moving castle!", color: "#7EC8C8", emoji: "🏯", image: null, category: "Travel" },
  { id: 2, title: "Sunset Picnic", location: "Central Park, NY", date: "2025.04.20", note: "Golden hour with friends 🌅", color: "#F4A261", emoji: "🌇", image: null, category: "Friends" },
  { id: 3, title: "First Snow", location: "Hokkaido, Japan", date: "2025.01.15", note: "Everything was white and perfect.", color: "#A8DADC", emoji: "❄️", image: null, category: "Nature" },
  { id: 4, title: "Cherry Blossom", location: "Kyoto, Japan", date: "2025.03.28", note: "Peak bloom — absolutely dreamy.", color: "#C77DFF", emoji: "🌸", image: null, category: "Nature" },
  { id: 5, title: "Ramen Night", location: "Shibuya, Tokyo", date: "2025.02.10", note: "Best tonkotsu of my life.", color: "#E9C46A", emoji: "🍜", image: null, category: "Food" },
];

// ── Ticket Card ─────────────────────────────────────────────────────────────
function TicketStub({ ticket, onClick }) {
  return (
    <div
      onClick={() => onClick(ticket)}
      style={{
        cursor: "pointer", marginBottom: 20,
        filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.16))",
        transform: "rotate(-0.8deg)",
        transition: "transform 0.22s cubic-bezier(.34,1.56,.64,1), filter 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "rotate(0deg) scale(1.03)"; e.currentTarget.style.filter = "drop-shadow(0 14px 32px rgba(0,0,0,0.26))"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "rotate(-0.8deg)"; e.currentTarget.style.filter = "drop-shadow(0 6px 18px rgba(0,0,0,0.16))"; }}
    >
      <div style={{ background: "#fff", borderRadius: "16px 16px 0 0", overflow: "hidden", width: 290 }}>
        <div style={{
          width: "100%", height: 155,
          background: `linear-gradient(135deg, ${ticket.color}cc, ${ticket.color}55)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 64, position: "relative",
        }}>
          {ticket.image
            ? <img src={ticket.image} alt="memory" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
            : <span style={{ zIndex: 1 }}>{ticket.emoji}</span>}
          {/* Category badge */}
          <div style={{
            position: "absolute", top: 10, left: 12,
            background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)",
            padding: "3px 10px", borderRadius: 20,
            fontSize: 10, fontWeight: 700, color: "#444", letterSpacing: 0.5,
            textTransform: "uppercase",
          }}>{ticket.category}</div>
        </div>
        <div style={{ padding: "14px 18px 10px", fontFamily: "'Georgia', serif" }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: "#1a1a2e", letterSpacing: "-0.3px" }}>{ticket.title}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 11, color: "#999" }}>
            <span>📍 {ticket.location}</span>
            <span>🗓 {ticket.date}</span>
          </div>
          <div style={{ borderTop: "2px dashed #e8e8e8", margin: "10px 0 8px" }} />
          <div style={{ fontSize: 13, color: "#666", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ticket.note}</div>
        </div>
      </div>
      {/* Tear bottom */}
      <div style={{ background: "#fff", borderRadius: "0 0 16px 16px", padding: "6px 18px 14px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 14,
          backgroundImage: "radial-gradient(circle at 50% 0%, #f0f0f0 70%, #fff 70%)",
          backgroundSize: "26px 14px", backgroundRepeat: "repeat-x",
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <div style={{
            background: `${ticket.color}28`, color: ticket.color,
            padding: "3px 10px", borderRadius: 20,
            fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
          }}>Memory</div>
          <div style={{ fontSize: 10, color: "#ccc", fontFamily: "monospace" }}>#{String(ticket.id).padStart(4,"0")}</div>
        </div>
      </div>
    </div>
  );
}

// ── Share Toast ──────────────────────────────────────────────────────────────
function ShareToast({ show }) {
  return (
    <div style={{
      position: "fixed", bottom: 30, left: "50%", transform: `translateX(-50%) translateY(${show ? 0 : 80}px)`,
      background: "#1a1a2e", color: "#fff", padding: "12px 24px",
      borderRadius: 50, fontSize: 14, fontWeight: 600,
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
      transition: "transform 0.35s cubic-bezier(.34,1.56,.64,1)",
      zIndex: 999, pointerEvents: "none",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      ✅ Link copied to clipboard!
    </div>
  );
}

// ── View Modal ───────────────────────────────────────────────────────────────
function Modal({ ticket, onClose, onEdit, onDelete, onShare }) {
  if (!ticket) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(5px)",
    }} onClick={onClose}>
      <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
        <div style={{ filter: "drop-shadow(0 24px 60px rgba(0,0,0,0.45))" }}>
          <div style={{ background: "#fff", borderRadius: "22px 22px 0 0", overflow: "hidden", width: 330 }}>
            <div style={{
              width: "100%", height: 210,
              background: `linear-gradient(135deg, ${ticket.color}cc, ${ticket.color}55)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 86, position: "relative",
            }}>
              {ticket.image
                ? <img src={ticket.image} alt="memory" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                : ticket.emoji}
              <button onClick={onClose} style={{
                position: "absolute", top: 12, right: 14,
                background: "rgba(255,255,255,0.85)", border: "none",
                borderRadius: "50%", width: 34, height: 34, cursor: "pointer",
                fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
              }}>×</button>
              <div style={{
                position: "absolute", bottom: 12, left: 14,
                background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)",
                padding: "3px 10px", borderRadius: 20,
                fontSize: 10, fontWeight: 700, color: "#444", letterSpacing: 0.5,
                textTransform: "uppercase",
              }}>{ticket.category}</div>
            </div>
            <div style={{ padding: "18px 22px 12px", fontFamily: "'Georgia', serif" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#1a1a2e" }}>{ticket.title}</div>
              <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 13, color: "#888" }}>
                <span>📍 {ticket.location}</span>
                <span>🗓 {ticket.date}</span>
              </div>
              <div style={{ borderTop: "2px dashed #e8e8e8", margin: "14px 0 10px" }} />
              <div style={{ fontSize: 15, color: "#555", fontStyle: "italic", lineHeight: 1.6 }}>"{ticket.note}"</div>
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: "0 0 22px 22px", padding: "8px 22px 20px", position: "relative", overflow: "hidden" }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 14,
              backgroundImage: "radial-gradient(circle at 50% 0%, #f0f0f0 70%, #fff 70%)",
              backgroundSize: "26px 14px", backgroundRepeat: "repeat-x",
            }} />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => onEdit(ticket)} style={{
                flex: 1, padding: "11px 0", border: "none",
                background: `${ticket.color}22`, color: ticket.color,
                borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 13,
              }}>✏️ Edit</button>
              <button onClick={() => onShare(ticket)} style={{
                flex: 1, padding: "11px 0", border: "none",
                background: "#f0f7ff", color: "#4CC9F0",
                borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 13,
              }}>🔗 Share</button>
              <button onClick={() => onDelete(ticket.id)} style={{
                flex: 1, padding: "11px 0", border: "none",
                background: "#fff0f0", color: "#e63946",
                borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 13,
              }}>🗑 Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Edit / New Modal ─────────────────────────────────────────────────────────
function EditModal({ ticket, onClose, onSave }) {
  const [form, setForm] = useState(ticket ? { ...ticket } : {
    title: "", location: "", date: new Date().toISOString().slice(0,10).replace(/-/g,"."),
    note: "", color: COLORS[0], emoji: "📷", image: null, category: "Travel",
  });
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, image: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: "1.5px solid #e8e8e8", fontSize: 14, fontFamily: "'Georgia', serif",
    boxSizing: "border-box", outline: "none", background: "#fafafa",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(6px)",
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, padding: 26, width: 350,
        boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
        fontFamily: "'Georgia', serif",
        maxHeight: "92vh", overflowY: "auto",
      }}>
        <div style={{ fontSize: 21, fontWeight: 700, marginBottom: 18, color: "#1a1a2e" }}>
          {ticket ? "✏️ Edit Memory" : "✨ New Memory"}
        </div>

        {/* Photo upload */}
        <div onClick={() => fileRef.current.click()} style={{
          width: "100%", height: 120, borderRadius: 14, marginBottom: 14,
          background: form.image ? "none" : `${form.color}18`,
          border: `2px dashed ${form.color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", overflow: "hidden", position: "relative",
        }}>
          {form.image
            ? <img src={form.image} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ textAlign: "center", color: form.color }}>
                <div style={{ fontSize: 30 }}>{form.emoji}</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Tap to add photo</div>
              </div>
          }
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
        </div>

        {/* Emoji picker */}
        {!form.image && (
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {EMOJIS.map(e => (
              <span key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))} style={{
                fontSize: 20, cursor: "pointer", padding: "3px 5px", borderRadius: 8,
                background: form.emoji === e ? `${form.color}33` : "transparent",
                transition: "background 0.15s",
              }}>{e}</span>
            ))}
          </div>
        )}

        {/* Category */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: "#999", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Category</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {CATEGORIES.filter(c => c !== "All").map(c => (
              <div key={c} onClick={() => setForm(f => ({ ...f, category: c }))} style={{
                padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: 600,
                background: form.category === c ? form.color : "#f0f0f0",
                color: form.category === c ? "#fff" : "#666",
                transition: "all 0.15s",
              }}>{c}</div>
            ))}
          </div>
        </div>

        {/* Fields */}
        {[
          { label: "Title", key: "title", placeholder: "Where did you go?" },
          { label: "Location", key: "location", placeholder: "City, Country" },
          { label: "Date", key: "date", placeholder: "2025.05.08" },
        ].map(({ label, key, placeholder }) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: "#999", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
            <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder} style={inputStyle} />
          </div>
        ))}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: "#999", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Note</label>
          <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            placeholder="How did it feel?" style={{ ...inputStyle, resize: "none", height: 70 }} />
        </div>

        {/* Color picker */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: "#999", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Ticket Color</label>
          <div style={{ display: "flex", gap: 8 }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{
                width: 26, height: 26, borderRadius: "50%", background: c, cursor: "pointer",
                boxShadow: form.color === c ? `0 0 0 3px #fff, 0 0 0 5px ${c}` : "none",
                transition: "box-shadow 0.15s",
              }} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px 0", border: "1.5px solid #e8e8e8",
            background: "#fff", borderRadius: 12, cursor: "pointer", fontSize: 14,
          }}>Cancel</button>
          <button onClick={() => { if (form.title.trim()) onSave(form); }} style={{
            flex: 2, padding: "12px 0", border: "none",
            background: form.color, color: "#fff",
            borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 14,
          }}>Save Memory ✨</button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tickets, setTickets] = useState(sampleTickets);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showToast, setShowToast] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Filter tickets
  const filtered = useMemo(() => {
    return tickets.filter(t => {
      const matchCat = activeCategory === "All" || t.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch = !q || t.title.toLowerCase().includes(q) || t.location.toLowerCase().includes(q) || t.note.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [tickets, search, activeCategory]);

  const handleSave = (form) => {
    if (isNew) {
      setTickets(t => [...t, { ...form, id: Date.now() }]);
    } else {
      setTickets(t => t.map(tk => tk.id === form.id ? form : tk));
    }
    setEditing(null); setSelected(null); setIsNew(false);
  };

  const handleDelete = (id) => {
    setTickets(t => t.filter(tk => tk.id !== id));
    setSelected(null);
  };

  const handleEdit = (ticket) => {
    setSelected(null); setEditing(ticket); setIsNew(false);
  };

  const handleShare = (ticket) => {
    const text = `🎟 ${ticket.title} | 📍 ${ticket.location} | 🗓 ${ticket.date}\n"${ticket.note}"`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setSelected(null);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleNew = () => { setEditing({}); setIsNew(true); };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f0eb",
      backgroundImage: "radial-gradient(#d8cfc6 1px, transparent 1px)",
      backgroundSize: "22px 22px",
      fontFamily: "'Georgia', serif",
    }}>
      {/* ── Header ── */}
      <div style={{
        background: "#1a1a2e",
        padding: "20px 20px 0",
        position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 4px 24px rgba(0,0,0,0.22)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ color: "#f5f0eb", fontSize: 21, fontWeight: 700, letterSpacing: "-0.4px" }}>🎟 Memory Tickets</div>
            <div style={{ color: "#666", fontSize: 11, marginTop: 1 }}>{tickets.length} memories collected</div>
          </div>
          <button onClick={handleNew} style={{
            background: "#F4A261", border: "none", borderRadius: 50,
            width: 42, height: 42, fontSize: 22, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(244,162,97,0.45)",
          }}>+</button>
        </div>

        {/* Search bar */}
        <div style={{
          display: "flex", alignItems: "center",
          background: searchFocused ? "#fff" : "#262640",
          borderRadius: 14, padding: "10px 14px", gap: 8, marginBottom: 14,
          transition: "background 0.2s",
          border: searchFocused ? "2px solid #F4A261" : "2px solid transparent",
        }}>
          <span style={{ fontSize: 15, opacity: 0.5 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search memories..."
            style={{
              background: "transparent", border: "none", outline: "none",
              color: searchFocused ? "#1a1a2e" : "#ccc", fontSize: 14,
              fontFamily: "'Georgia', serif", flex: 1,
            }}
          />
          {search && (
            <span onClick={() => setSearch("")} style={{ cursor: "pointer", fontSize: 14, opacity: 0.5, color: "#888" }}>×</span>
          )}
        </div>

        {/* Category tabs */}
        <div style={{
          display: "flex", gap: 6, overflowX: "auto", paddingBottom: 14,
          scrollbarWidth: "none",
        }}>
          {CATEGORIES.map(cat => (
            <div key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: "6px 14px", borderRadius: 20, cursor: "pointer", whiteSpace: "nowrap",
              fontSize: 12, fontWeight: 700,
              background: activeCategory === cat ? "#F4A261" : "#262640",
              color: activeCategory === cat ? "#fff" : "#888",
              transition: "all 0.18s",
              flexShrink: 0,
            }}>{cat}</div>
          ))}
        </div>
      </div>

      {/* ── Ticket Grid ── */}
      <div style={{ padding: "26px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 60, color: "#bbb" }}>
            <div style={{ fontSize: 48 }}>{search ? "🔍" : "🎟"}</div>
            <div style={{ marginTop: 12, fontSize: 16, color: "#999" }}>
              {search ? `No results for "${search}"` : "No memories in this category."}
            </div>
            <div style={{ fontSize: 13, marginTop: 4, color: "#bbb" }}>
              {search ? "Try a different keyword." : "Tap + to add your first ticket!"}
            </div>
          </div>
        )}
        {filtered.map(ticket => (
          <TicketStub key={ticket.id} ticket={ticket} onClick={setSelected} />
        ))}
      </div>

      {/* ── Modals ── */}
      {selected && (
        <Modal
          ticket={selected}
          onClose={() => setSelected(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onShare={handleShare}
        />
      )}
      {editing !== null && (
        <EditModal
          ticket={isNew ? null : editing}
          onClose={() => { setEditing(null); setIsNew(false); }}
          onSave={handleSave}
        />
      )}

      {/* ── Share Toast ── */}
      <ShareToast show={showToast} />
    </div>
  );
}