import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TraitData {
  ST0?: string;
  ST1?: string;
  ST2?: string;
  ST3?: string;
  ST4?: string;
  ST5?: string;
  ST6?: string;
  type: string;
  trait?: string; // Optional for Ralf ninja
  id: string;
  holiday_swap?: string;
}

interface LayerOrderingData {
  traitGroup: string;
  type: string;
  position: number;
}

interface LayerGroup {
  layerGroupId: number;
  traitGroups: string[];
  description: string;
}

// Define Ralf's trait mappings by inscription ID
const RALF_TRAIT_MAPPINGS: Record<string, string> = {
  '3eb63d923f4634a25845f1769d2212e5aa78465051b7b3fb783b60749fbba761i0': 'stoic-body____stoic-body-ralf.svg',
  f7ecf7b6faa7d8a1f2ac6e3facc44a85b8b88661bae424074df4524d747408f8i0: 'ninjalerts-head____ninjalerts-head-ralf.svg',
  e004f8234329c7a4c1d0a78856d127c89d8b2e0d26ac6e0202fe8be71e43cc54i0: 'ninjalerts-face____ralf.svg',
  b80b35b835f9f7fc399830e04bb538372367da3d9baad2f1a91a61ce9f6adbd9i0: 'top-of-head____ralf.svg',
};

// Helper to get trait name for a trait, handling Ralf special case
function getTraitName(trait: TraitData): string | null {
  if (trait.trait) {
    return trait.trait;
  }
  // Handle Ralf ninja special case
  if (RALF_TRAIT_MAPPINGS[trait.id]) {
    return RALF_TRAIT_MAPPINGS[trait.id];
  }
  return null;
}

// Extract mutual exclusion data from HTML files
async function extractMutualExclusions(): Promise<Map<string, Set<string>>> {
  const inscriptionsDir = path.join(__dirname, '../ninjas/inscriptions');
  const files = await fs.readdir(inscriptionsDir);
  const htmlFiles = files.filter((f) => f.endsWith('.html'));

  const coOccurrences = new Map<string, Set<string>>();

  for (const file of htmlFiles) {
    try {
      const content = await fs.readFile(path.join(inscriptionsDir, file), 'utf-8');

      // Extract the Ninja.load array using regex
      const loadMatch = content.match(/Ninja\.load\(\[([\s\S]*?)\]\);/);
      if (!loadMatch) continue;

      const jsonStr = '[' + loadMatch[1] + ']';
      const traits: TraitData[] = JSON.parse(jsonStr);

      const traitGroups = traits
        .map((trait) => {
          const traitName = getTraitName(trait);
          return traitName ? traitName.split('____')[0] : null;
        })
        .filter(Boolean) as string[];

      // Record co-occurrences
      for (let i = 0; i < traitGroups.length; i++) {
        for (let j = i + 1; j < traitGroups.length; j++) {
          const group1 = traitGroups[i];
          const group2 = traitGroups[j];

          if (!coOccurrences.has(group1)) coOccurrences.set(group1, new Set());
          if (!coOccurrences.has(group2)) coOccurrences.set(group2, new Set());

          coOccurrences.get(group1)!.add(group2);
          coOccurrences.get(group2)!.add(group1);
        }
      }
    } catch (error) {
      console.warn(`Failed to parse ${file}:`, error);
    }
  }

  return coOccurrences;
}

// Extract layer ordering from all HTML files
async function extractLayerOrdering(): Promise<Map<string, number>> {
  const inscriptionsDir = path.join(__dirname, '../ninjas/inscriptions');
  const files = await fs.readdir(inscriptionsDir);
  const htmlFiles = files.filter((f) => f.endsWith('.html'));

  const layerOrderings: LayerOrderingData[][] = [];

  for (const file of htmlFiles) {
    try {
      const content = await fs.readFile(path.join(inscriptionsDir, file), 'utf-8');

      // Extract the Ninja.load array using regex
      const loadMatch = content.match(/Ninja\.load\(\[([\s\S]*?)\]\);/);
      if (!loadMatch) continue;

      const jsonStr = '[' + loadMatch[1] + ']';
      const traits: TraitData[] = JSON.parse(jsonStr);

      const ordering: LayerOrderingData[] = traits
        .map((trait, index) => {
          const traitName = getTraitName(trait);
          return traitName
            ? {
                traitGroup: traitName.split('____')[0],
                type: trait.type,
                position: index,
              }
            : null;
        })
        .filter(Boolean) as LayerOrderingData[];

      layerOrderings.push(ordering);
    } catch (error) {
      console.warn(`Failed to parse ${file}:`, error);
    }
  }

  // Now we need to solve the topological ordering problem
  return solveLayerOrdering(layerOrderings);
}

