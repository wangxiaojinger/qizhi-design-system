import type { ReactNode } from "react";

export interface ObjectSelectorVersion {
  value: string;
  description?: ReactNode;
}

export interface ObjectSelectorItem {
  value: string;
  name: string;
  description: string;
  meta?: ReactNode;
  project: string;
  icon?: ReactNode;
  versions: readonly ObjectSelectorVersion[];
}

export interface ObjectSelectorProject {
  label: string;
  value: string;
}

export interface ObjectSelectorValue {
  object: string;
  version: string;
}

export interface ObjectSelectorProps {
  label: string;
  items: readonly ObjectSelectorItem[];
  projects: readonly ObjectSelectorProject[];
  value?: ObjectSelectorValue;
  defaultValue?: ObjectSelectorValue;
  placeholder?: string;
  searchPlaceholder?: string;
  onChange?: (value: ObjectSelectorValue, item: ObjectSelectorItem) => void;
  className?: string;
}
