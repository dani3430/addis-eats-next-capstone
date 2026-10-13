// CSV, done carefully. The escaping is the whole problem: one comma in one value shifts every column after it.

function cell(value) {
  let text = String(value ?? "");

  // A text value that starts with = + - or @ can run as a formula when the file is opened in a spreadsheet.
  // A leading apostrophe makes it plain text. Numbers are not affected.
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }

  // Quote anything containing a comma, a quotation mark or a newline, and double any quotation mark inside it.
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// columns: [{ header: "Order", value: (row) => row.id }, ...]
export function toCsv(columns, rows) {
  const lines = [
    columns.map((column) => cell(column.header)).join(","),
    ...rows.map((row) => columns.map((column) => cell(column.value(row))).join(",")),
  ];
  // CRLF line endings are the CSV standard. The leading BOM makes Excel read the file as UTF-8.
  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}