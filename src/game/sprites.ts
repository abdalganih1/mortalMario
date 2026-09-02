import { FighterId, Player, Enemy, Projectile, Block, Item, Particle } from '../types';

export class SpriteRenderer {
  // Draw Mortal Kombat Ninjas with authentic retro digitized pixel arcade aesthetic
  static drawPlayer(ctx: CanvasRenderingContext2D, player: Player) {
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height);
    if (player.facing === 'left') {
      ctx.scale(-1, 1);
    }

    // Invincibility flicker
    if (player.isInvincible && Math.floor(player.invincibleTimer * 10) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Dash trail / motion blur
    if (player.isDashing || player.isSliding) {
      ctx.shadowBlur = 18;
      ctx.shadowColor = player.character === 'subzero' ? '#00e5ff' : player.character === 'scorpion' ? '#ff7700' : '#8b5cf6';
    }

    const { character, isAttacking, attackType, isGrounded, isDashing, isSliding, walkCycle } = player;

    // Palette per character
    const palette = {
      subzero: {
        skin: '#e0b296',
        cowl: '#0a0a14',
        armor: '#00d2ff',
        armorDark: '#0088cc',
        pants: '#121218',
        eyes: '#ffffff',
        aura: 'rgba(0, 210, 255, 0.4)',
      },
      scorpion: {
        skin: '#d49b7b',
        cowl: '#14110b',
        armor: '#ffb300',
        armorDark: '#c68400',
        pants: '#181510',
        eyes: '#ffffff',
        aura: 'rgba(255, 120, 0, 0.4)',
      },
      noob: {
        skin: '#09090b',
        cowl: '#030305',
        armor: '#18181b',
        armorDark: '#09090b',
        pants: '#050508',
        eyes: '#ffffff',
        aura: 'rgba(124, 58, 237, 0.5)',
      },
      raiden: {
        skin: '#f5d0b5',
        cowl: '#e2e8f0',
        armor: '#38bdf8',
        armorDark: '#0284c7',
        pants: '#f8fafc',
        eyes: '#38bdf8',
        aura: 'rgba(56, 189, 248, 0.5)',
      },
      reptile: {
        skin: '#4ade80',
        cowl: '#052e16',
        armor: '#22c55e',
        armorDark: '#15803d',
        pants: '#0f172a',
        eyes: '#facc15',
        aura: 'rgba(34, 197, 94, 0.45)',
      },
    }[character];

    // Flower powerup glow
    if (player.powerUp === 'flower') {
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#ffd700';
    }

    // --- SUB-ZERO ICONIC ICE SLIDE POSE ---
    if (isSliding) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00f0ff';

      // 1. Glacial crystalline ice wedge beneath player
      const iceGrad = ctx.createLinearGradient(-32, 0, 36, 0);
      iceGrad.addColorStop(0, 'rgba(0, 220, 255, 0.15)');
      iceGrad.addColorStop(0.4, 'rgba(0, 245, 255, 0.8)');
      iceGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
      ctx.fillStyle = iceGrad;
      ctx.beginPath();
      ctx.moveTo(-32, 0);
      ctx.lineTo(38, 0);
      ctx.lineTo(26, -7);
      ctx.lineTo(-24, -4);
      ctx.closePath();
      ctx.fill();

      // Sharp ice spike crystal accents along the slide
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-20, -2);
      ctx.lineTo(-10, -9);
      ctx.lineTo(0, -2);
      ctx.lineTo(14, -8);
      ctx.lineTo(24, 0);
      ctx.stroke();

      // 2. Low-profile sliding ninja body (tilted back)
      const slideY = -12;

      // Extended front leg kicking forward
      ctx.fillStyle = palette.pants;
      ctx.fillRect(-2, slideY - 2, 28, 8);
      ctx.fillStyle = palette.armor;
      ctx.fillRect(12, slideY - 4, 14, 8);
      // Boot toe cutting forward
      ctx.fillStyle = palette.cowl;
      ctx.fillRect(26, slideY - 3, 8, 7);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(28, slideY + 2, 6, 2);

      // Back leg tucked under body
      ctx.fillStyle = palette.pants;
      ctx.fillRect(-22, slideY - 6, 18, 8);
      ctx.fillStyle = palette.armor;
      ctx.fillRect(-24, slideY - 4, 8, 6);

      // Reclined torso
      ctx.save();
      ctx.translate(-8, slideY - 6);
      ctx.rotate(-0.35); // 20-deg recline

      // Gi shirt
      ctx.fillStyle = palette.cowl;
      ctx.fillRect(-8, -14, 18, 14);

      // Cyan V-tabard
      ctx.fillStyle = palette.armor;
      ctx.fillRect(-6, -14, 6, 14);
      ctx.fillRect(2, -14, 6, 14);

