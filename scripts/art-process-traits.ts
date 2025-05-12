import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get the common prefix of an array of strings
function getCommonPrefix(strings: string[]): string {
  if (strings.length === 0) return '';
  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    let j = 0;
    while (j < prefix.length && j < strings[i].length && prefix[j] === strings[i][j]) {
      j++;
    }
    prefix = prefix.slice(0, j);
    if (prefix === '') break;
  }
  return prefix;
}

// Helper to get the root and color map for a set of traitPairs
function getRootAndColors(traitPairs: { traitname: string; colorDef: Record<string, string> | null }[]): {
  root: string;
  colorMap: Record<string, Record<string, string>>;
} {
  if (traitPairs.length === 1) {
    const traitname = traitPairs[0].traitname.replace(/\.svg$/, '');
    const color = traitname.split('-').pop()!;
    const colorMap: Record<string, Record<string, string>> = {};
    if (traitPairs[0].colorDef) colorMap[color] = traitPairs[0].colorDef;
    return { root: traitname, colorMap };
  }
  // Remove .svg extension
  const names = traitPairs.map((pair) => pair.traitname.replace(/\.svg$/, ''));
  // Find common prefix
  const prefix = getCommonPrefix(names);
  let root: string;
  if (prefix && names.every((n) => n.startsWith(prefix))) {
    root = prefix.replace(/-$/, '');
  } else {
    root = names.reduce((a, b) => (a.length <= b.length ? a : b));
  }
  // Build colorMap
  const colorMap: Record<string, Record<string, string>> = {};
  for (const pair of traitPairs) {
    const color = pair.traitname
      .replace(/\.svg$/, '')
      .split('-')
      .pop()!;
    if (pair.colorDef) colorMap[color] = pair.colorDef;
  }
  return { root, colorMap };
}

async function main() {
  try {
    const dataDir = path.join(__dirname, '../data');

    const traitColorDefsPath = path.join(dataDir, 'trait-color-defs.json');
    const traitColorDefs = (await fs.readFile(traitColorDefsPath, 'utf-8').then(JSON.parse)) as Record<
      string,
      Record<string, string>
    >;

    const traitRelationshipsPath = path.join(dataDir, 'trait-relationships.json');
    const traitRelationships = (await fs.readFile(traitRelationshipsPath, 'utf-8').then(JSON.parse)) as Record<
      string,
      string[]
    >;

    // traitgroup -> trait-root -> id -> color -> colorDef
    const mapping: Record<string, Record<string, Record<string, Record<string, Record<string, string>>>>> = {};

    for (const [id, traitArr] of Object.entries(traitRelationships)) {
      // Group by traitgroup
      const groupMap: Record<string, { traitname: string; colorDef: Record<string, string> }[]> = {};
      for (const trait of traitArr) {
        const [traitgroup, traitname] = trait.split('____');
        if (!traitgroup || !traitname) continue;
        if (!groupMap[traitgroup]) groupMap[traitgroup] = [];
        const colorDef: Record<string, string> | null = traitColorDefs[trait] ?? null;
        groupMap[traitgroup].push({ traitname, colorDef });
      }
      for (const [traitgroup, traitPairs] of Object.entries(groupMap)) {
        const { root, colorMap } = getRootAndColors(traitPairs);
        if (!mapping[traitgroup]) mapping[traitgroup] = {};
        if (!mapping[traitgroup][root]) mapping[traitgroup][root] = {};
        mapping[traitgroup][root][id] = colorMap;
      }
    }

    const outputPath = path.join(dataDir, 'trait-root-mapping.json');
    await fs.writeFile(outputPath, JSON.stringify(mapping, null, 2));

    console.log(`Wrote trait root mapping to ${outputPath}`);
  } catch (error) {
    console.error('Error in art-process-traits:', error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
});
