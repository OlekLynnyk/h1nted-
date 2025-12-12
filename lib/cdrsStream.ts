// lib/cdrsStream.ts

export type CdrsRequestBody = {
  profileId: string;
  savedMessageIds: string[];
  prompt?: string;
  userLanguage?: string;
  images?: string[];
};

export type CdrsRunOptions = {
  onChunk?: (text: string) => void;
  signal?: AbortSignal;
  endpoint?: string;
};

export async function runCdrs(body: CdrsRequestBody, opts: CdrsRunOptions = {}): Promise<string> {
  const { onChunk, signal, endpoint = '/api/ai/grok-3' } = opts;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, mode: 'cdrs' }),
    signal,
  });

  const ct = res.headers.get('content-type') || '';

  if (ct.includes('text/event-stream') && res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      for (const line of chunk.split('\n')) {
        const t = line.trim();
        if (!t || t.startsWith('event:')) continue;
        if (t.startsWith('data:')) {
          const payload = t.slice(5).trim();
          try {
            const raw = JSON.parse(payload);
            if (typeof raw === 'string') {
              acc += raw;
              onChunk?.(raw);
            } else {
              const s = String(raw ?? '');
              acc += s;
              onChunk?.(s);
            }
          } catch {
            acc += payload;
            onChunk?.(payload);
          }
        }
      }
    }

    return acc;
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `CDRs failed with ${res.status}`);
  }

  const json = await res.json().catch(() => null as any);
  const result = json?.result;
  if (typeof result === 'string') return result;

  throw new Error('Empty result');
}

export default runCdrs;
