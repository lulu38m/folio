// French typography for text written in the page: narrow no-break space before ; ! ? and inside « »,
// no-break space before :. Use on strings, never on code: {fr("Où ? À Lyon : en télétravail.")}
export function fr(s: string): string {
  return s
    .replace(/\s+([;!?])/g, " $1")
    .replace(/([^\s\d])([;!?])(?=\s|$)/g, "$1 $2")
    .replace(/\s+:(?=\s|$)/g, " :")
    .replace(/«\s*/g, "« ")
    .replace(/\s*»/g, " »");
}