// Topological sorting algorithm to determine global layer ordering
function solveLayerOrdering(layerOrderings: LayerOrderingData[][]): Map<string, number> {
  // Build a graph of ordering constraints
  const constraints = new Map<string, Set<string>>(); // traitGroup -> set of traitGroups that must come after it
  const allTraitGroups = new Set<string>();

  // Collect all trait groups
  for (const ordering of layerOrderings) {
    for (const item of ordering) {
      allTraitGroups.add(item.traitGroup);
    }
  }

  // Initialize constraint map
  for (const traitGroup of allTraitGroups) {
    constraints.set(traitGroup, new Set());
  }

  // Build constraints from each ordering
  for (const ordering of layerOrderings) {
    for (let i = 0; i < ordering.length - 1; i++) {
      const current = ordering[i].traitGroup;
      const next = ordering[i + 1].traitGroup;
      if (current !== next) {
        constraints.get(current)!.add(next);
      }
    }
  }

  // Topological sort using Kahn's algorithm
  const inDegree = new Map<string, number>();
  for (const traitGroup of allTraitGroups) {
    inDegree.set(traitGroup, 0);
  }

  // Calculate in-degrees
  for (const [from, toSet] of constraints) {
    for (const to of toSet) {
      inDegree.set(to, (inDegree.get(to) || 0) + 1);
    }
  }

  // Queue for nodes with no incoming edges
  const queue: string[] = [];
  for (const [traitGroup, degree] of inDegree) {
    if (degree === 0) {
      queue.push(traitGroup);
    }
  }

  const result = new Map<string, number>();
  let order = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.set(current, order++);

    // Remove edges from current node
    for (const next of constraints.get(current)!) {
      const newDegree = inDegree.get(next)! - 1;
      inDegree.set(next, newDegree);
      if (newDegree === 0) {
        queue.push(next);
      }
    }
  }

  // Handle any remaining nodes (cycles or disconnected components)
  for (const [traitGroup, degree] of inDegree) {
    if (degree > 0 && !result.has(traitGroup)) {
      result.set(traitGroup, order++);
    }
  }

  return result;
}

