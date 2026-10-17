import { Focus, Minus, Plus } from 'lucide-react';
import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type WheelEvent,
} from 'react';

import type { MapHighlight } from '../lib/map-highlight';
import type { Step, Trip } from '../lib/planner';
import DvMap from './DvMap';
import { StarSky } from './Starfield';

const MAP_RATIO = 4 / 3;
const MAX_SCALE = 8;
const ZOOM_STEP = 1.6;
const PAN_STEP = 80;

interface View {
  scale: number;
  x: number;
  y: number;
}

interface MapViewerProps {
  trip: Trip;
  step: Step | null;
  /** Map element ids to zoom on, refitted whenever they change. */
  focus: MapHighlight;
  /** Shown over the bottom of the map, which keeps the trip clear of it. */
  footer?: ReactNode;
}

const controlButton =
  'grid size-11 cursor-pointer place-items-center rounded-xl bg-surface/90 text-ink shadow-lg ring-1 ring-line backdrop-blur transition hover:bg-surface active:scale-90 disabled:cursor-not-allowed disabled:opacity-50';

/** The Δv map, zoomed and panned with touch, mouse wheel, buttons or arrow keys. */
export function MapViewer({ trip, step, focus, footer }: MapViewerProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  // The height the footer takes, kept clear when fitting.
  const [footerHeight, setFooterHeight] = useState(0);
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 });
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);
  // Glide to fitted views, but follow fingers and the wheel at once.
  const [animate, setAnimate] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const lastTap = useRef(0);

  // The map at scale 1 fits the viewport.
  const baseWidth = Math.min(size.width, size.height * MAP_RATIO);
  const baseHeight = baseWidth / MAP_RATIO;

  const clamp = useCallback(
    ({ scale, x, y }: View): View => {
      const s = Math.min(Math.max(scale, 1), MAX_SCALE);
      const w = baseWidth * s;
      const h = baseHeight * s;
      const cx =
        w <= size.width
          ? (size.width - w) / 2
          : Math.min(0, Math.max(size.width - w, x));
      const cy =
        h <= size.height
          ? (size.height - h) / 2
          : Math.min(0, Math.max(size.height - h, y));
      return { scale: s, x: cx, y: cy };
    },
    [baseWidth, baseHeight, size],
  );

  /** Zooms by a factor, keeping the point (px, py) of the viewport still. */
  const zoomAt = useCallback(
    (factor: number, px: number, py: number, glide = false) => {
      setAnimate(glide);
      setView((current) => {
        const scale = Math.min(Math.max(current.scale * factor, 1), MAX_SCALE);
        const ratio = scale / current.scale;
        return clamp({
          scale,
          x: px - (px - current.x) * ratio,
          y: py - (py - current.y) * ratio,
        });
      });
    },
    [clamp],
  );

  const fit = useCallback(() => {
    const content = contentRef.current;
    const ids = focus.step ?? focus.path;
    if (!content || !baseWidth) {
      return;
    }
    setAnimate(true);
    const elements = (ids ?? [])
      .map((id) => content.querySelector(`[id="${id}"]`))
      .filter((el) => el != null);
    if (elements.length === 0) {
      setView(clamp({ scale: 1, x: 0, y: 0 }));
      return;
    }

    // Bounds of the elements on the map at scale 1.
    const current = viewRef.current;
    const origin = content.getBoundingClientRect();
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      left = Math.min(left, rect.left);
      top = Math.min(top, rect.top);
      right = Math.max(right, rect.right);
      bottom = Math.max(bottom, rect.bottom);
    }
    const box = {
      x: (left - origin.left) / current.scale,
      y: (top - origin.top) / current.scale,
      width: (right - left) / current.scale,
      height: (bottom - top) / current.scale,
    };
    // Small elements, like a landing, keep some of the map around them.
    const minSide = baseWidth / 3;
    const height = Math.max(size.height - footerHeight, size.height / 2);
    const scale =
      0.85 *
      Math.min(
        size.width / Math.max(box.width, minSide),
        height / Math.max(box.height, minSide),
      );
    const s = Math.min(Math.max(scale, 1), MAX_SCALE);
    setView(
      clamp({
        scale: s,
        x: size.width / 2 - (box.x + box.width / 2) * s,
        y: height / 2 - (box.y + box.height / 2) * s,
      }),
    );
  }, [focus, baseWidth, size, footerHeight, clamp]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });
    observer.observe(viewport);
    const footerObserver = new ResizeObserver(([entry]) => {
      if (entry) {
        setFooterHeight(entry.borderBoxSize[0]?.blockSize ?? 0);
      }
    });
    if (footerRef.current) {
      footerObserver.observe(footerRef.current);
    }
    return () => {
      observer.disconnect();
      footerObserver.disconnect();
    };
  }, []);

  // Zoom on the trip, or the selected step, once laid out and when it changes.
  useEffect(() => {
    // The highlight classes are applied by the map in the same commit.
    const frame = requestAnimationFrame(fit);
    return () => cancelAnimationFrame(frame);
  }, [fit]);

  function local(event: { clientX: number; clientY: number }) {
    const rect = viewportRef.current?.getBoundingClientRect();
    return {
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0),
    };
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, local(event));
    setAnimate(false);

    // Double tap (or double click) zooms in where it lands.
    if (pointers.current.size === 1) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        const { x, y } = local(event);
        zoomAt(ZOOM_STEP * ZOOM_STEP, x, y, true);
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) {
      return;
    }
    const next = local(event);
    const others = [...pointers.current.entries()].filter(
      ([id]) => id !== event.pointerId,
    );
    pointers.current.set(event.pointerId, next);

    const other = others[0]?.[1];
    if (other) {
      // Pinch: zoom by the change of distance, around the fingers' midpoint.
      const before = Math.hypot(previous.x - other.x, previous.y - other.y);
      const after = Math.hypot(next.x - other.x, next.y - other.y);
      if (before > 0) {
        zoomAt(after / before, (next.x + other.x) / 2, (next.y + other.y) / 2);
      }
      return;
    }

    setView((current) =>
      clamp({
        ...current,
        x: current.x + next.x - previous.x,
        y: current.y + next.y - previous.y,
      }),
    );
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
  }

  function onWheel(event: WheelEvent<HTMLDivElement>) {
    const { x, y } = local(event);
    zoomAt(Math.exp(-event.deltaY * 0.002), x, y);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const pans: Record<string, [number, number]> = {
      ArrowLeft: [PAN_STEP, 0],
      ArrowRight: [-PAN_STEP, 0],
      ArrowUp: [0, PAN_STEP],
      ArrowDown: [0, -PAN_STEP],
    };
    const pan = pans[event.key];
    if (pan) {
      event.preventDefault();
      setAnimate(true);
      setView((current) =>
        clamp({ ...current, x: current.x + pan[0], y: current.y + pan[1] }),
      );
    } else if (event.key === '+' || event.key === '=') {
      zoomAt(ZOOM_STEP, size.width / 2, size.height / 2, true);
    } else if (event.key === '-') {
      zoomAt(1 / ZOOM_STEP, size.width / 2, size.height / 2, true);
    }
  }

  return (
    <div className="relative h-full overflow-hidden bg-bg">
      <StarSky className="absolute inset-0" />
      <div
        ref={viewportRef}
        tabIndex={0}
        role="group"
        aria-roledescription="zoomable map"
        aria-label="Δv map, use the arrow keys to pan and + or - to zoom"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
        className="absolute inset-0 cursor-grab touch-none select-none focus-visible:-outline-offset-4 active:cursor-grabbing"
      >
        <div
          ref={contentRef}
          data-testid="map-content"
          data-scale={view.scale.toFixed(2)}
          style={{
            width: baseWidth,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transformOrigin: '0 0',
            transition: animate ? 'transform 350ms ease-out' : undefined,
          }}
        >
          <DvMap trip={trip} step={step} className="pointer-events-none" />
        </div>
      </div>

      <div className="absolute top-3 right-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={() =>
            zoomAt(ZOOM_STEP, size.width / 2, size.height / 2, true)
          }
          disabled={view.scale >= MAX_SCALE}
          aria-label="Zoom in"
          className={controlButton}
        >
          <Plus aria-hidden className="size-5" />
        </button>
        <button
          type="button"
          onClick={() =>
            zoomAt(1 / ZOOM_STEP, size.width / 2, size.height / 2, true)
          }
          disabled={view.scale <= 1}
          aria-label="Zoom out"
          className={controlButton}
        >
          <Minus aria-hidden className="size-5" />
        </button>
        <button
          type="button"
          onClick={fit}
          aria-label="Zoom to the trip"
          className={controlButton}
        >
          <Focus aria-hidden className="size-5" />
        </button>
      </div>

      <div
        ref={footerRef}
        className="pointer-events-none absolute inset-x-0 bottom-0"
      >
        {footer}
      </div>
    </div>
  );
}
