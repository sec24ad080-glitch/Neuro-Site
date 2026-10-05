import React, { useEffect, useRef } from 'react';

// Cosmic Purple Nebula Palette
const COLORS = [
  '#c084fc', // Light Violet
  '#a855f7', // Purple
  '#d946ef', // Neon Magenta
  '#818cf8', // Cosmic Indigo
  '#e879f9', // Bright Pink Flare
  '#38bdf8', // Cyan Starlight
  '#ffffff', // Pure White Star
];

export default function NeuralBloom({
  mode = 'hero', // 'hero', 'how-it-works', 'adaptive', 'voice', 'progress', 'reward'
  triggerBurst = 0
}) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const nebulaCloudsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let currentScroll = window.scrollY;
    let targetScroll = window.scrollY;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;

    const onScroll = () => {
      targetScroll = window.scrollY;
    };
    
    const onMouseMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = canvas.getContext('2d', { alpha: false });
    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', resize);
    resize();

    const isMobile = width < 768;
    const baseParticleCount = prefersReducedMotion ? 60 : (isMobile ? 140 : 380);

    // Initialize Nebula Gas Clouds
    nebulaCloudsRef.current = [
      { x: width * 0.2, y: height * 0.3, radius: 450, color: 'rgba(168, 85, 247, 0.16)', vx: 0.15, vy: 0.08 },
      { x: width * 0.75, y: height * 0.6, radius: 550, color: 'rgba(217, 70, 239, 0.14)', vx: -0.12, vy: 0.10 },
      { x: width * 0.5, y: height * 0.8, radius: 500, color: 'rgba(99, 102, 241, 0.15)', vx: 0.08, vy: -0.14 },
      { x: width * 0.85, y: height * 0.25, radius: 400, color: 'rgba(192, 132, 252, 0.12)', vx: -0.09, vy: -0.07 },
    ];

    class Particle {
      constructor() {
        this.reset();
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.angle = Math.random() * Math.PI * 2;
      }

      reset() {
        const rand = Math.random();
        this.layer = rand < 0.5 ? 1 : (rand < 0.85 ? 2 : 3);
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.size = (Math.random() * 1.8 + 0.4) * (this.layer * 0.75);
        this.isStarFlare = Math.random() < 0.12 && this.layer >= 2; // 12% are sparkling cross flare stars
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = 0.02 + Math.random() * 0.04;
        
        this.baseRadius = Math.random() * (width > 800 ? 380 : 220) + 40;
        this.orbitSpeed = (Math.random() * 0.0018 + 0.0003) * this.layer * (Math.random() > 0.5 ? 1 : -1);
        this.k = Math.floor(Math.random() * 4) + 2; 
        this.burstLife = 0;
      }

      update(time, currentMode, scrollY, mx, my) {
        this.twinklePhase += this.twinkleSpeed;

        if (prefersReducedMotion) {
          this.angle += this.orbitSpeed * 0.2;
          const r = this.baseRadius + Math.sin(this.angle * this.k) * 20;
          const cx = width / 2;
          const cy = height / 2;
          this.x += (cx + Math.cos(this.angle) * r - this.x) * 0.02;
          this.y += (cy + Math.sin(this.angle) * r - this.y) * 0.02;
          return;
        }

        this.angle += this.orbitSpeed;

        let cx = width / 2;
        let cy = height / 2 - scrollY * height * 0.25;

        let targetX = cx;
        let targetY = cy;

        if (currentMode === 'hero' || currentMode === 'reward') {
          const r = this.baseRadius + Math.sin(this.angle * this.k + time * 0.0012) * 90;
          targetX = cx + Math.cos(this.angle) * r;
          targetY = cy + Math.sin(this.angle) * r;
        } 
        else if (currentMode === 'how-it-works') {
          const flowWidth = width * 0.85;
          targetX = cx + ((this.baseRadius * this.angle * 12) % flowWidth) - flowWidth/2;
          targetY = cy + Math.sin(targetX * 0.004 + time * 0.001) * 110 + (Math.random() - 0.5) * 40;
        }
        else if (currentMode === 'voice') {
          const freq = Math.sin(this.x * 0.02 + time * 0.003) * 70;
          const freq2 = Math.cos(this.x * 0.04 + time * 0.005) * 35;
          targetX = this.x + (Math.random() - 0.5) * 5;
          targetY = cy + (freq + freq2) * this.layer;
          if (targetX < 0) targetX = width;
          if (targetX > width) targetX = 0;
        }
        else if (currentMode === 'adaptive') {
          const scale = this.baseRadius;
          const t = this.angle;
          targetX = cx + scale * Math.sin(t);
          targetY = cy + (scale * 0.5) * Math.sin(2 * t);
        }
        else if (currentMode === 'progress') {
          targetX = cx + Math.cos(this.angle) * 200;
          targetY = cy + Math.sin(this.angle) * 200;
        }

        if (this.burstLife > 0) {
          this.vx *= 0.92;
          this.vy *= 0.92;
          this.x += this.vx;
          this.y += this.vy;
          this.burstLife--;
        } else {
          const dx = targetX - this.x;
          const dy = targetY - this.y;
          this.x += dx * 0.012 * this.layer;
          this.y += dy * 0.012 * this.layer;
        }

        if (mx && my && !isMobile) {
          const mdx = mx - this.x;
          const mdy = my - this.y;
          const dist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (dist < 220) {
            const force = (220 - dist) / 220;
            this.x -= (mdx / dist) * force * 1.8 * this.layer;
            this.y -= (mdy / dist) * force * 1.8 * this.layer;
          }
        }
      }

      draw(ctx) {
        const twinkleAlpha = Math.sin(this.twinklePhase) * 0.35 + 0.65;
        ctx.save();
        ctx.globalAlpha = twinkleAlpha;

        if (this.isStarFlare) {
          // Draw 4-point cross star lens flare
          const flareLen = this.size * (3.5 + Math.sin(this.twinklePhase) * 1.5);
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 0.8;
          ctx.shadowBlur = 15;
          ctx.shadowColor = this.color;

          ctx.beginPath();
          ctx.moveTo(this.x - flareLen, this.y);
          ctx.lineTo(this.x + flareLen, this.y);
          ctx.moveTo(this.x, this.y - flareLen);
          ctx.lineTo(this.x, this.y + flareLen);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          
          if (this.layer === 3) {
            ctx.shadowBlur = 14;
            ctx.shadowColor = this.color;
          } else {
            ctx.shadowBlur = 0;
          }
          
          ctx.fillStyle = this.color;
          ctx.fill();
        }

        ctx.restore();
      }

      burst() {
        this.burstLife = 40 + Math.random() * 40;
        const angle = Math.random() * Math.PI * 2;
        const force = Math.random() * 22 + 6;
        this.vx = Math.cos(angle) * force;
        this.vy = Math.sin(angle) * force;
      }
    }

    if (particlesRef.current.length === 0) {
      for (let i = 0; i < baseParticleCount; i++) {
        particlesRef.current.push(new Particle());
      }
    }

    let time = 0;

    const render = () => {
      time += 16;
      
      currentScroll += (targetScroll - currentScroll) * 0.1;
      const scrollProgress = Math.min(currentScroll / (window.innerHeight * 2.5), 1);

      // Deep Purple Cosmic Space Base Clear
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = prefersReducedMotion ? '#0b0416' : 'rgba(11, 4, 22, 0.22)';
      ctx.fillRect(0, 0, width, height);

      // Draw Dynamic Purple Nebula Clouds
      nebulaCloudsRef.current.forEach(cloud => {
        cloud.x += cloud.vx;
        cloud.y += cloud.vy;
        if (cloud.x < -200 || cloud.x > width + 200) cloud.vx *= -1;
        if (cloud.y < -200 || cloud.y > height + 200) cloud.vy *= -1;

        const g = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.radius);
        g.addColorStop(0, cloud.color);
        g.addColorStop(0.6, cloud.color.replace(/[\d\.]+\)$/, '0.04)'));
        g.addColorStop(1, 'rgba(11, 4, 22, 0)');

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Central Cosmic Core Glow
      if (mode === 'hero' || mode === 'adaptive') {
        const cx = width / 2;
        const cy = height / 2 - scrollProgress * height * 0.2;
        
        const breath = Math.sin(time * 0.001) * 0.5 + 0.5;
        const coreRadius = prefersReducedMotion ? 180 : 220 + breath * 60;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
        gradient.addColorStop(0, 'rgba(217, 70, 239, 0.24)');
        gradient.addColorStop(0.4, 'rgba(168, 85, 247, 0.14)');
        gradient.addColorStop(0.8, 'rgba(99, 102, 241, 0.05)');
        gradient.addColorStop(1, 'rgba(11, 4, 22, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(cx - coreRadius, cy - coreRadius, coreRadius * 2, coreRadius * 2);
      }

      ctx.globalCompositeOperation = 'screen';
      
      particlesRef.current.forEach(p => {
        p.update(time, mode, scrollProgress, mx, my);
        p.draw(ctx);
      });

      // Maintain active cosmic purple animation across full scroll
      const opacity = Math.max(0.45, 1 - scrollProgress * 0.4);
      const scale = Math.max(0.9, 1 - scrollProgress * 0.1);
      canvas.style.opacity = opacity;
      canvas.style.transform = `scale(${scale})`;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode]);

  useEffect(() => {
    if (triggerBurst > 0 && particlesRef.current.length > 0) {
      particlesRef.current.forEach(p => {
        if (Math.random() > 0.75) p.burst();
      });
    }
  }, [triggerBurst]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
      }}
    />
  );
}
