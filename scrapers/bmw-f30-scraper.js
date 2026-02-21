#!/usr/bin/env node
/**
 * BMW F30 Parts Scraper — bmwfans.info
 * --------------------------------------------------
 * Scrapes BMW 3-Series F30 (320i N20, Europe) body/exterior parts.
 * Site serves static HTML, so plain fetch works — no headless browser needed.
 *
 * Output: /tmp/car-parts-check/data/bmw_f30_parts.json
 *
 * Usage:
 *   node scrapers/bmw-f30-scraper.js
 *
 * Notes:
 *   - USD prices on bmwfans.info are always $0.00 (a known site limitation).
 *     EUR prices are available in tooltips and are extracted here.
 *   - Price field in output is in EUR. metadata.currency = "EUR".
 *   - EUR/USD conversion rate is stored in metadata for admin reference.
 */

const fs = require('fs');
const path = require('path');

// ─── Config ────────────────────────────────────────────────────────────────
const BASE_URL       = 'https://bmwfans.info';
const VARIANT_PATH   = 'F30/Europe/320i-N20';
const OUTPUT_FILE    = path.join(__dirname, '../data/bmw_f30_parts.json');
const DELAY_MS       = 1200; // polite delay between requests
const USER_AGENT     = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                     + 'AppleWebKit/537.36 (KHTML, like Gecko) '
                     + 'Chrome/120.0.0.0 Safari/537.36';

// EUR/USD rate at time of scrape (update if needed)
const EUR_USD_RATE   = 1.08;

