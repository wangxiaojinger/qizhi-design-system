export type PaginationToken = number | "prev" | "next";

export const clampPage = (page: number, totalPages: number) => Math.min(Math.max(Math.trunc(page) || 1, 1), totalPages);

export const getPaginationTokens = (current: number, totalPages: number): PaginationToken[] => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "next", totalPages];
  if (current >= totalPages - 3) return [1, "prev", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "prev", current - 1, current, current + 1, "next", totalPages];
};
