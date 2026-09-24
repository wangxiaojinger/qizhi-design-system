import type { FormNamePath, FormNameSegment, FormValues } from "./Form.types";

export const normalizeNamePath = (name: FormNamePath): FormNameSegment[] => typeof name === "string" ? [name] : [...name];

export const encodeNamePath = (name: FormNamePath) => normalizeNamePath(name)
  .map((part) => `${typeof part === "number" ? "n" : "s"}${String(part).length}:${String(part)}`)
  .join("|");

export const getValueAtPath = (source: unknown, name: FormNamePath): unknown => normalizeNamePath(name)
  .reduce<unknown>((current, part) => current == null ? undefined : (current as Record<FormNameSegment, unknown>)[part], source);

export const setValueAtPath = (source: unknown, name: FormNamePath, value: unknown): FormValues => {
  const path = normalizeNamePath(name);
  const write = (current: unknown, index: number): unknown => {
    if (index === path.length) return value;
    const part = path[index];
    const nextPart = path[index + 1];
    const container = Array.isArray(current) ? [...current] : current && typeof current === "object" ? { ...(current as object) } : typeof part === "number" ? [] : {};
    (container as Record<FormNameSegment, unknown>)[part] = write((current as Record<FormNameSegment, unknown> | null)?.[part], index + 1);
    if (typeof nextPart === "number" && !Array.isArray((container as Record<FormNameSegment, unknown>)[part])) (container as Record<FormNameSegment, unknown>)[part] = [];
    return container;
  };
  return write(source, 0) as FormValues;
};

export const unsetValueAtPath = (source: unknown, name: FormNamePath): FormValues => {
  const path = normalizeNamePath(name);
  const remove = (current: unknown, index: number): unknown => {
    if (current == null || typeof current !== "object") return current;
    const part = path[index];
    const clone: unknown[] | Record<string, unknown> = Array.isArray(current) ? [...current] : { ...(current as object) };
    if (index === path.length - 1) {
      if (Array.isArray(clone) && typeof part === "number") clone.splice(part, 1);
      else delete (clone as Record<string, unknown>)[String(part)];
      return clone;
    }
    (clone as Record<FormNameSegment, unknown>)[part] = remove((current as Record<FormNameSegment, unknown>)[part], index + 1);
    return clone;
  };
  return remove(source, 0) as FormValues;
};

export const buildValueAtPath = (name: FormNamePath, value: unknown) => setValueAtPath({}, name, value);

export const isSameOrAncestorPath = (ancestor: FormNamePath, candidate: FormNamePath) => {
  const left = normalizeNamePath(ancestor);
  const right = normalizeNamePath(candidate);
  return left.length <= right.length && left.every((part, index) => Object.is(part, right[index]));
};