// ─── Subgroup → Category mapping ───────────────────────────────────────────
// Each entry: { category, group, subgroup }
// category must be one of: fender, bumper_front, bumper_rear, hood,
//   headlamp, tail_light, grille, side_mirror, door_handle
const TARGET_SUBGROUPS = [
  // fender (front wing / side panel)
  { category: 'fender',       group: 'bodywork',      subgroup: 'front_side_panel'                     },

  // bumper_front
  { category: 'bumper_front', group: 'vehicle_trim',  subgroup: 'trim_cover_front'                     },
  { category: 'bumper_front', group: 'vehicle_trim',  subgroup: 'carrier_front'                        },
  { category: 'bumper_front', group: 'vehicle_trim',  subgroup: 'reinforcement_for_body_front'         },
  { category: 'bumper_front', group: 'vehicle_trim',  subgroup: 'm_trim_front'                         },

  // bumper_rear
  { category: 'bumper_rear',  group: 'vehicle_trim',  subgroup: 'trim_cover_rear'                      },
  { category: 'bumper_rear',  group: 'vehicle_trim',  subgroup: 'carrier_rear'                         },
  { category: 'bumper_rear',  group: 'vehicle_trim',  subgroup: 'reinforcement_for_body_rear'          },
  { category: 'bumper_rear',  group: 'vehicle_trim',  subgroup: 'm_trim_rear'                          },

  // hood
  { category: 'hood',         group: 'bodywork',      subgroup: 'engine_hood_mounting_parts'           },
  { category: 'hood',         group: 'bodywork',      subgroup: 'hood_locking_system'                  },
  { category: 'hood',         group: 'bodywork',      subgroup: 'hood_seals'                           },
  { category: 'hood',         group: 'vehicle_trim',  subgroup: 'underhood_shield'                     },

  // headlamp
  { category: 'headlamp',     group: 'lighting',      subgroup: 'headlight'                            },
  { category: 'headlamp',     group: 'lighting',      subgroup: 'individual_parts_for_headlamp_halogen'},
  { category: 'headlamp',     group: 'lighting',      subgroup: 'single_parts_xenon_headlight'         },

  // tail_light
  { category: 'tail_light',   group: 'lighting',      subgroup: 'rear_light'                           },
  { category: 'tail_light',   group: 'lighting',      subgroup: 'third_stoplamp'                       },

  // grille
  { category: 'grille',       group: 'vehicle_trim',  subgroup: 'exterior_trim_grill'                  },

  // side_mirror
  { category: 'side_mirror',  group: 'vehicle_trim',  subgroup: 'outside_mirror'                       },
  { category: 'side_mirror',  group: 'vehicle_trim',  subgroup: 'outside_mirror_2'                     },
  { category: 'side_mirror',  group: 'vehicle_trim',  subgroup: 'mirror_glass'                         },

  // door_handle
  { category: 'door_handle',  group: 'vehicle_trim',  subgroup: 'locking_system_door_front'            },
  { category: 'door_handle',  group: 'vehicle_trim',  subgroup: 'closing_system_door_rear'             },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

/** Decode HTML entities in a string */
function decodeHtml(str) {
  return str
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Find the end index of the outermost <table> starting at startIdx.
 * startIdx should point to the '<' of the opening <table tag.
 * Accounts for nested <table> elements.
 * Returns the index just after the matching </table>.
 */
function findMatchingTableEnd(html, startIdx) {
  let depth = 1; // we're inside the opening table
  let i     = startIdx + 6; // skip past '<table'
  while (i < html.length && depth > 0) {
    const open  = html.indexOf('<table', i);
    const close = html.indexOf('</table>', i);
    if (close === -1) return -1;
    if (open !== -1 && open < close) {
      depth++;
      i = open + 6;
    } else {
      depth--;
      i = close + 8;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Parse parts from a subgroup page HTML.
 * Returns array of { oem, name, priceEur }.
 */
function parsePartsPage(html, { category, group, subgroup }) {
  const parts = [];

  // Locate the parts_table (using <table id= to be precise)
  const tableTagStart = html.indexOf('<table id="parts_table"');
  if (tableTagStart === -1) {
    // Some pages embed table differently
    const altStart = html.indexOf('id="parts_table"');
    if (altStart === -1) {
      console.warn(`  ⚠  No parts_table found for ${group}/${subgroup}`);
      return parts;
    }
  }
  const tableStart = html.indexOf('<table id="parts_table"') !== -1
    ? html.indexOf('<table id="parts_table"')
    : html.lastIndexOf('<table', html.indexOf('id="parts_table"'));

  const tableEndIdx = findMatchingTableEnd(html, tableStart + 6);
  if (tableEndIdx === -1) {
    console.warn(`  ⚠  Could not find closing </table> for ${group}/${subgroup}`);
    return parts;
  }
  const table = html.slice(tableStart, tableEndIdx);

  // Split into rows
  const rows = table.split('<tr');
  let currentPositionName = '';

  for (const row of rows) {
    // ── Title row → extract position/part name ─────────────────────────────
    if (row.includes('title_row')) {
      const strongMatch = row.match(/<strong>([^<]{2,80})<\/strong>/);
      if (strongMatch) {
        const raw = decodeHtml(strongMatch[1]);
        // Skip meta rows like "Part groups", supplement headers, etc.
        if (!raw.toLowerCase().startsWith('part') && raw.length > 3) {
          currentPositionName = raw.replace(/\s+/g, ' ').trim();
        }
      }
      continue;
    }

    // ── Part row → extract OEM + price ────────────────────────────────────
    // Must be a data part row (either format)
    if (!row.includes('part_row')) continue;
    // Must have at least one OEM identifier
    if (!row.includes('clipboard_part') && !/href="\/parts-catalog\/\d{10,11}\//.test(row)) continue;

    // OEM number — two formats:
    // 1) <input class="clipboard_part" value="51647245786" />
    // 2) <a href="/parts-catalog/51117292991/">  (pages with supplement conditions)
    const oemFromInput = row.match(/value="(\d{10,11})"/);
    const oemFromHref  = row.match(/href="\/parts-catalog\/(\d{10,11})\/"/);
    const oemMatch     = oemFromInput || oemFromHref;
    if (!oemMatch) continue;
    const oem = oemMatch[1];

    // EUR price from tooltip: title="EUR&#160;€57.30<br />"
    let price = null;
    const eurMatch = row.match(/EUR&#160;€([\d,]+\.?\d*)/);
    if (eurMatch) {
      const parsed = parseFloat(eurMatch[1].replace(',', ''));
      // Treat 0.00 as "no price available"
      if (!isNaN(parsed) && parsed > 0) price = parsed;
    }
    // Fallback: USD price (often 0.00, skip those)
    if (price === null) {
      const usdMatch = row.match(/<strong><span class='light'>\$<\/span>([\d.]+)<\/strong>/);
      if (usdMatch) {
        const usd = parseFloat(usdMatch[1]);
        if (usd > 0) price = usd / EUR_USD_RATE; // convert to EUR for consistency
      }
    }

    parts.push({
      oem,
      name:    currentPositionName || 'Unknown',
      priceEur: price,
      group,
      subgroup,
      category,
    });
  }

  return parts;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚗 BMW F30 Parts Scraper — bmwfans.info');
  console.log(`📦 Variant: ${VARIANT_PATH}`);
  console.log(`📁 Output:  ${OUTPUT_FILE}`);
  console.log('');

  const allParts = [];
  const seen     = new Set(); // deduplicate by OEM

  for (const target of TARGET_SUBGROUPS) {
    const { category, group, subgroup } = target;
    const url = `${BASE_URL}/parts-catalog/${VARIANT_PATH}/browse/${group}/${subgroup}/`;

    console.log(`🔍 [${category}] ${group}/${subgroup}`);

    try {
      const html  = await fetchPage(url);
      const parts = parsePartsPage(html, target);

      let added = 0;
      for (const p of parts) {
        if (seen.has(p.oem)) continue; // skip duplicate OEMs
        seen.add(p.oem);

        allParts.push({
          oem:      p.oem,
          name:     p.name,
          price:    p.priceEur !== null ? parseFloat(p.priceEur.toFixed(2)) : null,
          group:    p.group,
          subgroup: p.subgroup,
          category: p.category,
        });
        added++;
      }

      const prices = parts.filter(p => p.priceEur !== null).length;
      console.log(`   ✓ ${parts.length} parts (${added} new) | ${prices} with EUR price`);

    } catch (err) {
      console.error(`   ✗ Error: ${err.message}`);
    }

    await sleep(DELAY_MS);
  }

  // ── Write output ──────────────────────────────────────────────────────────
  const output = {
    scrapeDate: new Date().toISOString().split('T')[0],
    source:     'bmwfans.info ETK BMW F30',
    variant:    `${VARIANT_PATH} (320i N20, Europe)`,
    metadata: {
      currency:    'EUR',
      eurUsdRate:  EUR_USD_RATE,
      note:        'Prices are in EUR (USD prices not available on bmwfans.info). Convert using metadata.eurUsdRate.',
      totalParts:  allParts.length,
      pricesCovered: allParts.filter(p => p.price !== null).length,
    },
    parts: allParts,
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');

  console.log('');
  console.log('─'.repeat(50));
  console.log(`✅ Done! ${allParts.length} unique parts scraped`);
  console.log(`💰 ${output.metadata.pricesCovered} parts have prices`);
  console.log(`📄 Saved → ${OUTPUT_FILE}`);

  // ── Print category summary ────────────────────────────────────────────────
  const cats = {};
  for (const p of allParts) cats[p.category] = (cats[p.category] || 0) + 1;
  console.log('');
  console.log('Category breakdown:');
  for (const [cat, count] of Object.entries(cats)) {
    console.log(`  ${cat.padEnd(15)} ${count} parts`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