      // Belt
      ctx.fillStyle = palette.armorDark;
      ctx.fillRect(-8, -2, 18, 4);

      // Head & Cowl
      ctx.fillStyle = palette.cowl;
      ctx.beginPath();
      ctx.arc(0, -20, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // Face cutout & Mask
      ctx.fillStyle = palette.skin;
      ctx.fillRect(2, -22, 6, 4);
      ctx.fillStyle = palette.armor;
      ctx.fillRect(1, -19, 8, 6);

      // Glowing Cyan Eye
      ctx.fillStyle = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00f0ff';
      ctx.fillRect(3, -22, 4, 2);
      ctx.shadowBlur = 0;

      // Trailing arm back for aerodynamics
      ctx.fillStyle = palette.skin;
      ctx.fillRect(-16, -12, 10, 5);
      ctx.fillStyle = palette.armor;
      ctx.fillRect(-18, -12, 6, 5);

      // Forward lead arm in combat stance
      ctx.fillStyle = palette.skin;
      ctx.fillRect(8, -8, 10, 5);
      ctx.fillStyle = palette.armor;
      ctx.fillRect(12, -8, 6, 6);

      ctx.restore();
      ctx.restore();
      return;
    }

    // Animation cycle offsets
    const isMoving = Math.abs(player.vx) > 0.5;
    const bounce = isGrounded && !isMoving ? Math.sin(Date.now() / 180) * 1.5 : 0;
    const legSwing = isMoving && isGrounded ? Math.sin(walkCycle * 0.4) * 6 : 0;

    const w = 32;
    const h = 48;
    const topY = -h + bounce;

