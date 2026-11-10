const day = 86_400_000;

function dateTimeFormatter(timeZone: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone, calendar: "iso8601", numberingSystem: "latn", hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return undefined;
  }
}

export function formatRangeDateTime(value: number, timeZone: string): string | undefined {
  const formatter = dateTimeFormatter(timeZone);
  if (!formatter || !Number.isFinite(new Date(value).getTime())) return undefined;
  return formatWith(value, formatter);
}

function formatWith(value: number, formatter: Intl.DateTimeFormat): string {
  const parts = Object.fromEntries(formatter.formatToParts(value).map(({ type, value }) => [type, value]));
  return `${parts.year.padStart(4, "0")}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

export function parseRangeDateTime(value: string, timeZone: string): number | undefined {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value)) return;
  const local = value.length === 16 ? value + ":00" : value;
  const civil = Date.parse(local + "Z");
  if (!Number.isFinite(civil) || new Date(civil).toISOString().slice(0, 19) !== local) return;

  const formatter = dateTimeFormatter(timeZone);
  if (!formatter) return;
  // Probe both sides of a potential offset transition. Round-trip each candidate
  // to reject DST gaps and distinguish the two occurrences of a repeated time.
  const candidates = new Set<number>();
  for (const probe of [civil - day, civil, civil + day]) {
    const offset = Date.parse(formatWith(probe, formatter) + "Z") - probe;
    const instant = civil - offset;
    if (formatWith(instant, formatter) === local) candidates.add(instant);
  }
  return candidates.size === 1 ? candidates.values().next().value : undefined;
}
