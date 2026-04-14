import { useEffect, useRef, memo } from 'react';

const ParticleField = memo(function ParticleField({ count = 80, style = {} }) {
  const canvasRef = useRef(null);
  const mouse     = useRef({ x: 0.5, y: 0.5 });
  const animRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Resize handler
    function resize() {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Generate particles
    const PURPLE = { r: 139, g: 92,  b: 246 };
    const CYAN   = { r: 34,  g: 211, b: 238 };
    const WHITE  = { r: 229, g: 231, b: 235 };
    const palettes = [PURPLE, CYAN, WHITE, WHITE];

    const particles = Array.from({ length: count }, () => {
      const col = palettes[Math.floor(Math.random() * palettes.length)];
      return {
        x:   Math.random(),
        y:   Math.random(),
        z:   Math.random(),           // depth 0–1
        vx:  (Math.random() - 0.5) * 0.00015,
        vy:  (Math.random() - 0.5) * 0.00015,
        r:   col.r, g: col.g, b: col.b,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      };
    });

    // Connection lines
    function drawConnections(w, h) {
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b  = particles[j];
          const dx = (a.x - b.x) * w;
          const dy = (a.y - b.y) * h;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 120) continue;
          const alpha = (1 - dist / 120) * 0.08;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(a.x * w, a.y * h);
          ctx.lineTo(b.x * w, b.y * h);
          ctx.stroke();
        }
      }
    }

    let frame = 0;
    function animate() {
      animRef.current = requestAnimationFrame(animate);
      frame++;

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (!w || !h) return;

      ctx.clearRect(0, 0, w, h);

      const mx = mouse.current.x;
      const my = mouse.current.y;

      // Draw connections every other frame for perf
      if (frame % 2 === 0) drawConnections(w, h);

      particles.forEach(p => {
        p.pulse += p.pulseSpeed;
        // Parallax: deeper particles move less with mouse
        const px = p.x + (mx - 0.5) * p.z * 0.04;
        const py = p.y + (my - 0.5) * p.z * 0.04;
        const op = (p.opacity + Math.sin(p.pulse) * 0.08) * (0.4 + p.z * 0.6);
        const sz = p.size * (0.5 + p.z * 0.7);

        // Glow for larger particles
        if (sz > 1.5) {
          const grad = ctx.createRadialGradient(px * w, py * h, 0, px * w, py * h, sz * 4);
          grad.addColorStop(0, `rgba(${p.r},${p.g},${p.b},${op * 0.4})`);
          grad.addColorStop(1, `rgba(${p.r},${p.g},${p.b},0)`);
          ctx.beginPath();
          ctx.arc(px * w, py * h, sz * 4, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(px * w, py * h, sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${op})`;
        ctx.fill();

        // Move
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;
      });
    }

    animate();

    const onMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top)  / rect.height,
      };
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouse);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        display: 'block',
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
});

export default ParticleField;
