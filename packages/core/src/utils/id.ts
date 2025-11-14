// src/utils/id.ts
export function genId(): string {
  // 1) Современный стандарт
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof globalThis?.crypto?.randomUUID === 'function') {
    // @ts-ignore
    return globalThis.crypto.randomUUID();
  }

  // 2) Браузеры без randomUUID, но с getRandomValues
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const c = globalThis?.crypto;
  if (c && typeof c.getRandomValues === 'function') {
    const buf = new Uint8Array(16);
    c.getRandomValues(buf);
    // RFC4122 v4
    buf[6] = (buf[6] & 0x0f) | 0x40;
    buf[8] = (buf[8] & 0x3f) | 0x80;
    const hex = Array.from(buf, (b) => b.toString(16).padStart(2, '0'));
    return (
      hex.slice(0, 4).join('') +
      '-' +
      hex.slice(4, 6).join('') +
      '-' +
      hex.slice(6, 8).join('') +
      '-' +
      hex.slice(8, 10).join('') +
      '-' +
      hex.slice(10, 16).join('')
    );
  }

  // 3) Фолбэк (не криптостойкий, но стабильный)
  const rnd = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .slice(-4);
  return `${Date.now().toString(16)}-${rnd()}-${rnd()}-${rnd()}-${rnd()}${rnd()}${rnd()}`;
}
