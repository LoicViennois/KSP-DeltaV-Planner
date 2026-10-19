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
import { floatingIconButton } from '../lib/styles';
import DvMap from './DvMap';
import { StarSky } from './Starfield';

const MAP_RATIO = 4 / 3;
const MAX_SCALE = 8;
const ZOOM_STEP = 1.6;
const PAN_STEP = 80;

/**
 * The offset of the map along one axis of the viewport, whose end is covered
 * by `covered` pixels of buttons or steps: centred when the map fits in what
 * is left, kept from leaving a gap otherwise, and free to move its end out
 * from under what covers it.
 */
function place(
  offset: number,
  length: number,
  viewport: number,
  covered: number,
): number {
  const room = viewport - covered;
  return length <= room
    ? Math.min((viewport - length) / 2, room - length)
    : Math.min(0, Math.max(room - length, offset));
}

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
  /** Zooms back on the trip whenever it changes. */
  resets?: number;
  /** Shown over the bottom of the map, which keeps the trip clear of it. */
  footer?: ReactNode;
  /** Buttons shown above the zoom buttons. */
  controls?: ReactNode;
}

/** The Δv map, zoomed and panned with touch, mouse wheel, buttons or arrow keys. */
export function MapViewer({
  trip,
  step,
  focus,
  resets,
  footer,
  controls,
}: MapViewerProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  // The height the footer takes, kept clear when fitting.
  const [footerHeight, setFooterHeight] = useState(0);
  // The width the buttons take on the right, from the edge.
  const [railWidth, setRailWidth] = useState(0);
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 });
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
      return {
        scale: s,
        x: place(x, w, size.width, railWidth),
        y: place(y, h, size.height, footerHeight),
      };
    },
    [baseWidth, baseHeight, size, footerHeight, railWidth],
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

    // Bounds of the elements on the map at scale 1, from the scale shown,
    // which is not the one set yet while gliding.
    const origin = content.getBoundingClientRect();
    const shown = origin.width / baseWidth;
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
      x: (left - origin.left) / shown,
      y: (top - origin.top) / shown,
      width: (right - left) / shown,
      height: (bottom - top) / shown,
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
    const railObserver = new ResizeObserver(([entry]) => {
      const rail = entry?.target;
      if (rail instanceof HTMLElement && rail.offsetParent) {
        setRailWidth(rail.offsetParent.clientWidth - rail.offsetLeft);
      }
    });
    if (railRef.current) {
      railObserver.observe(railRef.current);
    }
    return () => {
      observer.disconnect();
      footerObserver.disconnect();
      railObserver.disconnect();
    };
  }, []);

  // Zoom on the trip, or the selected step, once laid out, when it changes
  // and when reset.
  useEffect(() => {
    // The highlight classes are applied by the map in the same commit.
    const frame = requestAnimationFrame(fit);
    return () => cancelAnimationFrame(frame);
  }, [fit, resets]);

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

      <div
        ref={railRef}
        className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 flex flex-col items-end gap-2"
      >
        {controls && (
          <div className="mb-2 flex flex-col items-end gap-3">{controls}</div>
        )}
        <button
          type="button"
          onClick={() =>
            zoomAt(ZOOM_STEP, size.width / 2, size.height / 2, true)
          }
          disabled={view.scale >= MAX_SCALE}
          aria-label="Zoom in"
          className={floatingIconButton}
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
          className={floatingIconButton}
        >
          <Minus aria-hidden className="size-5" />
        </button>
        <button
          type="button"
          onClick={fit}
          aria-label="Zoom to the trip"
          className={floatingIconButton}
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
