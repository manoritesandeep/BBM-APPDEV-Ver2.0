// Usage: node buildBharatMart/data/scripts/csv-to-dummy-data.js

const fs = require("fs");
const path = require("path");

// Corrected path: CSV is in buildBharatMart/data/products_rows.csv
const csvFilePath = path.join(__dirname, "../products_rows.csv");
const outputFilePath = path.join(__dirname, "../dummy-data.js");

function parseBoolean(val) {
  if (typeof val === "string") {
    return val.trim().toLowerCase() === "true";
  }
  return false;
}

function parseNumber(val) {
  if (val === undefined || val === null || val === "") return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function csvToArray(str, delimiter = ",") {
  const lines = str.split("\n").filter(Boolean);
  const headers = lines[0].replace(/\r$/, "").split(delimiter);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    let line = lines[i].replace(/\r$/, "");
    if (!line.trim()) continue;
    let values = [];
    let curr = "";
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"' && line[j - 1] !== "\\") {
        inQuotes = !inQuotes;
        continue;
      }
      if (char === delimiter && !inQuotes) {
        values.push(curr);
        curr = "";
      } else {
        curr += char;
      }
    }
    values.push(curr);
    while (values.length < headers.length) values.push("");
    rows.push(
      headers.reduce((obj, header, idx) => {
        obj[header] = values[idx] || "";
        return obj;
      }, {})
    );
  }
  return rows;
}

function convertRow(row) {
  return {
    id: parseNumber(row.id),
    created_at: row.created_at,
    productNum: row.productNum,
    productName: row.productName,
    HSN: row.HSN,
    sizes: row.sizes,
    colour: row.colour,
    subCategory: row.subCategory,
    category: row.category,
    brand: row.brand,
    description: row.description,
    unitPrice: parseNumber(row.unitPrice),
    discount: parseNumber(row.discount),
    price: parseNumber(row.price),
    quantity: parseNumber(row.quantity),
    imageUrl: row.imageUrl,
    rating: parseNumber(row.rating),
    rentable: parseBoolean(row.rentable),
    material: "", // You can add logic to infer material if needed
  };
}

function main() {
  const csv = fs.readFileSync(csvFilePath, "utf8");
  const rows = csvToArray(csv);
  const products = rows.map(convertRow);

  const jsContent =
    "// filepath: /Users/sandeep/Downloads/github_repos/BBM-AppDev/buildBharatMart/data/dummy-data.js\n" +
    "export const DUMMY_PRODUCTS = " +
    JSON.stringify(products, null, 2) +
    ";\n";

  fs.writeFileSync(outputFilePath, jsContent, "utf8");
  console.log(`Converted ${products.length} products to dummy-data.js`);
}

main();
