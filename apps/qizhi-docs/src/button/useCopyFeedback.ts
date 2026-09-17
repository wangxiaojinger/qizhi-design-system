import { useCallback, useState } from "react";

export function useCopyFeedback(source: string) {
  const [message, setMessage] = useState("");
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(source);
      setMessage("复制成功");
    } catch {
      setMessage("复制失败");
    }
  }, [source]);
  return { copy, message };
}
