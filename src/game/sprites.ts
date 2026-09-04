import { FighterId, Player, Enemy, Projectile, Block, Item, Particle } from '../types';

export class SpriteRenderer {
  // Draw Mortal Kombat Ninjas with authentic retro digitized pixel arcade aesthetic
  static drawPlayer(ctx: CanvasRenderingContext2D, player: Player) {
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height);
    if (player.facing === 'left') {
      ctx.scale(-1, 1);
    }
    // BIG mushroom size: scale the whole rig (feet stay planted)
    const sizeK = (player.height || 48) / 48;
    ctx.scale(sizeK, sizeK);

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
    const isBlocking = player.isBlocking;
    const isCrouching = player.isCrouching;
    const crouchUppercut = player.crouchUppercut;

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
      baraka: {
        skin: '#c9a186',
        cowl: '#1c0a0a',
        armor: '#f43f5e',
        armorDark: '#881337',
        pants: '#1c0a0a',
        eyes: '#fecdd3',
        aura: 'rgba(244, 63, 94, 0.45)',
      },
      liukang: {
        skin: '#e8b88a',
        cowl: '#171207',
        armor: '#f97316',
        armorDark: '#7c2d12',
        pants: '#171207',
        eyes: '#ffffff',
        aura: 'rgba(249, 115, 22, 0.45)',
      },
      kitana: {
        skin: '#f0c8a8',
        cowl: '#0a1030',
        armor: '#60a5fa',
        armorDark: '#1e3a8a',
        pants: '#0a1030',
        eyes: '#dbeafe',
        aura: 'rgba(96, 165, 250, 0.45)',
      },
      shangtsung: {
        skin: '#d9b896',
        cowl: '#12081f',
        armor: '#a855f7',
        armorDark: '#3b0764',
        pants: '#12081f',
        eyes: '#4ade80',
        aura: 'rgba(168, 85, 247, 0.5)',
      },
      kunglao: {
        skin: '#e8b88a',
        cowl: '#1a1408',
        armor: '#eab308',
        armorDark: '#713f12',
        pants: '#1a1408',
        eyes: '#ffffff',
        aura: 'rgba(234, 179, 8, 0.45)',
      },
      johnnycage: {
        skin: '#f0c8a8',
        cowl: '#0b1410',
        armor: '#4ade80',
        armorDark: '#14532d',
        pants: '#0b1410',
        eyes: '#bbf7d0',
        aura: 'rgba(74, 222, 128, 0.45)',
      },
      jax: {
        skin: '#c98d5e',
        cowl: '#10151f',
        armor: '#94a3b8',
        armorDark: '#334155',
        pants: '#10151f',
        eyes: '#f8fafc',
        aura: 'rgba(148, 163, 184, 0.45)',
      },
      sonya: {
        skin: '#f2cfae',
        cowl: '#160a12',
        armor: '#f472b6',
        armorDark: '#831843',
        pants: '#160a12',
        eyes: '#fce7f3',
        aura: 'rgba(244, 114, 182, 0.45)',
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

    // --- CLASSIC MK CROUCH UPPERCUT: ducked low, fist launched skyward ---
    if (crouchUppercut && isAttacking) {
      // Ducked thighs
      ctx.fillStyle = palette.pants;
      ctx.fillRect(-14, -14, 14, 10);
      ctx.fillRect(0, -14, 14, 10);
      // Boots planted wide
      ctx.fillStyle = palette.cowl;
      ctx.fillRect(-17, -6, 13, 6);
      ctx.fillRect(4, -6, 13, 6);
      // Hunched torso
      ctx.fillStyle = palette.cowl;
      ctx.fillRect(-10, -30, 20, 18);
      // Chest straps
      ctx.fillStyle = palette.armor;
      ctx.beginPath();
      ctx.moveTo(-10, -30);
      ctx.lineTo(-4, -30);
      ctx.lineTo(-2, -16);
      ctx.lineTo(-7, -16);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(10, -30);
      ctx.lineTo(4, -30);
      ctx.lineTo(2, -16);
      ctx.lineTo(7, -16);
      ctx.closePath();
      ctx.fill();
      // Belt
      ctx.fillStyle = palette.armorDark;
      ctx.fillRect(-9, -18, 18, 4);
      // THE RISING FIST: arm shot straight up past the head
      ctx.fillStyle = palette.cowl;
      ctx.fillRect(3, -58, 8, 32);
      ctx.fillStyle = palette.armor;
      ctx.fillRect(2, -52, 10, 8);
      ctx.fillStyle = palette.skin;
      ctx.fillRect(1, -67, 12, 10);
      // Impact flash at the fist
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(7, -72);
      ctx.lineTo(7, -78);
      ctx.moveTo(0, -69);
      ctx.lineTo(-4, -73);
      ctx.moveTo(14, -69);
      ctx.lineTo(18, -73);
      ctx.stroke();
      ctx.shadowBlur = 0;
      // Back arm tucked low
      ctx.fillStyle = palette.skin;
      ctx.fillRect(-14, -26, 6, 8);
      // Head ducked under the punch
      ctx.fillStyle = palette.cowl;
      ctx.beginPath();
      ctx.arc(-2, -36, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = palette.skin;
      ctx.fillRect(-6, -40, 10, 5);
      ctx.fillStyle = palette.armor;
      ctx.fillRect(-7, -36, 11, 7);
      ctx.fillStyle = palette.eyes;
      ctx.fillRect(-1, -39, 3, 2);

      ctx.restore();
      return;
    }

    // --- MK DEFENSE STANCE: braced legs, crossed arms, guard shield ---
    if (isBlocking) {
      // Braced legs
      ctx.fillStyle = palette.pants;
      ctx.fillRect(-13, -16, 9, 16);
      ctx.fillRect(4, -16, 9, 16);
      ctx.fillStyle = palette.cowl;
      ctx.fillRect(-14, -4, 11, 4);
      ctx.fillRect(3, -4, 11, 4);
      // Torso
      ctx.fillStyle = palette.cowl;
      ctx.fillRect(-10, -32, 20, 18);
      ctx.fillStyle = palette.armor;
      ctx.fillRect(-10, -32, 20, 5);
      // Crossed guard arms
      ctx.fillStyle = palette.skin;
      ctx.fillRect(-12, -28, 24, 5);
      ctx.fillRect(-12, -22, 24, 5);
      ctx.fillStyle = palette.armor;
      ctx.fillRect(-4, -29, 8, 12);
      // Head steady behind guard
      ctx.fillStyle = palette.cowl;
      ctx.beginPath();
      ctx.arc(0, -38, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = palette.skin;
      ctx.fillRect(-4, -42, 10, 5);
      ctx.fillStyle = palette.armor;
      ctx.fillRect(-5, -38, 11, 7);
      ctx.fillStyle = palette.eyes;
      ctx.fillRect(1, -41, 3, 2);
      // Guard shield arc
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.9)';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#60a5fa';
      ctx.beginPath();
      ctx.arc(2, -20, 25, -Math.PI * 0.72, Math.PI * 0.22);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.restore();
      return;
    }

    // ============ MK2 RIG: digitized arcade fighter, heavy ink + shading ============
    const isMoving = Math.abs(player.vx) > 0.5;
    const bounce = isGrounded && !isMoving ? Math.sin(Date.now() / 180) * 1.5 : 0;
    const legSwing = isMoving && isGrounded ? Math.sin(walkCycle * 0.4) * 6 : 0;
    const armSwing = isMoving && isGrounded ? Math.sin(walkCycle * 0.4 + Math.PI) * 5 : 0;

    const w = 32;
    const h = 48;
    const topY = -h + bounce;
    const INK = '#050508';

    // Crouch idle: squash the whole rig toward the feet (stays planted)
    if (isCrouching && !isAttacking) {
      ctx.scale(1, 0.66);
    }

    // Fighter aura
    ctx.fillStyle = palette.aura;
    ctx.beginPath();
    ctx.ellipse(0, topY + 24, 19, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 1, 15, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const outline = (x: number, y: number, ww: number, hh: number) => {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x, y, ww, hh);
    };

    // ---- LEGS: baggy MK pants, wrapped shins, heavy boots ----
    // Back leg
    ctx.fillStyle = palette.pants;
    ctx.fillRect(-12, topY + 29, 9, 15 + (isMoving ? legSwing * 0.6 : 0));
    outline(-12, topY + 29, 9, 15 + (isMoving ? legSwing * 0.6 : 0));
    // Front leg
    ctx.fillStyle = palette.pants;
    ctx.fillRect(3, topY + 29, 9, 15 - (isMoving ? legSwing * 0.6 : 0));
    outline(3, topY + 29, 9, 15 - (isMoving ? legSwing * 0.6 : 0));
    // Knee shading
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(-12, topY + 34, 9, 3);
    ctx.fillRect(3, topY + 34, 9, 3);
    // Shin wraps
    ctx.fillStyle = palette.armor;
    ctx.fillRect(-12, topY + 38, 9, 6);
    ctx.fillRect(3, topY + 38, 9, 6);
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(-12, topY + 41, 9, 2);
    ctx.fillRect(3, topY + 41, 2, 2);
    ctx.fillRect(8, topY + 41, 4, 2);
    // Heavy boots + shine
    ctx.fillStyle = palette.cowl;
    ctx.fillRect(-13, topY + 44, 11, 4);
    ctx.fillRect(2, topY + 44, 11, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(-13, topY + 44, 11, 1);
    ctx.fillRect(2, topY + 44, 11, 1);

    // ---- TORSO: bare MK chest, muscle shading, vest panels ----
    // Chest base
    ctx.fillStyle = palette.skin;
    ctx.fillRect(-10, topY + 15, 20, 15);
    outline(-10, topY + 15, 20, 15);
    // Pec shading
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(-9, topY + 19, 8, 2);
    ctx.fillRect(1, topY + 19, 8, 2);
    // Abs
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(-4, topY + 23, 8, 1.6);
    ctx.fillRect(-4, topY + 26, 8, 1.6);
    // Chest highlight
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(-9, topY + 16, 4, 12);
    // Vest side panels (fighter color)
    ctx.fillStyle = palette.armor;
    ctx.fillRect(-10, topY + 15, 4, 15);
    ctx.fillRect(6, topY + 15, 4, 15);
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(-10, topY + 15, 1.6, 15);
    ctx.fillRect(8.4, topY + 15, 1.6, 15);
    // Sash belt + knot
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(-10, topY + 28, 20, 4);
    ctx.fillStyle = INK;
    ctx.fillRect(-10, topY + 28, 20, 1);
    ctx.fillStyle = palette.armor;
    ctx.fillRect(6, topY + 30, 6, 5);

    // ---- ARMS ----
    const drawFist = (x: number, y: number, s: number) => {
      ctx.fillStyle = palette.skin;
      ctx.fillRect(x, y, s, s);
      outline(x, y, s, s);
    };
    if (isAttacking) {
      if (attackType === 'uppercut') {
        // MK rising uppercut: rear fist launched past the head
        ctx.fillStyle = palette.skin;
        ctx.fillRect(3, topY - 4, 8, 20);
        outline(3, topY - 4, 8, 20);
        ctx.fillStyle = palette.armor;
        ctx.fillRect(2, topY - 10, 10, 7);
        drawFist(1, topY - 17, 11);
        // Back arm chambered low
        ctx.fillStyle = palette.cowl;
        ctx.fillRect(-13, topY + 20, 7, 9);
        drawFist(-13, topY + 27, 7);
      } else {
        // Straight punch / specials: lead arm extended
        ctx.fillStyle = palette.skin;
        ctx.fillRect(2, topY + 16, 15, 7);
        outline(2, topY + 16, 15, 7);
        ctx.fillStyle = palette.armor;
        ctx.fillRect(9, topY + 15, 9, 9);
        drawFist(17, topY + 14, 9);
        // Rear guard fist
        ctx.fillStyle = palette.cowl;
        ctx.fillRect(-13, topY + 18, 6, 8);
        drawFist(-13, topY + 16, 7);
      }
    } else if (isDashing) {
      // Sprint: arms swept back
      ctx.fillStyle = palette.armor;
      ctx.fillRect(-14, topY + 14, 7, 14);
      ctx.fillRect(5, topY + 15, 13, 6);
      drawFist(-15, topY + 24, 7);
      drawFist(16, topY + 14, 7);
    } else {
      // MK guard stance (+ run swing)
      // Rear arm
      ctx.fillStyle = palette.skin;
      ctx.fillRect(-13, topY + 18 + (isMoving ? -armSwing * 0.4 : 0), 6, 9);
      ctx.fillStyle = palette.armor;
      ctx.fillRect(-13, topY + 21 + (isMoving ? -armSwing * 0.4 : 0), 6, 5);
      drawFist(-13, topY + 16 + (isMoving ? -armSwing * 0.4 : 0), 6);
      // Lead guard fist high
      ctx.fillStyle = palette.cowl;
      ctx.fillRect(4, topY + 17 + (isMoving ? armSwing * 0.4 : 0), 6, 8);
      ctx.fillStyle = palette.armor;
      ctx.fillRect(5, topY + 14 + (isMoving ? armSwing * 0.4 : 0), 8, 6);
      drawFist(9, topY + 9 + (isMoving ? armSwing * 0.4 : 0), 7);
    }

    // Baraka: Tarkatan blades on BOTH forearms, always out
    if (character === 'baraka') {
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      const blade = (bx: number, by: number, dir: number) => {
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + dir * 16, by - 5);
        ctx.lineTo(bx + dir * 13, by + 1);
        ctx.lineTo(bx + dir * 16, by + 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      };
      blade(10, topY + 16, 1);
      blade(-11, topY + 20, -1);
    }
    // Jax: full metal arms
    if (character === 'jax') {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-13, topY + 16, 7, 13);
      ctx.fillRect(4, topY + 15, 8, 10);
      ctx.fillStyle = '#475569';
      ctx.fillRect(-13, topY + 20, 7, 2);
      ctx.fillRect(4, topY + 19, 8, 2);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(-12, topY + 16, 2, 13);
    }

    // ---- HEAD: hood, masculine jaw, brow, fighter eyes ----
    // Hood mass
    ctx.fillStyle = palette.cowl;
    ctx.beginPath();
    ctx.arc(0, topY + 7, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // Jaw (wide, masculine)
    ctx.fillStyle = palette.skin;
    ctx.fillRect(-6, topY + 4, 13, 8);
    outline(-6, topY + 4, 13, 8);
    // Heavy brow shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(-6, topY + 4, 13, 2.4);
    // Mask band
    ctx.fillStyle = palette.armor;
    ctx.fillRect(-6, topY + 9, 13, 5);
    ctx.fillStyle = palette.armorDark;
    ctx.fillRect(-6, topY + 12.5, 13, 1.5);

    // Eyes per fighter
    const eyeWhite = (x: number, y: number, ww: number, glow?: string) => {
      if (glow) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = glow;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, ww, 2.4);
      ctx.shadowBlur = 0;
    };
    if (character === 'baraka') {
      // Burning red slits + Tarkatan fangs (pure menace, no softness)
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ef4444';
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(0, topY + 5.5, 7, 2.4);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-4, topY + 12, 3, 4);
      ctx.fillRect(5, topY + 12, 3, 4);
      // Head spikes
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-3, topY - 5, 3, 5);
      ctx.fillRect(3, topY - 5, 3, 5);
    } else if (character === 'shangtsung') {
      // Sickly green sorcerer eyes + long dark beard
      eyeWhite(0, topY + 5.5, 7, '#4ade80');
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(1, topY + 5.5, 2, 2.4);
      ctx.fillRect(4, topY + 5.5, 2, 2.4);
      ctx.fillStyle = '#1c0f2e';
      ctx.fillRect(-3, topY + 14, 9, 9);
      ctx.fillStyle = 'rgba(74,222,128,0.5)';
      ctx.fillRect(-1, topY + 16, 2, 5);
      ctx.fillRect(3, topY + 16, 2, 5);
    } else if (character === 'reptile') {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(0, topY + 5.5, 7, 2.4);
      ctx.fillStyle = '#052e16';
      ctx.fillRect(3, topY + 5.5, 1.4, 2.4);
    } else if (character === 'noob') {
      eyeWhite(0, topY + 5.5, 8, '#ffffff');
    } else if (character === 'raiden') {
      eyeWhite(0, topY + 5.5, 7, '#38bdf8');
    } else if (character === 'kitana' || character === 'sonya') {
      eyeWhite(0, topY + 5.5, 6);
      ctx.fillStyle = INK;
      ctx.fillRect(3, topY + 5.5, 1.4, 2.4);
    } else {
      eyeWhite(0, topY + 5.5, 6);
    }

