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
    const traitMappingPath = path.join(dataDir, 'trait-mappings.json');

    const [artIds, traitsToIds] = await Promise.all([
      fs.readFile(artIdsPath, 'utf-8').then(JSON.parse) as Promise<string[]>,
      fs.readFile(traitMappingPath, 'utf-8').then(JSON.parse) as Promise<TraitData>,
    ]);

    // First pass: collect all trait groups and their variations
    const relatedTraits = new Map<string, string[]>();
    for (const [trait, id] of Object.entries(traitsToIds)) {
      if (!relatedTraits.has(id)) {
        relatedTraits.set(id, []);
      }

      relatedTraits.get(id)?.push(trait);
    }

    const relatedTraitsPath = path.join(dataDir, 'trait-relationships.json');
    await fs.writeFile(relatedTraitsPath, JSON.stringify(Object.fromEntries(relatedTraits), null, 2));

    const allArtIds = new Set(artIds);
    const notUsedIds = new Set();
    for (const id of allArtIds) {
      if (!relatedTraits.has(id)) {
        //console.log(`Inscription ${id} is not used`);
        notUsedIds.add(id);
      }
    }

    const notUsedIdsPath = path.join(dataDir, 'art-ids-not-used.json');
    await fs.writeFile(notUsedIdsPath, JSON.stringify(Array.from(notUsedIds), null, 2));

    // const traitGroups = new Map<string, Set<string>>();

    // for (const [trait, id] of Object.entries(relatedTraits)) {
    //     if (!relatedTraits.has(id)) {

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

main().catch((err) => {
  console.error(err);
});
