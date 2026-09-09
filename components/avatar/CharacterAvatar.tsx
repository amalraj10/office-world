import { CharacterConfig } from '@/types';

interface CharacterAvatarProps {
  config: CharacterConfig;
  size?: number;
  variant?: 'face' | 'full';
  className?: string;
  ring?: boolean;
}

function HairShape({ style, color }: { style: CharacterConfig['hairStyle']; color: string }) {
  switch (style) {
    case 'bald':
      return null;
    case 'buzz':
      return <path d="M22 38 A28 28 0 0 1 78 38 L78 30 A28 26 0 0 0 22 30 Z" fill={color} />;
    case 'short-crop':
      return <path d="M18 40 A32 30 0 0 1 82 40 L82 26 Q50 8 18 26 Z" fill={color} />;
    case 'spiky':
      return (
        <path
          d="M18 36 L24 14 L32 30 L40 10 L50 28 L60 10 L68 30 L76 14 L82 36 A32 28 0 0 1 18 36 Z"
          fill={color}
        />
      );
    case 'long-curly':
      return (
        <g fill={color}>
          <circle cx="50" cy="13" r="16" />
          <circle cx="26" cy="20" r="13" />
          <circle cx="74" cy="20" r="13" />
          <circle cx="18" cy="42" r="11" />
          <circle cx="82" cy="42" r="11" />
        </g>
      );
    case 'bun':
      return (
        <g fill={color}>
          <path d="M18 40 A32 30 0 0 1 82 40 L82 28 Q50 6 18 28 Z" />
          <circle cx="50" cy="6" r="11" />
        </g>
      );
    case 'bob-cut':
      return (
        <path
          d="M16 44 Q14 12 50 8 Q86 12 84 44 L84 54 Q78 46 74 54 L74 30 Q50 20 26 30 L26 54 Q22 46 16 54 Z"
          fill={color}
        />
      );
    case 'mohawk':
      return (
        <g fill={color}>
          <rect x="42" y="2" width="16" height="34" rx="7" />
          <path d="M18 40 A32 30 0 0 1 82 40 L82 34 Q50 26 18 34 Z" opacity="0.85" />
        </g>
      );
    case 'ponytail':
      return (
        <g fill={color}>
          <path d="M18 40 A32 30 0 0 1 82 40 L82 26 Q50 8 18 26 Z" />
          <path d="M80 30 Q98 34 92 60 Q88 50 78 44 Z" />
        </g>
      );
    default:
      return null;
  }
}

function AccessoryShape({ type }: { type: CharacterConfig['accessory'] }) {
  switch (type) {
    case 'glasses':
      return (
        <g stroke="#1E293B" strokeWidth="2.5" fill="none">
          <circle cx="36" cy="52" r="10" />
          <circle cx="64" cy="52" r="10" />
          <line x1="46" y1="52" x2="54" y2="52" />
          <line x1="26" y1="50" x2="20" y2="46" />
          <line x1="74" y1="50" x2="80" y2="46" />
        </g>
      );
    case 'headphones':
      return (
        <g fill="none" stroke="#1E293B" strokeWidth="5">
          <path d="M18 42 A32 30 0 0 1 82 42" />
          <rect x="12" y="40" width="10" height="20" rx="4" fill="#1E293B" stroke="none" />
          <rect x="78" y="40" width="10" height="20" rx="4" fill="#1E293B" stroke="none" />
        </g>
      );
    case 'beanie':
      return (
        <g>
          <path d="M16 38 A34 30 0 0 1 84 38 L84 30 A34 30 0 0 0 16 30 Z" fill="#DC2626" />
          <rect x="14" y="30" width="72" height="10" rx="5" fill="#B91C1C" />
        </g>
      );
    case 'cap':
      return (
        <g>
          <path d="M18 36 A32 28 0 0 1 82 36 L82 26 Q50 10 18 26 Z" fill="#2563EB" />
          <path d="M70 32 Q92 32 92 40 Q80 40 68 36 Z" fill="#1D4ED8" />
          <circle cx="50" cy="14" r="3" fill="#1D4ED8" />
        </g>
      );
    default:
      return null;
  }
}

