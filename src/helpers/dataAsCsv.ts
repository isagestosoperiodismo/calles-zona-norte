// src/lib/dataAsCsv.ts
export function dataAsCsv(array: Record<string, unknown>[]): string {
  const headers = Object.keys(array[0]);

  const rows = array.map((obj) =>
    headers.map((h) => `"${String(obj[h] ?? "")}"`).join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}