    // Headgear per fighter
    if (character === 'raiden') {
      // Iconic conical straw hat
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(0, topY - 9);
      ctx.lineTo(19, topY + 3);
      ctx.lineTo(-19, topY + 3);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-16, topY + 1, 32, 1.6);
    } else if (character === 'kunglao') {
      // Wide bladed hat (abu el tagiyeh!) with steel rim
      ctx.fillStyle = '#1a1408';
      ctx.beginPath();
      ctx.ellipse(0, topY - 2, 17, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(0, topY - 4, 6, Math.PI, 0);
      ctx.fill();
    } else if (character === 'liukang') {
      // Shaolin headband, tails flying
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-10, topY - 1, 20, 3.4);
      ctx.fillRect(-16, topY, 6, 2.4);
      ctx.fillRect(-18, topY + 2, 4, 8);
    } else if (character === 'johnnycage') {
      // Hollywood shades
      ctx.fillStyle = '#052e16';
      ctx.fillRect(-5, topY + 5, 13, 4);
      ctx.fillStyle = 'rgba(74,222,128,0.7)';
      ctx.fillRect(-4, topY + 5.6, 4, 2);
      ctx.fillRect(2, topY + 5.6, 4, 2);
    } else if (character === 'sonya') {
      // High ponytail
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-13, topY - 6, 5, 12);
      ctx.fillRect(-15, topY + 4, 9, 3);
    } else if (character === 'kitana') {
      // Steel fan folded at hip
      ctx.strokeStyle = '#bfdbfe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-11, topY + 26, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#60a5fa';
      for (let f = 0; f < 5; f++) {
        const fa = (f / 5) * Math.PI * 2 + Date.now() / 900;
        ctx.fillRect(-11 + Math.cos(fa) * 4, topY + 26 + Math.sin(fa) * 4, 2, 2);
      }
    } else if (character === 'jax') {
      // Military beret
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.ellipse(1, topY - 2, 9, 4, -0.15, 0, Math.PI * 2);
      ctx.fill();
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

  // Draw Baraka's spinning Blade Spark
  // Draw Baraka's spinning Blade Spark
  static drawBlade(ctx: CanvasRenderingContext2D, proj: Projectile) {
    ctx.save();
    ctx.translate(proj.x + proj.width / 2, proj.y + proj.height / 2);
    ctx.rotate(Date.now() / 80);
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#f43f5e';
    ctx.fillStyle = '#e2e8f0';
    for (let b = 0; b < 3; b++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(14, -3);
      ctx.lineTo(14, 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#881337';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw Liu Kang's Dragon Fireball
  static drawDragonFire(ctx: CanvasRenderingContext2D, proj: Projectile) {
    ctx.save();
    const cx = proj.x + proj.width / 2;
    const cy = proj.y + proj.height / 2;
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#f97316';
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(cx, cy, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(cx + (proj.facing === 'right' ? 3 : -3), cy, 4, 0, Math.PI * 2);
    ctx.fill();
    // Dragon whiskers
    ctx.strokeStyle = '#fdba74';
    ctx.lineWidth = 2;
    const wob = Math.sin(Date.now() / 60) * 3;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 4);
    ctx.quadraticCurveTo(cx - 18, cy - 8 + wob, cx - 24, cy - 4 + wob);
    ctx.moveTo(cx - 10, cy + 4);
    ctx.quadraticCurveTo(cx - 18, cy + 8 - wob, cx - 24, cy + 4 - wob);
    ctx.stroke();
    ctx.restore();
  }

  // Draw Kitana's spinning Steel Fan
  static drawFan(ctx: CanvasRenderingContext2D, proj: Projectile) {
    ctx.save();
    ctx.translate(proj.x + proj.width / 2, proj.y + proj.height / 2);
    ctx.rotate(Date.now() / 70);
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#60a5fa';
    ctx.fillStyle = '#bfdbfe';
    for (let b = 0; b < 5; b++) {
      ctx.rotate((Math.PI * 2) / 5);
      ctx.fillRect(0, -12, 5, 12);
    }
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dbeafe';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw Shang Tsung's Soul Skull
  static drawSkull(ctx: CanvasRenderingContext2D, proj: Projectile) {
    ctx.save();
    const cx = proj.x + proj.width / 2;
    const cy = proj.y + proj.height / 2;
    const bob = Math.sin(Date.now() / 100) * 2;
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#a855f7';
    // Skull dome
    ctx.fillStyle = '#e9d5ff';
    ctx.beginPath();
    ctx.arc(cx, cy - 2 + bob, 10, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - 10, cy - 2 + bob, 20, 8);
    // Jaw teeth
    ctx.fillStyle = '#a855f7';
    for (let t = -2; t <= 2; t++) {
      ctx.fillRect(cx + t * 4 - 1, cy + 6 + bob, 2, 4);
    }
    // Burning green eyes
    ctx.fillStyle = '#4ade80';
    ctx.shadowColor = '#4ade80';
    ctx.fillRect(cx - 7, cy - 4 + bob, 5, 5);
    ctx.fillRect(cx + 2, cy - 4 + bob, 5, 5);
    ctx.restore();
  }

  // Draw Kung Lao's spinning Razor Hat
  static drawHat(ctx: CanvasRenderingContext2D, proj: Projectile) {
    ctx.save();
    ctx.translate(proj.x + proj.width / 2, proj.y + proj.height / 2);
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#eab308';
    // Wide hat disc
    ctx.fillStyle = '#1a1408';
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Spinning steel rim
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.lineDashOffset = -Date.now() / 20;
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, -2, 5, Math.PI, 0);
    ctx.fill();
    ctx.restore();
  }

  // Draw Johnny Cage's green Forceball Bolt
  static drawBolt(ctx: CanvasRenderingContext2D, proj: Projectile) {
    ctx.save();
    const cx = proj.x + proj.width / 2;
    const cy = proj.y + proj.height / 2;
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#4ade80';
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.arc(cx, cy, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(cx, cy, 7 + Math.sin(Date.now() / 70) * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d1fae5';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw Jax's ground Shockwave
  static drawWave(ctx: CanvasRenderingContext2D, proj: Projectile) {
    ctx.save();
    const cx = proj.x + proj.width / 2;
    const cy = proj.y + proj.height / 2;
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#94a3b8';
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = i === 1 ? '#e2e8f0' : '#64748b';
      ctx.lineWidth = 4 - i;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 8 + i * 7 + Math.sin(Date.now() / 60) * 2, 10 - i * 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Draw Sonya's Energy Ring
  static drawRing(ctx: CanvasRenderingContext2D, proj: Projectile) {
    ctx.save();
    ctx.translate(proj.x + proj.width / 2, proj.y + proj.height / 2);
    ctx.rotate(Date.now() / 90);
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#f472b6';
    ctx.strokeStyle = '#f9a8d4';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#fce7f3';
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 9, Math.sin(a) * 9, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Draw Hammer Bro's spinning hammer
  static drawHammer(ctx: CanvasRenderingContext2D, proj: Projectile) {
    ctx.save();
    ctx.translate(proj.x + proj.width / 2, proj.y + proj.height / 2);
    ctx.rotate(Date.now() / 60);
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#9ca3af';
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-2, -11, 4, 22);
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(-9, -14, 18, 7);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-9, -14, 18, 7);
    ctx.restore();
  }

  // Draw Enemies: Goomba, Koopa, Piranha, Bowser, Rival Ninja, Kombatants, Fighter Bosses
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
      // --- KOOPA TROOPA (or hiding shell!) ---
      const walk = Math.sin(Date.now() / 150) * 3;

      if (enemy.inShell) {
        // Hiding shell: white-rimmed dome, eyes peeking (SAFE to touch!)
        const shk = enemy.shellVx ? Math.sin(Date.now() / 60) * 1.5 : 0;
        ctx.fillStyle = isFrozen ? '#00b4d8' : '#16a34a';
        ctx.beginPath();
        ctx.arc(shk, topY + 20, 13, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = isFrozen ? '#90e0ef' : '#bbf7d0';
        ctx.fillRect(-13 + shk, topY + 20, 26, 4);
        // Peeking eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(-5 + shk, topY + 14, 3, 3);
        ctx.fillRect(2 + shk, topY + 14, 3, 3);
        if (enemy.shellVx) {
          // Speed lines on a racing shell
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-20, topY + 16);
          ctx.lineTo(-30, topY + 16);
          ctx.moveTo(-20, topY + 24);
          ctx.lineTo(-30, topY + 24);
          ctx.stroke();
        }
      } else {

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
      }

    } else if (type === 'hammerbro') {
      // --- HAMMER BRO: armored turtle bruiser with helmet + hammer ---
      const hWalk = Math.sin(Date.now() / 140 + enemy.id) * 2;
      // Stompy boots
      ctx.fillStyle = isFrozen ? '#0077b6' : '#7c2d12';
      ctx.fillRect(-11 + hWalk, topY + 30, 9, 12);
      ctx.fillRect(2 - hWalk, topY + 30, 9, 12);
      // Bulky green body
      ctx.fillStyle = isFrozen ? '#00b4d8' : '#15803d';
      ctx.beginPath();
      ctx.arc(0, topY + 22, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Belly plate
      ctx.fillStyle = isFrozen ? '#90e0ef' : '#fef3c7';
      ctx.fillRect(-8, topY + 22, 16, 10);
      // Helmet
      ctx.fillStyle = isFrozen ? '#0077b6' : '#1f2937';
      ctx.beginPath();
      ctx.arc(0, topY + 8, 10, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-10, topY + 8, 20, 3);
      // Angry eyes under brim
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, topY + 10, 5, 4);
      ctx.fillRect(1, topY + 10, 5, 4);
      ctx.fillStyle = '#000000';
      ctx.fillRect(-4, topY + 11, 2, 2);
      ctx.fillRect(3, topY + 11, 2, 2);
      // Raised hammer (wind-up when attacking)
      const raise = enemy.attackTimer && enemy.attackTimer > 1.6 ? -8 : 0;
      ctx.fillStyle = '#78350f';
      ctx.fillRect(10, topY + 8 + raise, 4, 12);
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(4, topY + 4 + raise, 16, 7);
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(4, topY + 4 + raise, 16, 7);

    } else if (type === 'spiny') {
      // --- SPINY: spiked ball of pain — NEVER stomp it! ---
      const sRoll = Math.sin(Date.now() / 120 + enemy.id) * 2;
      // Red scuttle feet
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-9 + sRoll, topY + 26, 7, 6);
      ctx.fillRect(2 - sRoll, topY + 26, 7, 6);
      // Dark spiked dome
      ctx.fillStyle = isFrozen ? '#00b4d8' : '#1f2937';
      ctx.beginPath();
      ctx.arc(0, topY + 20, 13, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-13, topY + 20, 26, 8);
      // White spikes
      ctx.fillStyle = '#f8fafc';
      const spikes: [number, number][] = [[-9, 8], [-4, 4], [1, 4], [6, 8], [-6, 14], [4, 14]];
      spikes.forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(sx - 3, topY + sy + 4);
        ctx.lineTo(sx, topY + sy - 3);
        ctx.lineTo(sx + 3, topY + sy + 4);
        ctx.closePath();
        ctx.fill();
      });
      // Mean red eyes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-6, topY + 20, 4, 3);
      ctx.fillRect(2, topY + 20, 4, 3);

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
      const rivalId = enemy.fighterKind || 'scorpion';
      const palettes: Record<string, { armor: string; armorDark: string; cowl: string; pants: string; eyes: string }> = {
        subzero: { armor: '#00d2ff', armorDark: '#0088cc', cowl: '#0a0a14', pants: '#121218', eyes: '#ffffff' },
        scorpion: { armor: '#ffb300', armorDark: '#c68400', cowl: '#14110b', pants: '#181510', eyes: '#ffffff' },
        noob: { armor: '#18181b', armorDark: '#09090b', cowl: '#030305', pants: '#050508', eyes: '#ffffff' },
        raiden: { armor: '#38bdf8', armorDark: '#0284c7', cowl: '#f8fafc', pants: '#e2e8f0', eyes: '#38bdf8' },
        reptile: { armor: '#22c55e', armorDark: '#15803d', cowl: '#052e16', pants: '#0f172a', eyes: '#facc15' },
        kunglao: { armor: '#eab308', armorDark: '#713f12', cowl: '#1a1408', pants: '#1a1408', eyes: '#ffffff' },
        johnnycage: { armor: '#4ade80', armorDark: '#14532d', cowl: '#0b1410', pants: '#0b1410', eyes: '#bbf7d0' },
        jax: { armor: '#94a3b8', armorDark: '#334155', cowl: '#10151f', pants: '#10151f', eyes: '#f8fafc' },
        sonya: { armor: '#f472b6', armorDark: '#831843', cowl: '#160a12', pants: '#160a12', eyes: '#fce7f3' },
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
    } else if (type === 'kombatant' || type === 'fighter_boss') {
      // --- MK FIGHTER GRUNT / FIGHTER BOSS (Baraka, Liu Kang, Kitana, Shang Tsung...) ---
      const kindId = enemy.fighterKind || 'baraka';
      const isFBoss = type === 'fighter_boss';
      const kPalettes: Record<string, { armor: string; armorDark: string; cowl: string; pants: string; eyes: string }> = {
        subzero: { armor: '#00d2ff', armorDark: '#0088cc', cowl: '#0a0a14', pants: '#121218', eyes: '#ffffff' },
        scorpion: { armor: '#ffb300', armorDark: '#c68400', cowl: '#14110b', pants: '#181510', eyes: '#ffffff' },
        noob: { armor: '#18181b', armorDark: '#09090b', cowl: '#030305', pants: '#050508', eyes: '#ffffff' },
        raiden: { armor: '#38bdf8', armorDark: '#0284c7', cowl: '#f8fafc', pants: '#e2e8f0', eyes: '#38bdf8' },
        reptile: { armor: '#22c55e', armorDark: '#15803d', cowl: '#052e16', pants: '#0f172a', eyes: '#facc15' },
        baraka: { armor: '#f43f5e', armorDark: '#881337', cowl: '#1c0a0a', pants: '#1c0a0a', eyes: '#fecdd3' },
        liukang: { armor: '#f97316', armorDark: '#7c2d12', cowl: '#171207', pants: '#171207', eyes: '#ffffff' },
        kitana: { armor: '#60a5fa', armorDark: '#1e3a8a', cowl: '#0a1030', pants: '#0a1030', eyes: '#dbeafe' },
        shangtsung: { armor: '#a855f7', armorDark: '#3b0764', cowl: '#12081f', pants: '#12081f', eyes: '#4ade80' },
        kunglao: { armor: '#eab308', armorDark: '#713f12', cowl: '#1a1408', pants: '#1a1408', eyes: '#ffffff' },
        johnnycage: { armor: '#4ade80', armorDark: '#14532d', cowl: '#0b1410', pants: '#0b1410', eyes: '#bbf7d0' },
        jax: { armor: '#94a3b8', armorDark: '#334155', cowl: '#10151f', pants: '#10151f', eyes: '#f8fafc' },
        sonya: { armor: '#f472b6', armorDark: '#831843', cowl: '#160a12', pants: '#160a12', eyes: '#fce7f3' },
      };
      const kpal = kPalettes[kindId] || kPalettes.baraka;
      if (isFBoss) ctx.scale(1.25, 1.25);

      const kBreath = Math.sin(Date.now() / 160 + enemy.id) * 1.5;

      // Boss aura
      if (isFBoss) {
        ctx.shadowBlur = 16;
        ctx.shadowColor = enemy.health < enemy.maxHealth / 2 ? '#ef4444' : kpal.armor;
      } else {
        ctx.shadowBlur = isFrozen ? 14 : 8;
        ctx.shadowColor = isFrozen ? '#00f0ff' : kpal.armor;
      }

      // Legs / Boots
      ctx.fillStyle = isFrozen ? '#0077b6' : kpal.pants;
      ctx.fillRect(-10, topY + 30, 8, 18);
      ctx.fillRect(2, topY + 30, 8, 18);

      // Torso
      ctx.fillStyle = isFrozen ? '#90e0ef' : kpal.cowl;
      ctx.fillRect(-10, topY + 12 + kBreath, 20, 20);

      // V armor
      ctx.fillStyle = isFrozen ? '#00b4d8' : kpal.armor;
      ctx.beginPath();
      ctx.moveTo(-10, topY + 12 + kBreath);
      ctx.lineTo(-4, topY + 28 + kBreath);
      ctx.lineTo(4, topY + 28 + kBreath);
      ctx.lineTo(10, topY + 12 + kBreath);
      ctx.closePath();
      ctx.fill();

      // Belt
      ctx.fillStyle = kpal.armorDark;
      ctx.fillRect(-10, topY + 28 + kBreath, 20, 4);

      // Arms: melee strike / guard / block shimmer
      if (enemy.attackTimer && enemy.attackTimer > 0) {
        ctx.fillStyle = kpal.cowl;
        ctx.fillRect(2, topY + 16, 18, 6);
        ctx.fillStyle = kpal.armor;
        ctx.fillRect(12, topY + 15, 8, 8);
        ctx.fillStyle = kpal.eyes;
        ctx.fillRect(20, topY + 16, 4, 6);
      } else {
        ctx.fillStyle = kpal.cowl;
        ctx.fillRect(4, topY + 16, 6, 8);
        ctx.fillStyle = kpal.armor;
        ctx.fillRect(6, topY + 14, 7, 6);
      }
      if (enemy.enemyBlockTimer && enemy.enemyBlockTimer > 0) {
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.95)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(4, topY + 24, 16, -Math.PI * 0.6, Math.PI * 0.4);
        ctx.stroke();
      }

      // Baraka blades on fists
      if (kindId === 'baraka') {
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(8, topY + 16);
        ctx.lineTo(20, topY + 10);
        ctx.lineTo(18, topY + 16);
        ctx.lineTo(20, topY + 22);
        ctx.closePath();
        ctx.fill();
      }

      // Head
      ctx.fillStyle = isFrozen ? '#0077b6' : kpal.cowl;
      ctx.beginPath();
      ctx.arc(0, topY + 8 + kBreath, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isFrozen ? '#00b4d8' : kpal.armor;
      ctx.fillRect(-5, topY + 8 + kBreath, 11, 7);
      ctx.fillStyle = kpal.eyes;
      ctx.fillRect(1, topY + 5 + kBreath, 3, 2);

      // Boss crown
      if (isFBoss) {
        ctx.fillStyle = '#fbbf24';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#fbbf24';
        for (let s = -1; s <= 1; s++) {
          ctx.fillRect(s * 7 - 2, topY - 8 + kBreath, 4, 7);
        }
        ctx.fillRect(-11, topY - 2 + kBreath, 22, 3);
        ctx.shadowBlur = 0;
      }

      // HP bar + name
      const kBarW = isFBoss ? 56 : 36;
      const kBarH = 5;
      const kPct = Math.max(0, enemy.health / enemy.maxHealth);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-kBarW / 2 - 1, topY - 16, kBarW + 2, kBarH + 2);
      ctx.fillStyle = kPct > 0.4 ? kpal.armor : '#ef4444';
      ctx.fillRect(-kBarW / 2, topY - 15, kBarW * kPct, kBarH);
      ctx.shadowBlur = 0;
      ctx.fillStyle = isFBoss ? '#fbbf24' : '#f8fafc';
      ctx.font = isFBoss ? 'bold 9px monospace' : 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText((isFBoss ? '★ ' : '') + kindId.toUpperCase(), 0, topY - 18);
      if (isFBoss) ctx.scale(0.8, 0.8);
    }

    // DIZZY STARS: swirling above any dizzied enemy head
    if (enemy.isDizzy) {
      const t = Date.now() / 150;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#fbbf24';
      ctx.fillStyle = '#fde047';
      for (let s = 0; s < 3; s++) {
        const a = t + (s * Math.PI * 2) / 3;
        const sx = Math.cos(a) * 13;
        const sy = -height - 14 + Math.sin(a) * 4;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(a);
        ctx.fillRect(-3.5, -1, 7, 2);
        ctx.fillRect(-1, -3.5, 2, 7);
        ctx.restore();
      }
      ctx.shadowBlur = 0;
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

      // Warp pipe cue: glowing ▼ arrow beckoning the player to dive in
      if (block.isWarp) {
        const pulse = Math.sin(Date.now() / 300) * 3;
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#4ade80';
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 17px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('▼', block.x + block.width / 2, y - 8 + pulse);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.strokeRect(block.x - 1, y - 1, block.width + 2, block.height + 2);
        ctx.restore();
      }
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
