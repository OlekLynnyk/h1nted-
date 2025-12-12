'use client';

export function useInjectPrompt() {
  return (text: string) => {
    const textarea = document.querySelector(
      'textarea[placeholder="Ask anything"]'
    ) as HTMLTextAreaElement | null;

    if (!textarea) {
      console.warn('Prompt injection failed: input not found');
      return;
    }

    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    setter ? setter.call(textarea, text) : (textarea.value = text);

    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    const len = textarea.value.length;
    const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
    try {
      if (!isIOS) textarea.setSelectionRange(len, len);
    } catch {}

    const lineHeight = 24;
    const maxHeight = lineHeight * 8;

    const resize = () => {
      textarea.style.height = 'auto';
      const h = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
      textarea.style.height = `${h}px`;
    };

    resize();
    const r1 = requestAnimationFrame(resize);
    const r2 = requestAnimationFrame(resize);

    setTimeout(resize, 0);
  };
}
