/**
 * Parse human-readable dates from the spreadsheet.
 * Handles formats like:
 *  - "9th October'25" → parsed as Oct 9, 2025
 *  - "5th January'26" → parsed as Jan 5, 2026
 *  - "25-05-2026" → parsed as May 25, 2026
 *  - "8th June'2026" → parsed as June 8, 2026
 */
export function parseTrialDate(dateStr: string): number | null {
  if (!dateStr || !dateStr.trim()) return null;

  const str = dateStr.trim();

  // Format: "9th October'25" or "9th October'2025" or "9th October 2025"
  const ordinalMonthMatch = str.match(
    /(\d+)(?:st|nd|rd|th)\s+(\w+)['\s]+(\d{2,4})/i
  );
  if (ordinalMonthMatch) {
    const day = parseInt(ordinalMonthMatch[1], 10);
    const monthName = ordinalMonthMatch[2];
    let year = parseInt(ordinalMonthMatch[3], 10);
    if (year < 100) year += 2000;

    const monthNum = parseMonthName(monthName);
    if (monthNum !== null) {
      const date = new Date(year, monthNum, day);
      return date.getTime();
    }
  }

  // Format: "25-05-2026" (DD-MM-YYYY)
  const dMYMatch = str.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (dMYMatch) {
    const day = parseInt(dMYMatch[1], 10);
    const month = parseInt(dMYMatch[2], 10) - 1;
    const year = parseInt(dMYMatch[3], 10);
    const date = new Date(year, month, day);
    return date.getTime();
  }

  return null;
}

function parseMonthName(name: string): number | null {
  const months: Record<string, number> = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };
  return months[name.toLowerCase()] ?? null;
}

/** Parse CSV text into 2D array. Simple implementation for the matrix format. */
export function parseCSV(csv: string): string[][] {
  const lines = csv.split(/\r?\n/);
  return lines
    .map((line) => {
      // Handle quoted fields and escaped quotes
      const fields: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === "," && !inQuotes) {
          fields.push(current.trim());
          current = "";
        } else {
          current += ch;
        }
      }
      fields.push(current.trim());
      return fields;
    })
    .filter((row) => row.some((cell) => cell.length > 0));
}

export interface ParsedImport {
  stores: Array<{
    storeCode: string;
    storeName: string;
    areaManager: string;
    region: string;
    city: string;
    storeFormat: string;
    menuType: string;
    coffeeMachine: string;
    merrychefType: string;
  }>;
  initiatives: Array<{
    name: string;
    type: "trial" | "launch" | "pilot" | "transition";
    plannedStart: number | null;
    plannedEnd: number | null;
    variants: string[];
    regions: string[];
  }>;
  rollouts: Array<{
    storeCode: string;
    initiativeName: string;
    participating: boolean;
    plannedStart?: number;
    plannedEnd?: number;
  }>;
  warnings: string[];
}

/**
 * Parse the 3-row matrix format from the CSV.
 * Row 1 (index 0): headers + initiative names (with multiline text in cells)
 * Row 2 (index 1): trial dates + metadata
 * Row 3+ (index 2+): store data + participation cells
 */