function OutfitShape({
  style,
  color,
}: {
  style: CharacterConfig['outfitStyle'];
  color: string;
}) {
  switch (style) {
    case 'hoodie':
      return (
        <g>
          <path d="M14 40 Q50 24 86 40 L92 96 L8 96 Z" fill={color} />
          <path d="M32 40 Q50 52 68 40 L64 30 Q50 40 36 30 Z" fill="rgba(0,0,0,0.25)" />
        </g>
      );
    case 'blazer':
      return (
        <g>
          <path d="M16 42 Q50 26 84 42 L90 96 L10 96 Z" fill={color} />
          <path d="M42 42 L50 62 L58 42 L52 40 L48 40 Z" fill="#F8FAFC" />
          <line x1="42" y1="42" x2="34" y2="90" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
          <line x1="58" y1="42" x2="66" y2="90" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
        </g>
      );
    case 'dress':
      return (
        <path d="M22 40 Q50 26 78 40 L96 96 L4 96 Z" fill={color} />
      );
    case 'shirt':
      return (
        <g>
          <path d="M18 42 Q50 28 82 42 L86 96 L14 96 Z" fill={color} />
          <line x1="50" y1="40" x2="50" y2="96" stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
        </g>
      );
    case 'tshirt':
    default:
      return <path d="M16 42 Q50 30 84 42 L88 96 L12 96 Z" fill={color} />;
  }
}

export default function CharacterAvatar({
  config,
  size = 40,
  variant = 'face',
  className = '',
  ring = false,
}: CharacterAvatarProps) {
  const viewBox = variant === 'face' ? '0 0 100 80' : '0 0 100 100';
  const hasBeard = config.hairStyle === 'short-crop' || config.hairStyle === 'buzz';

  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden bg-slate-800 border border-slate-700/60 ${
        ring ? 'ring-2 ring-white/80' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox={viewBox} width="100%" height="100%" preserveAspectRatio="xMidYMin slice">
        {variant === 'full' && <OutfitShape style={config.outfitStyle} color={config.outfitColor} />}
        {/* Neck */}
        <rect x="42" y="44" width="16" height="14" fill={config.skinTone} />
        {/* Ears */}
        <circle cx="24" cy="38" r="6" fill={config.skinTone} />
        <circle cx="76" cy="38" r="6" fill={config.skinTone} />
        {/* Head */}
        <circle cx="50" cy="38" r="26" fill={config.skinTone} stroke="#0F172A" strokeWidth="2" />

        {/* Beard if applicable */}
        {hasBeard && (
          <g fill={config.hairColor}>
            <path d="M26 38 A24 24 0 0 0 74 38 A26 26 0 0 1 26 38 Z" />
            <rect x="40" y="46" width="20" height="5" rx="2.5" />
          </g>
        )}

        {/* Eyes (Big white + black pupil + sparkle) */}
        {/* Left eye */}
        <ellipse cx="38" cy="36" rx="6" ry="7" fill="#FFFFFF" />
        <circle cx="38" cy="36" r="3.5" fill="#0F172A" />
        <circle cx="40" cy="34" r="1.2" fill="#FFFFFF" />

        {/* Right eye */}
        <ellipse cx="62" cy="36" rx="6" ry="7" fill="#FFFFFF" />
        <circle cx="62" cy="36" r="3.5" fill="#0F172A" />
        <circle cx="64" cy="34" r="1.2" fill="#FFFFFF" />

        {/* Eyebrows */}
        <line x1="32" y1="26" x2="44" y2="26" stroke={config.hairColor} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="56" y1="26" x2="68" y2="26" stroke={config.hairColor} strokeWidth="2.5" strokeLinecap="round" />

        {/* Smile (if no beard) */}
        {!hasBeard && (
          <path d="M44 48 Q50 54 56 48" stroke="#7C2D12" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}

        {/* Hair */}
        <HairShape style={config.hairStyle} color={config.hairColor} />
        <AccessoryShape type={config.accessory} />
      </svg>
    </div>
  );
}
