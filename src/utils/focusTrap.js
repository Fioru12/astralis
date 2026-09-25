const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function trapFocus(container, event) {
  if (event.key !== 'Tab' || !container) return;
  const items = [...container.querySelectorAll(FOCUSABLE)].filter((element) => {
    const style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
