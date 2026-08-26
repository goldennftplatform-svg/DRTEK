// Tiny DOM builder so we don't pull in a framework for the phone/HUD overlay.
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<Omit<HTMLElementTagNameMap[K], 'style'>> & { style?: string } = {},
  ...kids: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  const { style, ...rest } = props as Record<string, unknown> & { style?: string };
  Object.assign(e, rest);
  if (style) e.style.cssText = style;
  for (const k of kids) e.append(typeof k === 'string' ? document.createTextNode(k) : k);
  return e;
}

export const BRICK_SVG = `
<svg viewBox="0 0 100 140" width="100%">
  <rect x="30" y="6" width="40" height="40" rx="6" fill="#F7C948"/>
  <circle cx="42" cy="24" r="4" fill="#0b1220"/>
  <circle cx="58" cy="24" r="4" fill="#0b1220"/>
  <path d="M40 40 Q50 46 60 40" stroke="#0b1220" stroke-width="3" fill="none" stroke-linecap="round"/>
  <rect x="26" y="50" width="48" height="44" rx="8" fill="#1e3a5f"/>
  <rect x="26" y="50" width="48" height="20" rx="8" fill="#22d3ee33"/>
  <rect x="34" y="96" width="14" height="34" rx="4" fill="#F7C948"/>
  <rect x="52" y="96" width="14" height="34" rx="4" fill="#F7C948"/>
</svg>`;
