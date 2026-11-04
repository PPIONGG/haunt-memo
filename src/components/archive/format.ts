const thaiDate = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeZone: "Asia/Bangkok" });

/** Formats an ISO `YYYY-MM-DD` date in Thai, e.g. "10 มิ.ย. 2566". */
export function formatThaiDate(isoDate: string): string {
  return thaiDate.format(new Date(`${isoDate}T00:00:00+07:00`));
}
