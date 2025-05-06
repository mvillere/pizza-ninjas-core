import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TraitData {
  [key: string]: string; // trait -> id mapping
}

function normalizeTraitName(trait: string): string {
  // Remove color variations from trait names
  // Example: "back-accessories____ninjato-blue.svg" -> "back-accessories____ninjato.svg"
  return trait.replace(/-[a-z]+\.svg$/, '.svg');
}

async function main() {
  try {
    // Read the input files
    const dataDir = path.join(__dirname, '../data');
    const artIdsPath = path.join(dataDir, 'art-ids.json');
    const traitsPath = path.join(dataDir, 'trait-mapping.json');

    const [artIds, traitsData] = await Promise.all([
      fs.readFile(artIdsPath, 'utf-8').then(JSON.parse),
      fs.readFile(traitsPath, 'utf-8').then(JSON.parse) as Promise<TraitData>,
    ]);

    const relatedTraits = new Map<string, string[]>();
    const traitGroups = new Map<string, Set<string>>();

    // First pass: collect all trait groups and their variations
    for (const [trait, id] of Object.entries(traitsData)) {
      if (!relatedTraits.has(id)) {
        relatedTraits.set(id, []);
      }

      relatedTraits.get(id)?.push(trait);

    //   const normalized = normalizeTraitName(trait);
    //   if (!traitGroups.has(normalized)) {
    //     traitGroups.set(normalized, new Set());
    //   }
    //   traitGroups.get(normalized)!.add(id);
    }

    console.log(relatedTraits);

    return;

    // // Second pass: identify unique traits and their IDs
    // for (const [normalizedTrait, ids] of traitGroups) {
    //   if (ids.size === 1) {
    //     // If there's only one ID for this trait, it's a unique trait
    //     normalizedTraits.set(normalizedTrait, Array.from(ids)[0]);
    //   } else {
    //     // For traits with multiple IDs, we need to verify they're all the same
    //     const uniqueIds = new Set(ids);
    //     if (uniqueIds.size === 1) {
    //       // If all variations point to the same ID, it's a unique trait
    //       normalizedTraits.set(normalizedTrait, Array.from(uniqueIds)[0]);
    //     } else {
    //       console.warn(`Multiple IDs found for trait ${normalizedTrait}:`, Array.from(uniqueIds));
    //     }
    //   }
    // }

    // // Create the final output
    // const output = {
    //   artIds,
    //   normalizedTraits: Object.fromEntries(normalizedTraits),
    // };

    // // Save to JSON file
    // const outputPath = path.join(dataDir, 'joined-art-traits.json');
    // await fs.writeFile(outputPath, JSON.stringify(output, null, 2));

    // console.log(`Successfully saved joined data to ${outputPath}`);
    // console.log(`Found ${artIds.length} art IDs and ${normalizedTraits.size} unique traits`);
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main().catch(console.error);
