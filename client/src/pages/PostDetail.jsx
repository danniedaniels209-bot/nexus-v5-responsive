import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useAuthStore from '../context/authStore';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        setPost(data.post);
        setLikes(data.post.likes?.length || 0);
        setLiked(user ? data.post.likes?.includes(user.id) : false);
      } catch { toast.error('Post not found'); }
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!user) return;
    try {
      const { data } = await api.put(`/posts/${id}/like`);
      setLikes(data.likes);
      setLiked(data.liked);
    } catch {}
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;
    setCommenting(true);
    try {
      const { data } = await api.post(`/posts/${id}/comment`, { text: comment });
      setPost((prev) => ({ ...prev, comments: data.comments }));
      setComment('');
      toast.success('Comment added');
    } catch { toast.error('Failed to add comment'); }
    setCommenting(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-teal/30 border-t-teal animate-spin" />
    </div>;
  }

  if (!post) {
    return <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-white/40 font-body">Post not found</p>
        <Link to="/feed" className="text-teal font-body text-sm mt-3 inline-block">← Back to Feed</Link>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative">
      <div className="aurora" />
      <div className="max-w-2xl mx-auto relative z-10">
        <Link to="/feed" className="text-white/40 hover:text-white text-sm font-body flex items-center gap-1.5 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Feed
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 mb-6"
        >
          {/* Author */}
          <div className="flex items-center gap-3 mb-6">
            <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gold/20">
                {post.author?.avatar
                  ? <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-gold font-display font-bold"
                      style={{ background: 'linear-gradient(135deg, #0f0f2a, #1a1a3a)' }}>
                      {post.author?.username?.[0]?.toUpperCase()}
                    </div>
                }
              </div>
              <div>
                <div className="text-white group-hover:text-gold transition-colors font-body font-medium text-sm">{post.author?.username}</div>
                <div className="text-white/25 text-xs font-mono">{new Date(post.createdAt).toLocaleDateString()}</div>
              </div>
            </Link>
          </div>

          {/* Media */}
          {post.mediaUrl && post.mediaType === 'image' && (
            <div className="rounded-2xl overflow-hidden mb-6">
              <img src={post.mediaUrl} alt="" className="w-full object-cover max-h-96" />
            </div>
          )}
          {post.mediaUrl && post.mediaType === 'video' && (
            <div className="rounded-2xl overflow-hidden mb-6">
              <video src={post.mediaUrl} controls className="w-full" />
            </div>
          )}

          {/* Content */}
          {post.title && (
            <h1 className="font-display text-3xl text-white mb-4 leading-tight">{post.title}</h1>
          )}
          <p className="text-white/70 font-body leading-relaxed whitespace-pre-wrap">{post.content}</p>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {post.tags.map((tag) => (
                <Link key={tag} to={`/explore?tag=${tag}`}
                  className="px-3 py-1 rounded-full text-xs font-body text-teal/70 border border-teal/20 hover:text-teal hover:border-teal/40 transition-all">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-5 mt-6 pt-6 border-t border-white/[0.06]">
            <button onClick={handleLike} disabled={!user}
              className={`flex items-center gap-2 transition-all ${liked ? 'text-rose' : 'text-white/40 hover:text-rose'} disabled:opacity-30`}>
              <motion.svg whileTap={{ scale: 1.3 }} className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </motion.svg>
              <span className="font-mono text-sm">{likes}</span>
            </button>
            <span className="flex items-center gap-2 text-white/30 text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <span className="font-mono">{post.views}</span>
            </span>
          </div>
        </motion.article>

        {/* Comments */}
        <div className="glass rounded-3xl p-8">
          <h2 className="font-display text-xl text-white mb-6">
            Comments <span className="text-white/30 text-base">({post.comments?.length || 0})</span>
          </h2>

          {user && (
            <form onSubmit={handleComment} className="mb-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="input-nexus resize-none mb-3"
                maxLength={500}
              />
              <button type="submit" disabled={!comment.trim() || commenting}
                className="btn-teal py-2.5 px-6 text-sm disabled:opacity-40">
                {commenting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          )}

          <div className="space-y-4">
            {post.comments?.length === 0 && (
              <p className="text-white/30 font-body text-sm text-center py-4">No comments yet. Be the first!</p>
            )}
            {post.comments?.map((c) => (
              <div key={c._id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                  {c.user?.avatar
                    ? <img src={c.user.avatar} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gold text-xs font-display font-bold"
                        style={{ background: 'linear-gradient(135deg, #0f0f2a, #1a1a3a)' }}>
                        {c.user?.username?.[0]?.toUpperCase()}
                      </div>
                  }
                </div>
                <div className="flex-1 bg-white/[0.03] rounded-xl px-4 py-3 border border-white/[0.05]">
                  <div className="flex items-center gap-2 mb-1">
                    <Link to={`/profile/${c.user?.username}`} className="text-gold-light text-sm font-body hover:text-gold transition-colors">
                      @{c.user?.username}
                    </Link>
                    <span className="text-white/20 text-xs font-mono">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm font-body">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
