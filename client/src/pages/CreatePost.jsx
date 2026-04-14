import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api/axios";

const MEDIA_TYPES = [
  { value: "none",  label: "None",  icon: "✕" },
  { value: "image", label: "Image", icon: "🖼" },
  { value: "video", label: "Video", icon: "🎬" },
  { value: "link",  label: "Link",  icon: "🔗" },
];

export default function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "", mediaUrl: "", mediaType: "none", tags: "" });
  const [loading, setLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.content.trim()) { toast.error("Content is required"); return; }
    setLoading(true);
    try {
      let res;
      if (mediaFile) {
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('content', form.content);
        fd.append('tags', form.tags);
        fd.append('mediaType', form.mediaType);
        fd.append('media', mediaFile);
        res = await api.post('/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        const { data } = await api.post("/posts", form);
        res = { data };
      }
      toast.success("Published!");
      navigate(`/posts/${res.data.post._id}`);
    } catch(err) { toast.error(err.response?.data?.message || "Failed to publish"); }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
      setMediaFile(null);
      setMediaPreview(null);
      return;
    }
    setMediaFile(f);
    setMediaPreview(URL.createObjectURL(f));
    if (f.type.startsWith('image/')) setForm(prev => ({ ...prev, mediaType: 'image' }));
    else if (f.type.startsWith('video/')) setForm(prev => ({ ...prev, mediaType: 'video' }));
  };

  useEffect(() => {
    return () => {
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    };
  }, [mediaPreview]);

  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "#E5E7EB", fontFamily: '"DM Sans", sans-serif', paddingTop: 56 }}>
      <div className="page-bg"/>

      <div className="create-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", minHeight: "calc(100vh - 56px)", position: "relative", zIndex: 10 }}>

        {/* ── Editor ── */}
        <div style={{ padding: "clamp(24px,5vw,60px) clamp(20px,5vw,64px)", borderRight: "1px solid var(--border)" }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A78BFA" }}>New Post</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Title */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Title (optional)</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Give your post a title…" className="input-nexus" maxLength={150}
                  style={{ fontSize: 18, fontWeight: 600, padding: "14px 16px" }}/>
              </div>

              {/* Content */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6B7280" }}>Content *</label>
                  <span style={{ fontSize: 11, color: "#6B7280", fontFamily: '"DM Mono", monospace' }}>
                    {wordCount} words · {form.content.length}/5000
                  </span>
                </div>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="What's on your mind? Share your thoughts, ideas, discoveries…"
                  required rows={10} maxLength={5000} className="input-nexus"
                  style={{ resize: "vertical", lineHeight: 1.8, fontSize: 15 }}/>
              </div>

              {/* Tags */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Tags</label>
                <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="technology, design, ai — comma separated" className="input-nexus"/>
                {form.tags && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
                    {form.tags.split(",").map(t => t.trim()).filter(Boolean).map((t, i) => (
                      <span key={i} className="badge badge-accent">#{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit — mobile only */}
              <div style={{ display: "none" }} className="create-submit-mob">
                <button type="submit" disabled={loading} className="btn btn-primary"
                  style={{ width: "100%", padding: "13px", fontSize: 15, opacity: loading ? 0.65 : 1 }}>
                  {loading ? "Publishing…" : "Publish post"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* ── Sidebar: Options ── */}
        <div className="create-side" style={{ padding: "clamp(20px,4vw,48px) 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280", marginBottom: 14 }}>Media</p>

            {/* Media type selector */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 16 }}>
              {MEDIA_TYPES.map(m => (
                <button key={m.value} type="button" onClick={() => setForm({ ...form, mediaType: m.value, mediaUrl: m.value === "none" ? "" : form.mediaUrl })}
                  style={{
                    padding: "10px 8px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
                    border: `1px solid ${form.mediaType === m.value ? "var(--purple-ring)" : "var(--border)"}`,
                    background: form.mediaType === m.value ? "var(--purple-soft)" : "var(--surface)",
                    color: form.mediaType === m.value ? "var(--purple)" : "var(--text-2)", transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                  <span>{m.icon}</span> {m.label}
                </button>
              ))}
            </div>

            {form.mediaType !== "none" && (
              <div>
                {form.mediaType === 'link' ? (
                  <>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>URL</label>
                    <input value={form.mediaUrl} onChange={e => setForm({ ...form, mediaUrl: e.target.value })}
                      placeholder={`Paste ${form.mediaType} URL…`} className="input-nexus" style={{ fontSize: 13 }}/>
                  </>
                ) : (
                  <>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>Upload from device</label>
                    <input type="file" accept={form.mediaType === 'image' ? 'image/*' : 'video/*'} onChange={handleFileChange} />
                    {mediaPreview && (
                      <div style={{ marginTop: 10 }}>
                        {form.mediaType === 'image' ? (
                          <img src={mediaPreview} alt="preview" style={{ width: '100%', borderRadius: 8, maxHeight: 220, objectFit: 'cover' }} />
                        ) : (
                          <video src={mediaPreview} controls style={{ width: '100%', borderRadius: 8 }} />
                        )}
                      </div>
                    )}
                    <div style={{ marginTop: 8 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>Or paste a URL</label>
                      <input value={form.mediaUrl} onChange={e => setForm({ ...form, mediaUrl: e.target.value })}
                        placeholder={`Paste ${form.mediaType} URL…`} className="input-nexus" style={{ fontSize: 13 }}/>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>

          {/* Publish box */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ padding: "20px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280", marginBottom: 14 }}>Publish</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {[
                ["Visibility", "Public"],
                ["Status",     "Draft → Live"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#6B7280" }}>{k}</span>
                  <span style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
            <button onClick={handleSubmit} disabled={loading} className="btn btn-primary"
              style={{ width: "100%", padding: "12px", fontSize: 14, opacity: loading ? 0.65 : 1 }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", display: "block" }}/>
                  Publishing…
                </span>
              ) : "Publish post →"}
            </button>
          </motion.div>

          {/* Tips */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ padding: "16px", borderRadius: 10, background: "var(--purple-soft)", border: "1px solid var(--purple-ring)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#A78BFA", marginBottom: 10 }}>Writing tips</p>
            {["Use a clear title to attract readers", "Add relevant tags to improve discovery", "Break long content into paragraphs"].map((tip, i) => (
              <p key={i} style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.6, marginBottom: 6 }}>· {tip}</p>
            ))}
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @media (max-width: 768px) {
          .create-grid { grid-template-columns: 1fr !important; }
          .create-side { border-left: none !important; border-top: 1px solid var(--border); }
          .create-submit-mob { display: block !important; }
        }
      `}</style>
    </div>
  );
}
