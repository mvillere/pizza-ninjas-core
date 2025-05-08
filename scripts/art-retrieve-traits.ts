import fs from 'fs/promises';
import path from 'path';
import { getChildrenInscriptions, getInscriptionPreview } from './utils/ord.js';
import { fileURLToPath } from 'url';

const NINJA_PARENT = '80da3cecac858f2757c5b338be15980bdc9d9570d4e86765b4948be8143c82e1i0';

// ESM way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TraitConfig {
  trait: string;
  id: string;
  type?: string;
  ST0?: string;
  ST1?: string;
  ST2?: string;
  holiday_swap?: string;
}

async function getNinjaChildren(): Promise<string[]> {
  return getChildrenInscriptions(NINJA_PARENT);
}

async function getNinjaPreview(ninjaId: string): Promise<TraitConfig[]> {
  try {
    // Save HTML to ./ninjas/<ninjaId>.html
    const html = await getInscriptionPreview(ninjaId);
    const ninjaHtmlPath = path.join(__dirname, '..', 'ninjas', `${ninjaId}.html`);
    await fs.writeFile(ninjaHtmlPath, html);

    // Extract the Ninja.load() array
    const match = html.match(/Ninja\.load\(\[([\s\S]*?)\]\)/);
    if (!match) {
      console.warn(`No Ninja.load() found in ${ninjaId}`);
      return [];
    }

    // Parse the array content
    const configStr = match[1];
    const configs: TraitConfig[] = [];

    // Simple parsing of the array objects
    const objectMatches = configStr.match(/\{([\s\S]*?)\}/g) || [];
    for (const objStr of objectMatches) {
      try {
        // Convert the object string to a proper JSON string
        const jsonStr = objStr
          .replace(/(\w+):/g, '"$1":') // Add quotes to keys
          .replace(/'/g, '"'); // Replace single quotes with double quotes

        const config = JSON.parse(jsonStr) as TraitConfig;
        if (config.trait && config.id) {
          configs.push(config);
        }
      } catch (e) {
        console.warn(`Failed to parse object in ${ninjaId}:`, e);
      }
    }

    return configs;
  } catch (error) {
    console.error(`Error fetching preview for ${ninjaId}:`, error);
    return [];
  }
}

async function main() {
  try {
    console.log('Fetching ninja inscription IDs...');
    const ninjaIds = await getNinjaChildren();

    // Save to /data directory at the project root
    const dataDir = path.join(__dirname, '..', 'data');
    await fs.mkdir(dataDir, { recursive: true });

    // Save to JSON file
    const outputPath = path.join(dataDir, 'ninja-ids.json');
    await fs.writeFile(outputPath, JSON.stringify(ninjaIds, null, 2));

    console.log(`Processing ${ninjaIds.length} ninjas...`);
    const traitMap = new Map<string, string>();

    for (const ninjaId of ninjaIds) {
      const traits = await getNinjaPreview(ninjaId);
      for (const trait of traits) {
        traitMap.set(trait.trait, trait.id);
      }
    }

    // Convert Map to object for JSON serialization
    const traitObject = Object.fromEntries(traitMap);

    // Save trait mapping to file
    const traitOutputPath = path.join(dataDir, 'trait-mappings.json');
    await fs.writeFile(traitOutputPath, JSON.stringify(traitObject, null, 2));

    console.log(`Successfully saved ${ninjaIds.length} ninja IDs to ${outputPath}`);
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main().catch(console.error);
