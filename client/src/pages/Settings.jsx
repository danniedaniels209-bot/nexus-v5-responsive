import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useAuthStore from '../context/authStore';

const TABS = ['Profile', 'Password', 'Danger'];

function Label({ children }) {
  return <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B7280', marginBottom: 8 }}>{children}</label>;
}

export default function Settings() {
  const { user, updateUser, logout } = useAuthStore();
  const [tab, setTab]           = useState('Profile');
  const [profile, setProfile]   = useState({ bio: user?.bio || '', avatar: user?.avatar || '' });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving]     = useState(false);
  const [resetting, setResetting] = useState(false);

  const saveProfile = async e => {
    e.preventDefault(); setSaving(true);
    try { const { data } = await api.put('/users/profile', profile); updateUser(data.user); toast.success('Profile updated'); }
    catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    setSaving(false);
  };

  const changePassword = async e => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    if (passwords.next.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSaving(true);
    try { await api.put('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.next }); toast.success('Password changed'); setPasswords({ current: '', next: '', confirm: '' }); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    setSaving(false);
  };

  const deleteAccount = async () => {
    if (!confirm('This will permanently delete your account and all your posts. This cannot be undone.')) return;
    try { await api.delete('/users/me'); toast.success('Account deleted'); logout(); }
    catch { toast.error('Failed to delete account'); }
  };

  const handleFullReset = async () => {
    const confirm1 = confirm("⚠️ DANGER: This will delete ALL users, ALL posts, and ALL messages from the entire platform. Are you absolutely sure?");
    if (!confirm1) return;

    const confirm2 = confirm("LAST WARNING: This cannot be undone. Every piece of data on the website will be erased. Proceed?");
    if (!confirm2) return;

    setResetting(true);
    try {
      await api.delete('/auth/danger/reset', {
        headers: { 'x-reset-key': 'nexus-reset-v5' }
      });
      toast.success('Platform reset successfully');
      logout();
      window.location.href = '/register';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Make sure the backend is updated.');
    }
    setResetting(false);
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: '#E5E7EB', fontFamily: '"DM Sans", sans-serif' }}>
      <div className="page-bg"/>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(80px,10vw,96px) clamp(16px,5vw,24px) 80px', position: 'relative', zIndex: 10 }}>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 'clamp(26px,4vw,36px)', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 28, color: '#E5E7EB' }}>Settings</h1>

          {/* Tabs */}
          <div className="settings-tabs" style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: tab === t ? (t === 'Danger' ? 'rgba(217,92,92,0.12)' : 'rgba(139,92,246,0.12)') : 'transparent',
                  color: tab === t ? (t === 'Danger' ? 'var(--red)' : 'var(--purple)') : 'var(--text-3)',
                  boxShadow: tab === t ? `0 0 0 1px ${t === 'Danger' ? 'rgba(217,92,92,0.25)' : 'rgba(139,92,246,0.35)'}` : 'none',
                }}>
                {t}
              </button>
            ))}
          </div>

          {/* Panel */}
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 'clamp(20px,5vw,32px)' }}>

            {tab === 'Profile' && (
              <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 22, fontWeight: 400, color: '#E5E7EB', marginBottom: 4 }}>Edit Profile</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div className="avatar" style={{ width: 60, height: 60, fontSize: 22, flexShrink: 0, background: "rgba(139,92,246,0.15)", color: "#A78BFA", borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {profile.avatar
                      ? <img src={profile.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt="" onError={e => e.target.style.display = 'none'}/>
                      : (user?.username?.[0] || 'U').toUpperCase()
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <Label>Avatar URL</Label>
                    <input type="url" value={profile.avatar} onChange={e => setProfile({ ...profile, avatar: e.target.value })}
                      placeholder="https://example.com/avatar.jpg" className="input-nexus" style={{ fontSize: 14 }}/>
                  </div>
                </div>

                <div>
                  <Label>Username</Label>
                  <input type="text" value={user?.username || ''} disabled className="input-nexus" style={{ fontSize: 14, opacity: 0.45, cursor: 'not-allowed' }}/>
                  <p style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>Username cannot be changed.</p>
                </div>

                <div>
                  <Label>Bio</Label>
                  <textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell the world about yourself…" rows={4} maxLength={200} className="input-nexus" style={{ resize: 'vertical', fontSize: 14 }}/>
                  <p style={{ fontSize: 12, color: '#6B7280', textAlign: 'right', marginTop: 4 }}>{profile.bio.length}/200</p>
                </div>

                <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 28px', fontSize: 14, opacity: saving ? 0.65 : 1 }}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </form>
            )}

            {tab === 'Password' && (
              <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 22, fontWeight: 400, color: '#E5E7EB', marginBottom: 4 }}>Change Password</h2>
                {[
                  { key: 'current', label: 'Current Password' },
                  { key: 'next',    label: 'New Password' },
                  { key: 'confirm', label: 'Confirm New Password' },
                ].map(f => (
                  <div key={f.key}>
                    <Label>{f.label}</Label>
                    <input type="password" value={passwords[f.key]} onChange={e => setPasswords({ ...passwords, [f.key]: e.target.value })}
                      placeholder="••••••••" required className="input-nexus" style={{ fontSize: 14 }}/>
                  </div>
                ))}
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 28px', fontSize: 14, opacity: saving ? 0.65 : 1 }}>
                  {saving ? 'Updating…' : 'Update password'}
                </button>
              </form>
            )}

            {tab === 'Danger' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <div>
                  <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 22, fontWeight: 400, color: '#E5E7EB', marginBottom: 6 }}>Danger Zone</h2>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>These actions are permanent and cannot be reversed.</p>
                </div>

                <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, background: 'rgba(255,255,255,0.02)' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#EF4444', marginBottom: 8 }}>Reset Entire Platform</h3>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 16 }}>
                    This will delete <strong>ALL</strong> users, posts, and messages from the entire database. Use with extreme caution.
                  </p>
                  <button onClick={handleFullReset} disabled={resetting}
                    style={{ padding: '9px 20px', fontSize: 13, fontWeight: 700, color: '#fff', background: '#EF4444', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', transition: 'all 0.2s', opacity: resetting ? 0.5 : 1 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
                    onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}>
                    {resetting ? 'Resetting...' : 'Reset Website (DELETE EVERYTHING)'}
                  </button>
                </div>

                <div style={{ border: '1px solid rgba(217,92,92,0.25)', borderRadius: 12, padding: 20, background: 'rgba(217,92,92,0.04)' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#EF4444', marginBottom: 8 }}>Delete My Account</h3>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 16 }}>
                    Permanently deletes your account and your posts only.
                  </p>
                  <button onClick={deleteAccount}
                    style={{ padding: '9px 20px', fontSize: 13, fontWeight: 600, color: '#EF4444', background: 'transparent', border: '1px solid rgba(217,92,92,0.35)', borderRadius: 8, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(217,92,92,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    Delete My Account
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
