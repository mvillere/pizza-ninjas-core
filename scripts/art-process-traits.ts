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

// Helper to get the root and variants for a set of trait names
function getRootAndVariants(traitNames: string[]): { root: string, variants: string[] } {
  if (traitNames.length === 1) {
    // Only one trait, root is the name, no variants
    return { root: traitNames[0].replace(/\.svg$/, ''), variants: [] };
  }
  // Remove .svg extension
  const names = traitNames.map(name => name.replace(/\.svg$/, ''));
  // Find common prefix
  const prefix = getCommonPrefix(names);
  if (prefix && names.every(n => n.startsWith(prefix))) {
    // If the prefix is not the full name, use it as root
    const root = prefix.replace(/-$/, ''); // Remove trailing dash if present
    const variants = names.map(n => n.slice(prefix.length)).map(v => v.replace(/^-/, ''));
    // Remove empty variants
    return { root, variants: variants.filter(v => v) };
  } else {
    // No common prefix, use the shortest string as root
    const root = names.reduce((a, b) => a.length <= b.length ? a : b);
    const variants = names.filter(n => n !== root);
    return { root, variants };
  }
}

async function main() {
  try {
    const dataDir = path.join(__dirname, '../data');
    const traitRelationshipsPath = path.join(dataDir, 'trait-relationships.json');
    const outputPath = path.join(dataDir, 'trait-root-mapping.json');

    const traitRelationships = await fs.readFile(traitRelationshipsPath, 'utf-8').then(JSON.parse) as Record<string, string[]>;

    // traitgroup -> trait-root -> id -> variantListArr
    const mapping: Record<string, Record<string, Record<string, string[]>>> = {};

    for (const [id, traitArr] of Object.entries(traitRelationships)) {
      // Group by traitgroup
      const groupMap: Record<string, string[]> = {};
      for (const trait of traitArr) {
        const [traitgroup, traitname] = trait.split('____');
        if (!traitgroup || !traitname) continue;
        if (!groupMap[traitgroup]) groupMap[traitgroup] = [];
        groupMap[traitgroup].push(traitname);
      }
      for (const [traitgroup, traitnames] of Object.entries(groupMap)) {
        const { root, variants } = getRootAndVariants(traitnames);
        if (!mapping[traitgroup]) mapping[traitgroup] = {};
        if (!mapping[traitgroup][root]) mapping[traitgroup][root] = {};
        mapping[traitgroup][root][id] = variants;
      }
    }

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