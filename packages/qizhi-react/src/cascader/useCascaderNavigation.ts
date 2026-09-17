import { useState } from "react";
import type { NormalizedCascaderOption } from "./cascaderModel";

export function useCascaderNavigation(options: NormalizedCascaderOption[]) {
  const [active, setActive] = useState<NormalizedCascaderOption | undefined>();

  const move = (direction: 1 | -1) => {
    const enabled = options.filter((option) => !option.disabled);
    if (!enabled.length) return;
    const index = active ? enabled.findIndex((option) => option.id === active.id) : -1;
    setActive(enabled[(index + direction + enabled.length) % enabled.length]);
  };

  return { active, setActive, move };
}

