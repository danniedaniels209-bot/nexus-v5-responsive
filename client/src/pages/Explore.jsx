import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import PostCard from '../components/ui/PostCard';
import { PageSpinner } from '../components/ui/Spinner';

const TRENDING_TAGS = ['technology', 'ai', 'design', 'lifestyle', 'startup', 'webdev', 'nature', 'gaming'];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTag = searchParams.get('tag') || '';
  const searchQuery = searchParams.get('q') || '';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTag] = useState(currentTag);

  useEffect(() => {
    const fetchExplore = async () => {
      setLoading(true);
      try {
        const url = activeTab
          ? `/posts?tag=${activeTab}`
          : searchQuery
            ? `/posts?search=${searchQuery}`
            : '/posts?limit=20';

        const { data } = await api.get(url);
        setPosts(data.posts || []);
      } catch (err) {
        console.error("Explore fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExplore();
  }, [activeTab, searchQuery]);

  const handleTagClick = (tag) => {
    const nextTag = activeTab === tag ? '' : tag;
    setActiveTag(nextTag);
    setSearchParams(nextTag ? { tag: nextTag } : {});
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: '#E5E7EB', paddingTop: 80, paddingBottom: 100 }}>
      <div className="page-bg" />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 400, marginBottom: 12 }}>Explore</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 15 }}>Discover trending topics and new creators on Nexus.</p>
        </div>

        {/* Tags Bar */}
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 16, marginBottom: 32, msOverflowStyle: 'none', scrollbarWidth: 'none' }} className="hide-scrollbar">
          <button
            onClick={() => handleTagClick('')}
            style={{
              padding: '8px 20px', borderRadius: 99, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: '0.2s',
              background: !activeTab ? '#fff' : 'rgba(255,255,255,0.05)',
              color: !activeTab ? '#000' : '#9CA3AF'
            }}>
            For You
          </button>
          {TRENDING_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              style={{
                padding: '8px 20px', borderRadius: 99, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: '0.2s',
                background: activeTab === tag ? 'var(--purple)' : 'rgba(255,255,255,0.05)',
                color: activeTab === tag ? '#fff' : '#9CA3AF',
                whiteSpace: 'nowrap'
              }}>
              #{tag}
            </button>
          ))}
        </div>

        {/* Feed */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}><PageSpinner /></div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 32, marginBottom: 16 }}>🔎</p>
            <h3 style={{ fontSize: 18, color: '#E5E7EB', marginBottom: 8 }}>No posts found</h3>
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Try searching for something else or explore a different tag.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            <AnimatePresence>
              {posts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
