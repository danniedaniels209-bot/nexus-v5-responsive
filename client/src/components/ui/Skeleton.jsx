// Skeleton loading components for all major UI shapes

function SkeletonBox({ w = '100%', h = 16, r = 8, style = {} }) {
  return (
    <div className="skeleton" style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...style }} />
  );
}

export function PostCardSkeleton() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16, padding: 20,
    }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <SkeletonBox w={40} h={40} r={20} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SkeletonBox w="50%" h={12} />
          <SkeletonBox w="35%" h={10} />
        </div>
      </div>
      <SkeletonBox w="100%" h={12} style={{ marginBottom: 8 }} />
      <SkeletonBox w="85%" h={12} style={{ marginBottom: 8 }} />
      <SkeletonBox w="60%" h={12} style={{ marginBottom: 18 }} />
      <div style={{ display: 'flex', gap: 16 }}>
        <SkeletonBox w={50} h={28} r={8} />
        <SkeletonBox w={50} h={28} r={8} />
        <SkeletonBox w={50} h={28} r={8} />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
      <SkeletonBox w="100%" h={120} r={0} />
      <div style={{ padding: 20 }}>
        <SkeletonBox w={72} h={72} r={36} style={{ marginTop: -36, marginBottom: 14 }} />
        <SkeletonBox w="45%" h={18} style={{ marginBottom: 8 }} />
        <SkeletonBox w="30%" h={12} style={{ marginBottom: 16 }} />
        <SkeletonBox w="80%" h={12} style={{ marginBottom: 8 }} />
        <SkeletonBox w="60%" h={12} style={{ marginBottom: 20 }} />
        <div style={{ display: 'flex', gap: 12 }}>
          <SkeletonBox w="50%" h={36} r={10} />
          <SkeletonBox w="50%" h={36} r={10} />
        </div>
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SidebarUserSkeleton({ count = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SkeletonBox w={36} h={36} r={18} />
          <div style={{ flex: 1 }}>
            <SkeletonBox w="60%" h={11} style={{ marginBottom: 6 }} />
            <SkeletonBox w="40%" h={9} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[true, false, true, false, true].map((right, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: right ? 'flex-end' : 'flex-start', gap: 8 }}>
          {!right && <SkeletonBox w={28} h={28} r={14} style={{ flexShrink: 0 }} />}
          <SkeletonBox w={`${Math.floor(Math.random() * 30 + 40)}%`} h={36} r={12} />
        </div>
      ))}
    </div>
  );
}

export default SkeletonBox;
