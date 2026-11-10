import { createElement, useEffect, useImperativeHandle, useRef, type Ref } from 'react';

export interface MapSurfaceHandle {
  post: (json: string) => void;
}

interface Props {
  html: string;
  onMessage: (raw: string) => void;
  ref?: Ref<MapSurfaceHandle>;
}

/** Web: Leaflet runs inside a sandboxed iframe (same HTML as on mobile). */
export function MapSurface({ html, onMessage, ref }: Props) {
  const frame = useRef<HTMLIFrameElement | null>(null);
  const handler = useRef(onMessage);
  handler.current = onMessage;

  useImperativeHandle(ref, () => ({
    post: (json: string) => frame.current?.contentWindow?.postMessage(json, '*'),
  }));

  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (frame.current && e.source === frame.current.contentWindow) handler.current(e.data);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, []);

  return createElement('iframe', {
    ref: frame,
    srcDoc: html,
    title: 'Karte',
    sandbox: 'allow-scripts allow-popups',
    style: { border: 0, width: '100%', height: '100%', display: 'block', background: '#0b0b14' },
  });
}
