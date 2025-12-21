/**
 * CSV → Supabase seed.sql (Deals table)
 * Robust CSV parsing + SQL escaping
 */

const fs = require("fs");
const { parse } = require("csv-parse/sync");

// ================= CONFIG =================
const INPUT_CSV = "data/deals.csv";
const OUTPUT_SQL = "supabase/seed.sql";
const TABLE = "public.deals";

// ================= HELPERS =================
function sqlEscape(value) {
  if (value === undefined || value === null || value === "") {
    return "NULL";
  }

  return `'${String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "''")
    .replace(/\u0000/g, "")
  }'`;
}

// ================= MAIN =================
const csvRaw = fs.readFileSync(INPUT_CSV, "utf8");

const records = parse(csvRaw, {
  columns: true,
  skip_empty_lines: true,
  relax_quotes: true,
  relax_column_count: true,
  trim: true,
});

const values = records.map((row, i) => {
  return `(
    now() - interval '${i * 3} minutes',
    ${sqlEscape(row.description || `Sample deal ${i + 1}`)},
    ${row.current_price || "NULL"},
    ${row.old_price || "NULL"},
    ${sqlEscape(row.image_link)},
    ${sqlEscape(row.product_link)},
    ${sqlEscape(row.store_name || "Amazon")},
    'Draft',
    false,
    'insert'
  )`;
});

const sql = `
-- AUTO-GENERATED SEED FILE
-- SAFE FOR LOCAL / DEV ONLY
-- Generated from CSV (sanitized)

insert into ${TABLE} (
  created_at,
  description,
  current_price,
  old_price,
  image_link,
  product_link,
  store_name,
  status,
  exclude_from_auto,
  publish_action
) values
${values.join(",\n")};
`;

fs.writeFileSync(OUTPUT_SQL, sql.trim() + "\n");

console.log(`✅ Seed file generated successfully: ${OUTPUT_SQL}`);
