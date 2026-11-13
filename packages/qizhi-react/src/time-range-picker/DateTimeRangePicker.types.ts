import type { ReactNode } from "react";

export interface TimeRange {
  /** Inclusive start in Unix milliseconds. */
  readonly start: number;
  /** Exclusive end in Unix milliseconds. */
  readonly end: number;
}

export interface TimeRangeShortcut {
  readonly key: string;
  readonly label: ReactNode;
  readonly resolve: (now: number) => TimeRange;
}

export interface DateTimeRangePickerProps {
  readonly value: TimeRange;
  readonly onChange: (range: TimeRange) => void;
  /** Reports the applied shortcut key so a caller can resolve it again on refresh. */
  readonly onShortcutSelect?: (key: string, range: TimeRange) => void;
  readonly shortcuts?: readonly TimeRangeShortcut[];
  /** IANA time zone. Defaults to UTC. */
  readonly timeZone?: string;
  /** Return an error message to keep the draft open. */
  readonly validate?: (range: TimeRange) => string | undefined;
  /** Disallow dates and times after the current second. */
  readonly disableFuture?: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
}
