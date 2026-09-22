/**
 * ACCEL 7.0 logo with the gear spinning inside the "C".
 *
 * Two layers, matching the main ACCEL site: a base image with the gear removed,
 * and the gear itself absolutely positioned over it. The percentages below are
 * the gear's position within the 1024x281 artwork, so they hold at any size.
 *
 * The white glow is a drop-shadow stack on the wrapper rather than on the image,
 * so it traces the logo's actual silhouette instead of its bounding box. It
 * reads on a dark surface, which is why the header behind it is a deep gradient.
 */

const GEAR_POSITION = {
  left: '25.85%',
  top: '61.92%',
  width: '11.8%',
  aspectRatio: '1 / 1',
  transform: 'translate(-50%, -50%)',
}

export default function AnimatedLogo({ className = 'h-9', glow = true, spin = true }) {
  return (
    <span
      className={[
        'relative inline-block shrink-0 transition-transform duration-300 will-change-transform',
        'group-hover:scale-105',
        glow ? 'logo-glow' : '',
      ].join(' ')}
    >
      <img
        src="/accel-logo-base.png"
        alt="ACCEL 7.0"
        className={`${className} w-auto object-contain`}
        width={1024}
        height={281}
      />

      <span className="pointer-events-none absolute" style={GEAR_POSITION}>
        <img
          src="/accel-gear.png"
          alt=""
          aria-hidden="true"
          className={`h-full w-full object-contain ${spin ? 'animate-gear-spin' : ''}`}
          width={280}
          height={280}
        />
      </span>
    </span>
  )
}