// Compress layers based on mutual exclusions
function compressLayers(layerOrdering: Map<string, number>, coOccurrences: Map<string, Set<string>>): LayerGroup[] {
  const sortedTraitGroups = Array.from(layerOrdering.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([traitGroup]) => traitGroup);

  const layerGroups: LayerGroup[] = [];
  const assigned = new Set<string>();

  for (const traitGroup of sortedTraitGroups) {
    if (assigned.has(traitGroup)) continue;

    // Find all trait groups that are mutually exclusive with this one
    const mutuallyExclusive = new Set<string>([traitGroup]);
    const coOccursWith = coOccurrences.get(traitGroup) || new Set();

    // A trait group is mutually exclusive if it never co-occurs with the current one
    for (const otherGroup of sortedTraitGroups) {
      if (assigned.has(otherGroup) || otherGroup === traitGroup) continue;

      const otherCoOccurs = coOccurrences.get(otherGroup) || new Set();

      // If they never co-occur, they might be mutually exclusive
      if (!coOccursWith.has(otherGroup) && !otherCoOccurs.has(traitGroup)) {
        // Check if they have similar layer ordering (within reasonable range)
        const currentOrder = layerOrdering.get(traitGroup)!;
        const otherOrder = layerOrdering.get(otherGroup)!;

        // Allow some flexibility in ordering for mutually exclusive groups
        if (Math.abs(currentOrder - otherOrder) <= 5) {
          mutuallyExclusive.add(otherGroup);
        }
      }
    }

    // Create layer group
    const layerGroupId = layerGroups.length + 1;
    const traitGroupsArray = Array.from(mutuallyExclusive).sort();

    let description = '';
    if (traitGroupsArray.length === 1) {
      description = `Single trait group: ${traitGroupsArray[0]}`;
    } else {
      // Try to categorize the group
      const types = new Set(
        traitGroupsArray.map((tg) => {
          if (tg.includes('head') || tg.includes('face') || tg.includes('eyes')) return 'head';
          if (tg.includes('top-of-head') || tg.includes('hat')) return 'hat';
          if (tg.includes('body') || tg.includes('weapon') || tg.includes('belt')) return 'body';
          return 'other';
        })
      );

      if (types.size === 1) {
        description = `Mutually exclusive ${Array.from(types)[0]} traits`;
      } else {
        description = `Mutually exclusive mixed traits`;
      }
    }

    layerGroups.push({
      layerGroupId,
      traitGroups: traitGroupsArray,
      description,
    });

    // Mark all as assigned
    for (const tg of mutuallyExclusive) {
      assigned.add(tg);
    }
  }

  return layerGroups;
}

async function main() {
  try {
    console.log('Extracting mutual exclusions from HTML files...');
    const coOccurrences = await extractMutualExclusions();

    console.log('Extracting layer ordering from HTML files...');
    const layerOrdering = await extractLayerOrdering();

    console.log('Compressing layers based on mutual exclusions...');
    const layerGroups = compressLayers(layerOrdering, coOccurrences);

    // Load trait group layer types from file (created by art-retrieve-traits)
    const dataDir = path.join(__dirname, '../data');
    const traitGroupLayerTypesPath = path.join(dataDir, 'trait-group-layer-types.json');
    let traitGroupLayerTypes: Map<string, string> = new Map();

    try {
      const traitGroupLayerTypesData = await fs.readFile(traitGroupLayerTypesPath, 'utf-8');
      const traitGroupLayerTypesObj = JSON.parse(traitGroupLayerTypesData) as Record<string, string>;
      traitGroupLayerTypes = new Map(Object.entries(traitGroupLayerTypesObj));
    } catch (error) {
      console.warn(`Could not load trait-group-layer-types.json from ${traitGroupLayerTypesPath}`);
      console.warn('Layer types will show as "unknown". Run "npm run art:retrieve-traits" first.');
    }

    console.log('\nLayer ordering determined:');
    const sortedLayers = Array.from(layerOrdering.entries()).sort((a, b) => a[1] - b[1]);
    for (const [traitGroup, order] of sortedLayers) {
      console.log(`  ${order}: ${traitGroup} (${traitGroupLayerTypes.get(traitGroup) || 'unknown'})`);
    }

    console.log('\nCompressed layer groups:');
    for (const layerGroup of layerGroups) {
      console.log(`\nLayer Group ${layerGroup.layerGroupId}: ${layerGroup.description}`);
      for (const traitGroup of layerGroup.traitGroups) {
        const order = layerOrdering.get(traitGroup) || 999;
        console.log(`  - ${traitGroup} (sublayer ${order})`);
      }
    }

    // Write the layer ordering
    const layerOrderingPath = path.join(dataDir, 'layer-ordering.json');
    const layerOrderingObj = Object.fromEntries(layerOrdering);
    await fs.writeFile(layerOrderingPath, JSON.stringify(layerOrderingObj, null, 2));

    console.log(`\nWrote layer ordering to ${layerOrderingPath}`);

    // Write layer groups
    const layerGroupsPath = path.join(dataDir, 'layer-groups.json');
    await fs.writeFile(layerGroupsPath, JSON.stringify(layerGroups, null, 2));

    console.log(`Wrote layer groups to ${layerGroupsPath}`);
  } catch (error) {
    console.error('Error in art-process-layers:', error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
});
