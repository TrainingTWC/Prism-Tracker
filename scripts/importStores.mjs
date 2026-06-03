// One-off CSV → JSONL converter for the stores master.
// Usage: node scripts/importStores.mjs "C:\\path\\to\\Master Base(Store List).csv"
import fs from "node:fs";
import path from "node:path";

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node scripts/importStores.mjs <csv-path>");
  process.exit(1);
}

const raw = fs.readFileSync(csvPath, "utf8");

// Tiny CSV parser that handles quoted fields with commas.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') inQ = false;
      else cell += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
      else if (c === "\r") { /* skip */ }
      else cell += c;
    }
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const rows = parseCSV(raw);
const header = rows[0].map((h) => h.trim());
const col = (name) => header.indexOf(name);

const idx = {
  storeCode: col("Store Code"),
  storeName: col("LS Store Name"),
  areaManager: col("Area Manager Name"),
  region: col("Region"),
  city: col("City"),
  storeFormat: col("Store Format"),
  menuType: col("Menu Type"),
  coffeeMachine: col("Coffee machines  Name"),
  merrychefType: col("Type of Merrychef"),
  status: col("Yet To Open/BAU"),
};

const out = [];
for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  const storeCode = (row[idx.storeCode] || "").trim();
  if (!storeCode || !/^S\d+/i.test(storeCode)) continue; // skip blanks/junk

  const statusVal = (row[idx.status] || "").trim().toUpperCase();
  // Skip stores marked as "Yet To Open" — only import BAU stores
  if (statusVal && !statusVal.startsWith("BAU")) continue;

  out.push({
    storeCode,
    storeName: (row[idx.storeName] || "").trim() || storeCode,
    areaManager: (row[idx.areaManager] || "").trim() || "Unassigned",
    region: (row[idx.region] || "").trim() || "Unknown",
    city: (row[idx.city] || "").trim() || "Unknown",
    storeFormat: (row[idx.storeFormat] || "").trim() || "Unknown",
    menuType: (row[idx.menuType] || "").trim() || "Unknown",
    coffeeMachine: (row[idx.coffeeMachine] || "").trim() || "Unknown",
    merrychefType: (row[idx.merrychefType] || "").trim() || "None",
    active: true,
  });
}

const outPath = path.join(process.cwd(), "scripts", "stores.jsonl");
fs.writeFileSync(outPath, out.map((o) => JSON.stringify(o)).join("\n") + "\n");
console.log(`Wrote ${out.length} stores to ${outPath}`);