    // Aura/smoke for Noob Saibot or Sub-Zero
    if (character === 'noob') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, topY + 24, 20, 26, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (character === 'subzero') {
      ctx.fillStyle = 'rgba(0, 220, 255, 0.15)';
      ctx.beginPath();
      ctx.ellipse(0, topY + 24, 18, 24, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- LEGS & BOOTS ---
    ctx.fillStyle = palette.pants;
    // Left leg
    ctx.fillRect(-11, topY + 30, 8, 16 + (isMoving ? legSwing : 0));
    // Right leg
    ctx.fillRect(3, topY + 30, 8, 16 - (isMoving ? legSwing : 0));

    // Shin guards / Ninja wraps
    ctx.fillStyle = palette.armor;
    ctx.fillRect(-11, topY + 36, 8, 8);
    ctx.fillRect(3, topY + 36, 8, 8);

    // Boots
    ctx.fillStyle = palette.cowl;
    ctx.fillRect(-12, topY + 44, 9, 4);
    ctx.fillRect(2, topY + 44, 9, 4);

    // --- TORSO & GI ---
    // Inner black shirt
    ctx.fillStyle = palette.cowl;
    ctx.fillRect(-10, topY + 16, 20, 16);

    // Ninja V-shaped tabard armor (Mortal Kombat icon)
    ctx.fillStyle = palette.armor;
    // Left strap
    ctx.beginPath();
    ctx.moveTo(-10, topY + 16);
    ctx.lineTo(-4, topY + 16);
    ctx.lineTo(-2, topY + 30);
    ctx.lineTo(-7, topY + 30);
    ctx.closePath();
    ctx.fill();

    // Right strap
    ctx.beginPath();
    ctx.moveTo(10, topY + 16);
    ctx.lineTo(4, topY + 16);
    ctx.lineTo(2, topY + 30);
    ctx.lineTo(7, topY + 30);
    ctx.closePath();
    ctx.fill();

    // Ninja belt / Sash
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(-9, topY + 28, 18, 4);

    // --- ARMS & ATTACKS ---
    if (isAttacking) {
      if (attackType === 'uppercut') {
        // High rising mortal kombat uppercut fist
        ctx.fillStyle = palette.cowl;
        ctx.fillRect(4, topY - 2, 7, 18);
        ctx.fillStyle = palette.armor;
        ctx.fillRect(4, topY - 8, 8, 8);
        ctx.fillStyle = palette.skin;
        ctx.fillRect(3, topY - 14, 10, 8);

        // Back arm pulled back
        ctx.fillStyle = palette.skin;
        ctx.fillRect(-12, topY + 20, 6, 8);
      } else if (attackType === 'punch' || attackType === 'special1' || attackType === 'special2') {
        // Extended punch arm
        ctx.fillStyle = palette.cowl;
        ctx.fillRect(2, topY + 16, 16, 6);
        // Forearm / wrap
        ctx.fillStyle = palette.armor;
        ctx.fillRect(10, topY + 15, 8, 8);
        // Fist
        ctx.fillStyle = palette.skin;
        ctx.fillRect(18, topY + 14, 8, 10);

        // Back arm in guard
        ctx.fillStyle = palette.skin;
        ctx.fillRect(-12, topY + 18, 6, 8);
      }
    } else if (isDashing) {
      // Dashing forward sprint arms
      ctx.fillStyle = palette.armor;
      ctx.fillRect(-12, topY + 14, 6, 14);
      ctx.fillRect(6, topY + 14, 12, 6);
    } else {
      // Classic Mortal Kombat idle guard stance
      // Back arm
      ctx.fillStyle = palette.skin;
      ctx.fillRect(-12, topY + 18, 6, 9);
      ctx.fillStyle = palette.armor;
      ctx.fillRect(-12, topY + 21, 6, 5);

      // Lead arm raised in combat guard
      ctx.fillStyle = palette.cowl;
      ctx.fillRect(4, topY + 17, 6, 8);
      ctx.fillStyle = palette.armor;
      ctx.fillRect(6, topY + 14, 7, 6);
      ctx.fillStyle = palette.skin;
      ctx.fillRect(10, topY + 10, 6, 6);
    }

    // --- HEAD, MASK & HOOD ---
    // Ninja Hood / Cowl
    ctx.fillStyle = palette.cowl;
    ctx.beginPath();
    ctx.arc(0, topY + 8, 9, 0, Math.PI * 2);
    ctx.fill();

    // Face cutout / Eyes
    ctx.fillStyle = palette.skin;
    ctx.fillRect(-4, topY + 4, 10, 5);

    // Ninja Mask
    ctx.fillStyle = palette.armor;
    ctx.fillRect(-5, topY + 8, 11, 7);
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(-3, topY + 11, 7, 2);

    // Glowing Eyes
    ctx.fillStyle = palette.eyes;
    ctx.fillRect(1, topY + 5, 3, 2);
    if (character === 'noob') {
      // Eerie white glowing slit eyes for Noob Saibot
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, topY + 5, 4, 2);
      ctx.shadowBlur = 0;
    } else if (character === 'raiden') {
      // Electric glowing cyan eyes
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#38bdf8';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, topY + 5, 4, 2);
      ctx.shadowBlur = 0;

      // Raiden's Iconic Conical Straw Hat
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(0, topY - 8);
      ctx.lineTo(18, topY + 4);
      ctx.lineTo(-18, topY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (character === 'reptile') {
      // Reptilian yellow-gold slit eye
      ctx.fillStyle = '#facc15';
      ctx.fillRect(1, topY + 5, 3, 2);
      ctx.fillStyle = '#052e16';
      ctx.fillRect(2, topY + 5, 1, 2);
    }

    ctx.restore();
  }

  // Draw Noob's Shadow Clone sprinting forward
  static drawShadowClone(ctx: CanvasRenderingContext2D, proj: Projectile) {
    ctx.save();
    ctx.translate(proj.x + proj.width / 2, proj.y + proj.height);
    if (proj.facing === 'left') {
      ctx.scale(-1, 1);
    }

    // Ominous purple/black shadow smoke
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#7c3aed';

    // Shadow silhouette
    ctx.fillStyle = '#0a0a0f';
    const h = 42;
    const topY = -h;

    // Body
    ctx.fillRect(-9, topY + 14, 18, 16);
    // Head
    ctx.beginPath();
    ctx.arc(0, topY + 7, 8, 0, Math.PI * 2);
    ctx.fill();
    // Glowing white phantom eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, topY + 5, 4, 2);

    // Sprinting arms outstretched to grab enemy
    ctx.fillStyle = '#14141d';
    ctx.fillRect(2, topY + 14, 18, 7);
    ctx.fillRect(16, topY + 12, 7, 10);

    // Sprinting phantom legs
    const legPhase = Math.sin(Date.now() / 60) * 8;
    ctx.fillRect(-8, topY + 28, 7, 14 + legPhase);
    ctx.fillRect(2, topY + 28, 7, 14 - legPhase);

    // Shadow smoke trails
    ctx.fillStyle = 'rgba(124, 58, 237, 0.4)';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(-15 - i * 8, topY + 20 + Math.sin(i * 2 + Date.now() / 100) * 5, 6 - i, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Sub-Zero's Ice Blast
  static drawIceBlast(ctx: CanvasRenderingContext2D, proj: Projectile) {
    ctx.save();
    ctx.translate(proj.x + proj.width / 2, proj.y + proj.height / 2);
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#00f0ff';

    // Rotating ice crystal cluster
    const angle = Date.now() / 120;
    ctx.rotate(angle);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#00d2ff';
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 4, Math.sin(a) * 4);
      ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14);
      ctx.lineTo(Math.cos(a + 0.3) * 6, Math.sin(a + 0.3) * 6);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Draw Scorpion's Harpoon Spear
  static drawSpear(ctx: CanvasRenderingContext2D, proj: Projectile, playerX: number, playerY: number) {
    ctx.save();

    // Draw chain linking player hand to spear tip
    ctx.strokeStyle = '#c68400';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(playerX + 16, playerY + 20);
    ctx.lineTo(proj.x + proj.width / 2, proj.y + proj.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.translate(proj.x + proj.width / 2, proj.y + proj.height / 2);
    if (proj.facing === 'left') {
      ctx.scale(-1, 1);
    }

    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff5500';

    // Kunai spearhead
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-6, -7);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();

    // Glowing core
    ctx.fillStyle = '#ff7700';
    ctx.fillRect(-2, -3, 6, 6);

    ctx.restore();
  }

  // Draw Bowser's Fireball
  static drawBowserFire(ctx: CanvasRenderingContext2D, proj: Projectile) {
    ctx.save();
    ctx.translate(proj.x + proj.width / 2, proj.y + proj.height / 2);
    if (proj.facing === 'left') {
      ctx.scale(-1, 1);
    }

    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ff2200';

    // Multi-layer flame
    const time = Date.now() / 80;
    const wobble = Math.sin(time) * 3;

    // Outer flame
    ctx.fillStyle = '#ff2200';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16 + wobble, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mid flame
    ctx.fillStyle = '#ff9900';
    ctx.beginPath();
    ctx.ellipse(3, 0, 11, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Core white flame
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(6, 0, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Raiden's Lightning Bolt
  static drawLightning(ctx: CanvasRenderingContext2D, proj: Projectile) {
    ctx.save();
    ctx.translate(proj.x + proj.width / 2, proj.y + proj.height / 2);
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#38bdf8';

    const dir = proj.facing === 'left' ? -1 : 1;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-16 * dir, 0);
    ctx.lineTo(-6 * dir, -8);
    ctx.lineTo(2 * dir, 6);
    ctx.lineTo(16 * dir, 0);
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Electric plasma orb at tip
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(14 * dir, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Reptile's Acid Spit
  static drawAcid(ctx: CanvasRenderingContext2D, proj: Projectile) {
    ctx.save();
    ctx.translate(proj.x + proj.width / 2, proj.y + proj.height / 2);
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#22c55e';

    const bubble = Math.sin(Date.now() / 80) * 2.5;

    // Glowing Toxic Slime
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(0, 0, 9 + bubble, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(2, -2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Acid droplets
    const dir = proj.facing === 'left' ? 1 : -1;
    ctx.fillStyle = '#15803d';
    ctx.fillRect(dir * 10, -2, 4, 4);
    ctx.fillRect(dir * 16, 2, 3, 3);

    ctx.restore();
  }

  // Draw Mario Enemies: Goomba, Koopa, Piranha, BOWSER Boss, and RIVAL NINJA Boss
  static drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    if (!enemy.isAlive) return;

    ctx.save();
    ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height);

    if (enemy.facing === 'left') {
      ctx.scale(-1, 1);
    }

    // If frozen by Sub-Zero
    if (enemy.isFrozen) {
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00f0ff';
    }

    const { type, width, height, isFrozen } = enemy;
    const topY = -height;

    if (type === 'goomba') {
      // --- GOOMBA ---
      const walk = Math.sin(Date.now() / 150) * 3;

      // Feet
      ctx.fillStyle = isFrozen ? '#0066aa' : '#1e1b18';
      ctx.fillRect(-12 + walk, topY + 22, 10, 6);
      ctx.fillRect(2 - walk, topY + 22, 10, 6);

      // Body / Head
      ctx.fillStyle = isFrozen ? '#00c3ff' : '#a84e1b';
      ctx.beginPath();
      ctx.moveTo(0, topY);
      ctx.quadraticCurveTo(14, topY, 14, topY + 16);
      ctx.lineTo(10, topY + 22);
      ctx.lineTo(-10, topY + 22);
      ctx.lineTo(-14, topY + 16);
      ctx.quadraticCurveTo(-14, topY, 0, topY);
      ctx.fill();

      // Belly
      ctx.fillStyle = isFrozen ? '#7ee3ff' : '#f0cf9e';
      ctx.fillRect(-7, topY + 14, 14, 8);

      // Menacing Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-9, topY + 7, 5, 7);
      ctx.fillRect(4, topY + 7, 5, 7);

      ctx.fillStyle = '#000000';
      ctx.fillRect(-7, topY + 9, 3, 4);
      ctx.fillRect(4, topY + 9, 3, 4);

      // Angry Brows
      ctx.fillStyle = '#000000';
      ctx.fillRect(-10, topY + 5, 7, 2);
      ctx.fillRect(3, topY + 5, 7, 2);

    } else if (type === 'koopa') {
      // --- KOOPA TROOPA ---
      const walk = Math.sin(Date.now() / 150) * 3;

      // Green Spiked Shell
      ctx.fillStyle = isFrozen ? '#00b4d8' : '#16a34a';
      ctx.beginPath();
      ctx.arc(0, topY + 18, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Yellow Head
      ctx.fillStyle = isFrozen ? '#90e0ef' : '#facc15';
      ctx.beginPath();
      ctx.arc(10, topY + 8, 8, 0, Math.PI * 2);
      ctx.fill();

      // Beak & Eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(12, topY + 6, 3, 4);

      // Shoes
      ctx.fillStyle = isFrozen ? '#0077b6' : '#ea580c';
      ctx.fillRect(-10 + walk, topY + 30, 8, 6);
      ctx.fillRect(2 - walk, topY + 30, 8, 6);

    } else if (type === 'piranha') {
      // --- PIRANHA PLANT ---
      const snap = Math.abs(Math.sin(Date.now() / 200));

      // Green Stem & leaves
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(-4, topY + 16, 8, 16);
      ctx.fillRect(-10, topY + 22, 6, 4);
      ctx.fillRect(4, topY + 22, 6, 4);

      // Red bulb head with white spots
      ctx.fillStyle = isFrozen ? '#00b4d8' : '#dc2626';
      ctx.beginPath();
      ctx.arc(0, topY + 10, 14, 0, Math.PI * 2);
      ctx.fill();

      // White spots
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-6, topY + 6, 3, 0, Math.PI * 2);
      ctx.arc(6, topY + 6, 3, 0, Math.PI * 2);
      ctx.arc(0, topY + 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Snapping jaws with white teeth
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-8, topY + 10 - snap * 3, 16, 3);
      ctx.fillRect(-8, topY + 14 + snap * 3, 16, 3);

    } else if (type === 'bowser') {
      // --- BOWSER (KING KOOPA) - EPIC RETRO RETRO BOSS ---
      const breathPulse = Math.sin(Date.now() / 250) * 3;

      // Drop/fall if bridge is collapsed
      if (enemy.isBridgeFallen) {
        ctx.rotate((enemy.vy * Math.PI) / 180);
      }

      // Massive Spiked Shell
      ctx.fillStyle = isFrozen ? '#0077b6' : '#15803d';
      ctx.beginPath();
      ctx.arc(-8, topY + 34, 28, 0, Math.PI * 2);
      ctx.fill();

      // White shell rim
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Shell Spikes
      ctx.fillStyle = '#f8fafc';
      const spikes = [
        { x: -28, y: topY + 22 },
        { x: -32, y: topY + 36 },
        { x: -24, y: topY + 48 },
        { x: -14, y: topY + 14 },
      ];
      spikes.forEach(sp => {
        ctx.beginPath();
        ctx.moveTo(sp.x, sp.y);
        ctx.lineTo(sp.x - 10, sp.y - 4);
        ctx.lineTo(sp.x - 4, sp.y + 6);
        ctx.closePath();
        ctx.fill();
      });

      // Massive Claws / Feet
      ctx.fillStyle = isFrozen ? '#0096c7' : '#eab308';
      ctx.fillRect(-18, topY + 54, 16, 12);
      ctx.fillRect(8, topY + 54, 16, 12);

      // Sharp white talons
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-20, topY + 62, 5, 5);
      ctx.fillRect(20, topY + 62, 5, 5);

      // Scaled Belly & Torso
      ctx.fillStyle = isFrozen ? '#48cae4' : '#fef08a';
      ctx.fillRect(2, topY + 24, 26, 30);
      // Torso scales
      ctx.fillStyle = isFrozen ? '#0077b6' : '#ca8a04';
      ctx.fillRect(6, topY + 32, 18, 2);
      ctx.fillRect(6, topY + 42, 18, 2);

      // Huge Arm & Spiked Wristband
      ctx.fillStyle = isFrozen ? '#0096c7' : '#eab308';
      ctx.fillRect(16, topY + 30, 16, 12);
      // Black studded wristband
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(22, topY + 30, 6, 12);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(24, topY + 32, 2, 2);
      ctx.fillRect(24, topY + 38, 2, 2);

      // Head & Snout
      ctx.fillStyle = isFrozen ? '#0096c7' : '#eab308';
      ctx.fillRect(14, topY + 12 + breathPulse, 24, 18);

      // Horns
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(16, topY + 10 + breathPulse);
      ctx.lineTo(10, topY - 4);
      ctx.lineTo(22, topY + 8 + breathPulse);
      ctx.closePath();
      ctx.fill();

      // Wild Flaming Red Hair / Crest
      ctx.fillStyle = isFrozen ? '#00f0ff' : '#dc2626';
      ctx.beginPath();
      ctx.moveTo(8, topY + 8);
      ctx.lineTo(18, topY - 8);
      ctx.lineTo(26, topY + 4);
      ctx.lineTo(32, topY - 4);
      ctx.lineTo(34, topY + 14);
      ctx.closePath();
      ctx.fill();

      // Menacing Red/Yellow Eyes
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(24, topY + 14 + breathPulse, 6, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(26, topY + 15 + breathPulse, 2, 3);

      // Snout & Sharp Fangs
      ctx.fillStyle = isFrozen ? '#48cae4' : '#fef08a';
      ctx.fillRect(28, topY + 20 + breathPulse, 14, 10);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(30, topY + 28 + breathPulse, 4, 4); // Fang
      ctx.fillRect(38, topY + 28 + breathPulse, 4, 4); // Fang

      // Fire ember from mouth when attacking
      if (!isFrozen) {
        ctx.fillStyle = '#ff4400';
        ctx.beginPath();
        ctx.arc(44, topY + 24 + breathPulse, 4 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'rival_ninja') {
      // --- RIVAL MORTAL KOMBAT NINJA BOSS ---
      const rivalId = enemy.rivalFighter || 'scorpion';
      const palettes: Record<string, { armor: string; armorDark: string; cowl: string; pants: string; eyes: string }> = {
        subzero: { armor: '#00d2ff', armorDark: '#0088cc', cowl: '#0a0a14', pants: '#121218', eyes: '#ffffff' },
        scorpion: { armor: '#ffb300', armorDark: '#c68400', cowl: '#14110b', pants: '#181510', eyes: '#ffffff' },
        noob: { armor: '#18181b', armorDark: '#09090b', cowl: '#030305', pants: '#050508', eyes: '#ffffff' },
        raiden: { armor: '#38bdf8', armorDark: '#0284c7', cowl: '#f8fafc', pants: '#e2e8f0', eyes: '#38bdf8' },
        reptile: { armor: '#22c55e', armorDark: '#15803d', cowl: '#052e16', pants: '#0f172a', eyes: '#facc15' },
      };
      const pal = palettes[rivalId] || palettes.scorpion;

      const idleBreathing = Math.sin(Date.now() / 160) * 1.5;

      // Shadow / Aura
      ctx.shadowBlur = isFrozen ? 14 : 10;
      ctx.shadowColor = isFrozen ? '#00f0ff' : pal.armor;

      // Legs / Boots
      ctx.fillStyle = isFrozen ? '#0077b6' : pal.pants;
      ctx.fillRect(-10, topY + 30, 8, 18);
      ctx.fillRect(2, topY + 30, 8, 18);

      // Torso / Ninja Armor Tabard
      ctx.fillStyle = isFrozen ? '#90e0ef' : pal.cowl;
      ctx.fillRect(-10, topY + 12 + idleBreathing, 20, 20);

      // V-shaped colored armor
      ctx.fillStyle = isFrozen ? '#00b4d8' : pal.armor;
      ctx.beginPath();
      ctx.moveTo(-10, topY + 12 + idleBreathing);
      ctx.lineTo(-4, topY + 28 + idleBreathing);
      ctx.lineTo(4, topY + 28 + idleBreathing);
      ctx.lineTo(10, topY + 12 + idleBreathing);
      ctx.closePath();
      ctx.fill();

      // Belt
      ctx.fillStyle = pal.armorDark;
      ctx.fillRect(-10, topY + 28 + idleBreathing, 20, 4);

      // Arms / Combat Pose
      if (enemy.attackTimer && enemy.attackTimer > 0) {
        // Punches or shoots forward
        ctx.fillStyle = pal.cowl;
        ctx.fillRect(2, topY + 16, 16, 6);
        ctx.fillStyle = pal.armor;
        ctx.fillRect(10, topY + 15, 8, 8);
      } else {
        // Guard stance
        ctx.fillStyle = pal.cowl;
        ctx.fillRect(4, topY + 16, 6, 8);
        ctx.fillStyle = pal.armor;
        ctx.fillRect(6, topY + 14, 7, 6);
      }

      // Cowl / Hood
      ctx.fillStyle = isFrozen ? '#0077b6' : pal.cowl;
      ctx.beginPath();
      ctx.arc(0, topY + 8 + idleBreathing, 9, 0, Math.PI * 2);
      ctx.fill();

      // Mask
      ctx.fillStyle = isFrozen ? '#00b4d8' : pal.armor;
      ctx.fillRect(-5, topY + 8 + idleBreathing, 11, 7);

      // Eyes
      ctx.fillStyle = pal.eyes;
      ctx.fillRect(1, topY + 5 + idleBreathing, 3, 2);

      // Conical Hat for Raiden
      if (rivalId === 'raiden') {
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.moveTo(0, topY - 8 + idleBreathing);
        ctx.lineTo(18, topY + 4 + idleBreathing);
        ctx.lineTo(-18, topY + 4 + idleBreathing);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Boss Health Bar above rival head
      const barW = 44;
      const barH = 5;
      const healthPct = Math.max(0, enemy.health / enemy.maxHealth);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-barW / 2 - 1, topY - 14, barW + 2, barH + 2);
      ctx.fillStyle = healthPct > 0.4 ? pal.armor : '#ef4444';
      ctx.fillRect(-barW / 2, topY - 13, barW * healthPct, barH);

      // Boss Name
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(rivalId.toUpperCase(), 0, topY - 16);
    }

    ctx.restore();
  }

  // Draw Mario Blocks (Question blocks, Bricks, Pipes, Bridge, Lava, Golden Axe)
  static drawBlock(ctx: CanvasRenderingContext2D, block: Block) {
    if (block.isDestroyed) return;

    ctx.save();
    const bounce = block.bounceOffset || 0;
    const y = block.y + bounce;

    if (block.type === 'question') {
      if (block.isHit) {
        // Used Empty Block (Brownish metallic with corner rivets)
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(block.x, y, block.width, block.height);
        ctx.strokeStyle = '#5a3818';
        ctx.lineWidth = 2;
        ctx.strokeRect(block.x, y, block.width, block.height);

        // Corner rivets
        ctx.fillStyle = '#3a220d';
        ctx.fillRect(block.x + 3, y + 3, 3, 3);
        ctx.fillRect(block.x + block.width - 6, y + 3, 3, 3);
        ctx.fillRect(block.x + 3, y + block.height - 6, 3, 3);
        ctx.fillRect(block.x + block.width - 6, y + block.height - 6, 3, 3);
      } else {
        // Golden Active Question Block
        const shine = Math.sin(Date.now() / 200);
        ctx.fillStyle = shine > 0 ? '#fcb040' : '#f7931e';
        ctx.fillRect(block.x, y, block.width, block.height);

        // Border
        ctx.strokeStyle = '#d46500';
        ctx.lineWidth = 2;
        ctx.strokeRect(block.x + 1, y + 1, block.width - 2, block.height - 2);

        // Rivets
        ctx.fillStyle = '#7a3e00';
        ctx.fillRect(block.x + 3, y + 3, 3, 3);
        ctx.fillRect(block.x + block.width - 6, y + 3, 3, 3);
        ctx.fillRect(block.x + 3, y + block.height - 6, 3, 3);
        ctx.fillRect(block.x + block.width - 6, y + block.height - 6, 3, 3);

        // Question mark '?'
        ctx.fillStyle = '#7a3e00';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', block.x + block.width / 2, y + block.height / 2);
      }
    } else if (block.type === 'brick') {
      // Classic Mario Brick block with 3D bevels
      ctx.fillStyle = '#c84c0c';
      ctx.fillRect(block.x, y, block.width, block.height);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(block.x, y, block.width, block.height);

      // 3D Bevel highlight & shadow
      ctx.fillStyle = '#e86a2c';
      ctx.fillRect(block.x + 1, y + 1, block.width - 2, 2);
      ctx.fillStyle = '#782604';
      ctx.fillRect(block.x + 1, y + block.height - 2, block.width - 2, 1);

      // Brick pattern grooves
      ctx.fillStyle = '#260a02';
      ctx.fillRect(block.x, y + block.height / 2, block.width, 2);
      ctx.fillRect(block.x + block.width / 2, y, 2, block.height / 2);
      ctx.fillRect(block.x + block.width / 4, y + block.height / 2, 2, block.height / 2);
      ctx.fillRect(block.x + (block.width * 3) / 4, y + block.height / 2, 2, block.height / 2);
    } else if (block.type === 'stone') {
      // Castle or ground stone block with textured bevel
      ctx.fillStyle = '#334155';
      ctx.fillRect(block.x, y, block.width, block.height);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.strokeRect(block.x, y, block.width, block.height);

      // Top edge highlight
      ctx.fillStyle = '#475569';
      ctx.fillRect(block.x + 2, y + 2, block.width - 4, 3);
      // Inner stone body
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(block.x + 4, y + 5, block.width - 8, block.height - 9);
    } else if (block.type === 'pipe' || block.type === 'pipe_top') {
      // Classic Green Mario Pipe with cylindrical gradient
      const pipeGrad = ctx.createLinearGradient(block.x, 0, block.x + block.width, 0);
      pipeGrad.addColorStop(0, '#15803d');
      pipeGrad.addColorStop(0.18, '#4ade80');
      pipeGrad.addColorStop(0.35, '#22c55e');
      pipeGrad.addColorStop(0.75, '#16a34a');
      pipeGrad.addColorStop(1, '#052e16');
      ctx.fillStyle = pipeGrad;
      ctx.fillRect(block.x, y, block.width, block.height);

      // Pipe top collar lip
      if (block.type === 'pipe_top' || block.height > 40) {
        const lipHeight = 16;
        ctx.fillStyle = pipeGrad;
        ctx.fillRect(block.x - 3, y, block.width + 6, lipHeight);
        ctx.strokeStyle = '#052e16';
        ctx.lineWidth = 2;
        ctx.strokeRect(block.x - 3, y, block.width + 6, lipHeight);
        // Highlight line
        ctx.fillStyle = '#86efac';
        ctx.fillRect(block.x + 4, y + 2, 3, lipHeight - 4);
      }

      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 2;
      ctx.strokeRect(block.x, y, block.width, block.height);
    } else if (block.type === 'bridge') {
      // Castle Chain Bridge over lava
      ctx.fillStyle = '#92400e';
      ctx.fillRect(block.x, y, block.width, 10);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(block.x, y + 10, block.width, block.height - 10);
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 1;
      ctx.strokeRect(block.x, y, block.width, block.height);
      // Rope ties
      ctx.fillStyle = '#d97706';
      for (let rx = block.x + 8; rx < block.x + block.width; rx += 16) {
        ctx.fillRect(rx, y + 2, 2, 6);
      }
    } else if (block.type === 'lava') {
      // Animated bubbling hot lava with radiant heat
      const lavaPulse = Math.sin(Date.now() / 250 + block.x / 30);
      ctx.fillStyle = lavaPulse > 0 ? '#dc2626' : '#ea580c';
      ctx.fillRect(block.x, y, block.width, block.height);

      // Lava glowing molten crust
      ctx.fillStyle = '#facc15';
      ctx.fillRect(block.x, y, block.width, 4);

      // Boiling lava bubbles
      const bubbleTime = (Date.now() / 400 + block.x / 50) % Math.PI;
      const bubbleY = y + 8 + Math.sin(bubbleTime) * 6;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(block.x + block.width / 2, bubbleY, 3 + lavaPulse * 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (block.type === 'axe') {
      // Golden Battle Axe (Bowser bridge collapse switch)
      ctx.fillStyle = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#fbbf24';

      // Pedestal
      ctx.fillRect(block.x + 10, y + block.height - 8, 12, 8);
      // Axe handle
      ctx.fillStyle = '#78350f';
      ctx.fillRect(block.x + 14, y + 6, 4, block.height - 14);

      // Golden Axe Blade
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(block.x + 16, y + 10, 10, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(block.x + 16, y + 10);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Items (Coin, Super Mushroom, Fire Flower)
  static drawItem(ctx: CanvasRenderingContext2D, item: Item) {
    if (item.collected) return;
    ctx.save();
    const { x, y, width, height, type } = item;

    if (type === 'coin') {
      // Rotating Mario gold coin
      const coinWidth = Math.abs(Math.cos(Date.now() / 150)) * width;
      const coinX = x + (width - coinWidth) / 2;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y + height / 2, Math.max(2, coinWidth / 2), height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (type === 'mushroom') {
      // Super Mushroom
      // Cap
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height / 2, width / 2, Math.PI, 0);
      ctx.fill();
      // White spots
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + width / 2, y + 6, 4, 0, Math.PI * 2);
      ctx.arc(x + 5, y + 10, 3, 0, Math.PI * 2);
      ctx.arc(x + width - 5, y + 10, 3, 0, Math.PI * 2);
      ctx.fill();
      // Face
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 4, y + height / 2, width - 8, height / 2);
      // Eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 7, y + height / 2 + 2, 2, 4);
      ctx.fillRect(x + width - 9, y + height / 2 + 2, 2, 4);
    } else if (type === 'flower') {
      // Fire Flower (animated 4-tone petals)
      const flash = Math.floor(Date.now() / 120) % 4;
      const colors = ['#dc2626', '#f97316', '#eab308', '#ffffff'];

      // Stem & Leaves
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x + width / 2 - 2, y + height / 2, 4, height / 2);
      ctx.fillRect(x + 2, y + height - 6, 6, 4);
      ctx.fillRect(x + width - 8, y + height - 6, 6, 4);

      // Petal rings
      ctx.fillStyle = colors[flash];
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height / 2 - 2, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = colors[(flash + 1) % 4];
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height / 2 - 2, 6, 0, Math.PI * 2);
      ctx.fill();

      // Center face
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height / 2 - 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Particles
  static drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;

    if (p.shape === 'spark') {
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    } else if (p.shape === 'smoke') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
