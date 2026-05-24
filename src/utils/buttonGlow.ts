export function glowButton(el: HTMLElement | null | undefined, durationMs = 500) {
  if (!el) return;
  el.classList.remove('button-glow');
  void el.offsetWidth;
  el.classList.add('button-glow');
  setTimeout(() => el.classList.remove('button-glow'), durationMs);
}