export function parseMatrix(csv: string): ParsedImport {
  const rows = parseCSV(csv);
  if (rows.length < 3) {
    return {
      stores: [],
      initiatives: [],
      rollouts: [],
      warnings: ["CSV must have at least 3 rows"],
    };
  }

  const headerRow = rows[0];
  const metaRow = rows[1];
  const dataRows = rows.slice(2);

  const warnings: string[] = [];

  // Column indices for store metadata (always the first 9 columns)
  const STORE_COLS = {
    code: 0,
    name: 1,
    areaManager: 2,
    region: 3,
    city: 4,
    format: 5,
    menuType: 6,
    coffeeMachine: 7,
    merrychef: 8,
  };

  // Initiative columns start at index 9
  const INITIATIVES_START = 9;

  // Parse initiatives from header + meta rows
  const initiatives: ParsedImport["initiatives"] = [];
  for (let i = INITIATIVES_START; i < headerRow.length; i++) {
    const initName = headerRow[i]?.trim();
    if (!initName) continue;

    const metaInfo = metaRow[i]?.trim() || "";

    // Determine type from header keywords
    let type: "trial" | "launch" | "pilot" | "transition" = "trial";
    if (
      headerRow[i]?.toLowerCase().includes("pilot") ||
      metaInfo.toLowerCase().includes("pilot")
    ) {
      type = "pilot";
    } else if (
      headerRow[i]?.toLowerCase().includes("launch") ||
      metaInfo.toLowerCase().includes("launch")
    ) {
      type = "launch";
    }

    // Parse dates from meta row
    const trialStartMatch = metaInfo.match(/trial\s+start\s+date:\s*([^,]*)/i);
    const trialEndMatch = metaInfo.match(/trial\s+end\s+date:\s*([^,]*)/i);
    const launchDateMatch = metaInfo.match(/launch\s+date:\s*([^(]*)/i);
    const endDateMatch = metaInfo.match(/end\s+date:\s*([^(]*)/i);

    let plannedStart = null;
    let plannedEnd = null;

    if (type === "trial") {
      if (trialStartMatch) plannedStart = parseTrialDate(trialStartMatch[1]);
      if (trialEndMatch) plannedEnd = parseTrialDate(trialEndMatch[1]);
    } else if (type === "launch" || type === "pilot") {
      if (launchDateMatch) plannedStart = parseTrialDate(launchDateMatch[1]);
      if (endDateMatch) plannedEnd = parseTrialDate(endDateMatch[1]);
    }

    // Extract variants (if multiline in cell, split by newlines)
    const variants = initName
      .split("\n")
      .filter((v) => v.length > 20 && !v.match(/^[A-Z][a-z]/))
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    // Extract regions if mentioned in the initiative name/meta
    const regions: string[] = [];
    const allText = (initName + " " + metaInfo).toLowerCase();
    if (allText.includes("blr") || allText.includes("bengaluru")) regions.push("BLR");
    if (allText.includes("delhi") || allText.includes("ncr")) regions.push("Delhi/NCR");
    if (allText.includes("hyd") || allText.includes("hyderabad")) regions.push("HYD");
    if (allText.includes("west") || allText.includes("mumbai") || allText.includes("mum"))
      regions.push("West");

    initiatives.push({
      name: initName.split("\n")[0]?.trim() || initName,
      type,
      ...(plannedStart !== null && { plannedStart }),
      ...(plannedEnd !== null && { plannedEnd }),
      variants: variants.length > 0 ? variants : [],
      regions: regions.length > 0 ? regions : ["All"],
    });
  }

  // Parse stores and rollouts
  const stores: ParsedImport["stores"] = [];
  const rollouts: ParsedImport["rollouts"] = [];

  for (const row of dataRows) {
    if (!row[STORE_COLS.code]?.trim()) continue;

    const store = {
      storeCode: row[STORE_COLS.code].trim(),
      storeName: row[STORE_COLS.name]?.trim() || "",
      areaManager: row[STORE_COLS.areaManager]?.trim() || "",
      region: row[STORE_COLS.region]?.trim() || "",
      city: row[STORE_COLS.city]?.trim() || "",
      storeFormat: row[STORE_COLS.format]?.trim() || "",
      menuType: row[STORE_COLS.menuType]?.trim() || "",
      coffeeMachine: row[STORE_COLS.coffeeMachine]?.trim() || "",
      merrychefType: row[STORE_COLS.merrychef]?.trim() || "",
    };
    stores.push(store);

    // Parse participation
    for (let i = 0; i < initiatives.length; i++) {
      const cellValue = row[INITIATIVES_START + i]?.trim().toLowerCase();
      const participating = cellValue === "yes";
      rollouts.push({
        storeCode: store.storeCode,
        initiativeName: initiatives[i].name,
        participating,
      });
    }
  }

  return { stores, initiatives, rollouts, warnings };
}

/**
 * Parse the simple 2-row header format exported directly from Google Sheets.
 * Row 1 (index 0): headers — store columns A-I + initiative names from col J+
 * Row 2+ (index 1+): store data rows; participation cell non-empty & != "no" means participating.
 *
 * Difference from parseMatrix: NO meta row 2 with dates — data starts immediately at row 2.
 */
export function parseSimpleFormat(csv: string): ParsedImport {
  const rows = parseCSV(csv);
  if (rows.length < 2) {
    return {
      stores: [],
      initiatives: [],
      rollouts: [],
      warnings: ["CSV must have at least 2 rows (header + one data row)"],
    };
  }

  const headerRow = rows[0];
  const dataRows = rows.slice(1);
  const warnings: string[] = [];

  const STORE_COLS = {
    code: 0,
    name: 1,
    areaManager: 2,
    region: 3,
    city: 4,
    format: 5,
    menuType: 6,
    coffeeMachine: 7,
    merrychef: 8,
  };
  const INITIATIVES_START = 9;

  // Parse initiative names from header row
  const initiatives: ParsedImport["initiatives"] = [];
  for (let i = INITIATIVES_START; i < headerRow.length; i++) {
    const name = headerRow[i]?.trim();
    if (!name) continue;
    const lower = name.toLowerCase();
    let type: "trial" | "launch" | "pilot" | "transition" = "trial";
    if (lower.includes("pilot")) type = "pilot";
    else if (lower.includes("launch")) type = "launch";
    else if (lower.includes("transition")) type = "transition";
    initiatives.push({
      name,
      type,
      plannedStart: null,
      plannedEnd: null,
      variants: [],
      regions: [],
    });
  }

  const stores: ParsedImport["stores"] = [];
  const rollouts: ParsedImport["rollouts"] = [];

  for (const row of dataRows) {
    const code = row[STORE_COLS.code]?.trim();
    // Skip empty rows or accidental extra header rows
    if (!code || code.toLowerCase() === "store code") continue;

    stores.push({
      storeCode: code,
      storeName: row[STORE_COLS.name]?.trim() || "",
      areaManager: row[STORE_COLS.areaManager]?.trim() || "",
      region: row[STORE_COLS.region]?.trim() || "",
      city: row[STORE_COLS.city]?.trim() || "",
      storeFormat: row[STORE_COLS.format]?.trim() || "",
      menuType: row[STORE_COLS.menuType]?.trim() || "",
      coffeeMachine: row[STORE_COLS.coffeeMachine]?.trim() || "",
      merrychefType: row[STORE_COLS.merrychef]?.trim() || "",
    });

    for (let i = 0; i < initiatives.length; i++) {
      const val = row[INITIATIVES_START + i]?.trim() || "";
      const lower = val.toLowerCase();
      const participating =
        val.length > 0 && lower !== "no" && lower !== "n" && val !== "0";
      if (participating) {
        rollouts.push({
          storeCode: code,
          initiativeName: initiatives[i].name,
          participating: true,
        });
      }
    }
  }

  if (stores.length === 0) {
    warnings.push("No store rows detected — check that data starts at row 2 with Store Code in column A");
  }

  return { stores, initiatives, rollouts, warnings };
}
