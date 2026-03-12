import { useState, useCallback, useRef, useEffect } from "react";

interface ResizableSplitLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultLeftWidth?: number; // percentage, default 40
  minLeftWidth?: number; // pixels, default 280
  minRightWidth?: number; // pixels, default 320
}

const DIVIDER_WIDTH = 6;

export function ResizableSplitLayout({
  left,
  right,
  defaultLeftWidth = 40,
  minLeftWidth = 280,
  minRightWidth = 320,
}: ResizableSplitLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidthPercent, setLeftWidthPercent] = useState(defaultLeftWidth);
  const isDragging = useRef(false);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const rafId = useRef<number | null>(null);

  const clampLeftWidth = useCallback(
    (percent: number): number => {
      const container = containerRef.current;
      if (!container) return percent;

      const containerWidth = container.offsetWidth;
      const availableWidth = containerWidth - DIVIDER_WIDTH;

      const minLeftPercent = (minLeftWidth / availableWidth) * 100;
      const maxLeftPercent = ((availableWidth - minRightWidth) / availableWidth) * 100;

      return Math.min(Math.max(percent, minLeftPercent), maxLeftPercent);
    },
    [minLeftWidth, minRightWidth]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      setIsDraggingState(true);
    },
    []
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const availableWidth = rect.width - DIVIDER_WIDTH;
        const offsetX = e.clientX - rect.left;
        const rawPercent = (offsetX / availableWidth) * 100;
        setLeftWidthPercent(clampLeftWidth(rawPercent));
      });
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setIsDraggingState(false);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [clampLeftWidth]);

  const clampedPercent = clampLeftWidth(leftWidthPercent);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full overflow-hidden"
      style={{ userSelect: isDraggingState ? "none" : "auto" }}
    >
      {/* Left panel */}
      <div
        className="h-full overflow-auto"
        style={{ width: `calc(${clampedPercent}% - ${DIVIDER_WIDTH / 2}px)` }}
      >
        {left}
      </div>

      {/* Drag handle */}
      <div
        role="separator"
        aria-orientation="vertical"
        onMouseDown={handleMouseDown}
        className={`flex-shrink-0 cursor-col-resize transition-colors duration-150 ${
          isDraggingState
            ? "bg-slate-500"
            : "bg-slate-700 hover:bg-slate-600"
        }`}
        style={{ width: `${DIVIDER_WIDTH}px` }}
      />

      {/* Right panel */}
      <div
        className="h-full overflow-auto"
        style={{
          width: `calc(${100 - clampedPercent}% - ${DIVIDER_WIDTH / 2}px)`,
        }}
      >
        {right}
      </div>
    </div>
  );
}
