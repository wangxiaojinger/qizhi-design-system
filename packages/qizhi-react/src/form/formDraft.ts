import { useEffect, useRef, useState } from "react";
import type { FormDraftController, FormDraftOptions, FormDraftRecord, FormDraftStatus, FormNamePath, FormValues } from "./Form.types";
import { getFormStore } from "./formStore";

type DraftState<TValues extends FormValues, TMetadata> = {
  status: FormDraftStatus;
  record: FormDraftRecord<TValues, TMetadata> | null;
  conflict: FormDraftRecord<TValues, TMetadata> | null;
  error: unknown;
};

const initialState = <TValues extends FormValues, TMetadata>(): DraftState<TValues, TMetadata> => ({
  status: "idle",
  record: null,
  conflict: null,
  error: null,
});

export function useDraft<TValues extends FormValues = FormValues, TMetadata = unknown>({
  form,
  draftKey,
  version,
  storage,
  selectValues,
  getMetadata,
  onRestoreMetadata,
  autoSave = false,
}: FormDraftOptions<TValues, TMetadata>): FormDraftController<TValues, TMetadata> {
  const [state, setState] = useState<DraftState<TValues, TMetadata>>(initialState);
  const stateRef = useRef(state);
  const requestRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressAutoSaveRef = useRef(false);
  const saveRef = useRef<(force?: boolean) => Promise<boolean>>(async () => false);

  const updateState = (next: DraftState<TValues, TMetadata>) => {
    stateRef.current = next;
    setState(next);
  };
  const patchState = (next: Partial<DraftState<TValues, TMetadata>>) => {
    updateState({ ...stateRef.current, ...next });
  };
  const clearTimer = () => {
    if (timerRef.current === null) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
  };
  const classify = (draftRecord: FormDraftRecord<TValues, TMetadata>): FormDraftStatus => {
    if (draftRecord.version !== version) return "version-mismatch";
    if (draftRecord.expiresAt && Date.parse(draftRecord.expiresAt) <= Date.now()) return "expired";
    return "ready";
  };
  const restoreRecord = (draftRecord: FormDraftRecord<TValues, TMetadata>) => {
    if (classify(draftRecord) !== "ready") return false;
    suppressAutoSaveRef.current = true;
    try {
      form.setFieldsValue(draftRecord.values);
      getFormStore(form)?.markValuesClean(draftRecord.values);
      onRestoreMetadata?.(draftRecord.metadata);
    } finally {
      suppressAutoSaveRef.current = false;
    }
    return true;
  };

  const load = async () => {
    const request = ++requestRef.current;
    patchState({ status: "loading", error: null });
    try {
      const loaded = await storage.load(draftKey);
      if (request !== requestRef.current) return loaded;
      if (!loaded) {
        updateState(initialState());
        return null;
      }
      updateState({ status: classify(loaded), record: loaded, conflict: null, error: null });
      return loaded;
    } catch (error) {
      if (request === requestRef.current) patchState({ status: "error", error });
      return null;
    }
  };

  const save = async (force = false) => {
    const request = ++requestRef.current;
    clearTimer();
    patchState({ status: "saving", error: null });
    const values = selectValues(form.getFieldsValue());
    const expectedRevision = force
      ? stateRef.current.conflict?.revision ?? stateRef.current.record?.revision
      : stateRef.current.record?.revision;
    try {
      const result = await storage.save({
        key: draftKey,
        version,
        values,
        metadata: getMetadata?.(),
        expectedRevision,
        force: force || undefined,
      });
      if (request !== requestRef.current) return false;
      if (result.status === "conflict") {
        patchState({ status: "conflict", conflict: result.remote, error: null });
        return false;
      }
      updateState({ status: "saved", record: result.record, conflict: null, error: null });
      getFormStore(form)?.markValuesClean(result.record.values);
      return true;
    } catch (error) {
      if (request === requestRef.current) patchState({ status: "error", error });
      return false;
    }
  };
  saveRef.current = save;

  const restore = () => {
    const current = stateRef.current;
    if (current.status !== "ready" || !current.record) return false;
    return restoreRecord(current.record);
  };
  const remove = async () => {
    const request = ++requestRef.current;
    clearTimer();
    try {
      await storage.remove(draftKey, stateRef.current.record?.revision);
      if (request !== requestRef.current) return false;
      updateState(initialState());
      return true;
    } catch (error) {
      if (request === requestRef.current) patchState({ status: "error", error });
      return false;
    }
  };
  const useRemote = () => {
    const remote = stateRef.current.conflict;
    if (!remote || !restoreRecord(remote)) return false;
    updateState({ status: "ready", record: remote, conflict: null, error: null });
    return true;
  };
  const overwrite = () => stateRef.current.conflict ? save(true) : Promise.resolve(false);

  useEffect(() => {
    clearTimer();
    requestRef.current += 1;
    updateState(initialState());
    return clearTimer;
  }, [draftKey, storage, version]);

  useEffect(() => {
    if (autoSave === false) return undefined;
    const store = getFormStore(form);
    if (!store) return undefined;
    const unsubscribe = store.subscribe(() => {
      if (suppressAutoSaveRef.current) return;
      clearTimer();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        void saveRef.current(false);
      }, Math.max(0, autoSave.debounceMs));
    });
    return () => {
      unsubscribe();
      clearTimer();
    };
  }, [autoSave === false ? false : autoSave.debounceMs, draftKey, form]);

  useEffect(() => () => {
    requestRef.current += 1;
    clearTimer();
  }, []);

  return { ...state, load, restore, save: () => save(false), remove, useRemote, overwrite };
}
