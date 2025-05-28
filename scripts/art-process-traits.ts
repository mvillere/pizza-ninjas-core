import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface InscriptionData {
  id: string;
  colors: Record<string, Record<string, string>>;
  filename: string;
}

interface TraitGroupData {
  inscriptions: InscriptionData[];
  type: string;
  generation: string;
}

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

// Helper to determine generation based on inscription ID pattern
function determineGeneration(id: string): string {
  // All traits are v1 for now
  return 'v1';
}

// Load trait group layer types from file
async function loadTraitGroupLayerTypes(): Promise<Map<string, string>> {
  const dataDir = path.join(__dirname, '../data');
  const traitGroupLayerTypesPath = path.join(dataDir, 'trait-group-layer-types.json');

  try {
    const content = await fs.readFile(traitGroupLayerTypesPath, 'utf-8');
    const traitGroupLayerTypesObj = JSON.parse(content) as Record<string, string>;
    return new Map(Object.entries(traitGroupLayerTypesObj));
  } catch (error) {
    throw new Error(`Failed to load trait group layer types from ${traitGroupLayerTypesPath}: ${error}`);
  }
}

// Helper to get the root and color map for a set of traitPairs
function getRootAndColors(
  traitPairs: {
    traitname: string;
    colorDef: Record<string, string> | null;
    type: string;
    id: string;
    traitgroup: string;
  }[]
): {
  root: string;
  inscriptions: InscriptionData[];
  type: string;
  generation: string;
} {
  if (traitPairs.length === 1) {
    const traitname = traitPairs[0].traitname.replace(/\.svg$/, '');
    const color = traitname.split('-').pop()!;
    const colors: Record<string, Record<string, string>> = {};
    if (traitPairs[0].colorDef) colors[color] = traitPairs[0].colorDef;

    const inscription: InscriptionData = {
      id: traitPairs[0].id,
      colors,
      filename: `${traitPairs[0].traitgroup}____${traitPairs[0].traitname}`,
    };

    return {
      root: traitname,
      inscriptions: [inscription],
      type: traitPairs[0].type,
      generation: determineGeneration(traitPairs[0].id),
    };
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

  // Group by inscription ID
  const inscriptionMap = new Map<string, InscriptionData>();

  for (const pair of traitPairs) {
    const traitWithoutSvg = pair.traitname.replace(/\.svg$/, '');
    let color: string;
    if (root && traitWithoutSvg.startsWith(root)) {
      color = traitWithoutSvg.slice(root.length).replace(/^-/, '');
    } else {
      color = traitWithoutSvg.split('-').pop()!;
    }
    color = color || traitWithoutSvg;

    if (!inscriptionMap.has(pair.id)) {
      inscriptionMap.set(pair.id, {
        id: pair.id,
        colors: {},
        filename: `${pair.traitgroup}____${pair.traitname}`,
      });
    }

    if (pair.colorDef) {
      inscriptionMap.get(pair.id)!.colors[color] = pair.colorDef;
    }
  }

  const inscriptions = Array.from(inscriptionMap.values());
  const primaryType = traitPairs[0].type;
  const primaryGeneration = determineGeneration(traitPairs[0].id);

  return {
    root,
    inscriptions,
    type: primaryType,
    generation: primaryGeneration,
  };
}

async function main() {
  try {
    const dataDir = path.join(__dirname, '../data');

    console.log('Loading trait group layer types...');
    const traitGroupLayerTypes = await loadTraitGroupLayerTypes();

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

    // traitgroup -> trait-root -> TraitGroupData
    const mapping: Record<string, Record<string, TraitGroupData>> = {};

    for (const [id, traitArr] of Object.entries(traitRelationships)) {
      // Group by traitgroup
      const groupMap: Record<
        string,
        { traitname: string; colorDef: Record<string, string> | null; type: string; id: string; traitgroup: string }[]
      > = {};

      for (const trait of traitArr) {
        const [traitgroup, traitname] = trait.split('____');
        if (!traitgroup || !traitname) continue;
        if (!groupMap[traitgroup]) groupMap[traitgroup] = [];
        const colorDef: Record<string, string> | null = traitColorDefs[trait] ?? null;

        // Get the type from our loaded mapping
        const type = traitGroupLayerTypes.get(traitgroup) || 'unknown';

        groupMap[traitgroup].push({ traitname, colorDef, type, id, traitgroup });
      }

      for (const [traitgroup, traitPairs] of Object.entries(groupMap)) {
        const { root, inscriptions, type, generation } = getRootAndColors(traitPairs);

        if (!mapping[traitgroup]) mapping[traitgroup] = {};

        mapping[traitgroup][root] = {
          inscriptions,
          type,
          generation,
        };
      }
    }

    const outputPath = path.join(dataDir, 'trait-root-mapping-v1-1-0.json');
    await fs.writeFile(outputPath, JSON.stringify(mapping, null, 2));

    console.log(`\nWrote trait root mapping to ${outputPath}`);
    console.log(`Processed ${Object.keys(mapping).length} trait groups`);
  } catch (error) {
    console.error('Error in art-process-traits:', error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
});
