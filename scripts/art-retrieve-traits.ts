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
  holiday_swap?: string;
  [key: `ST${number}`]: string | undefined;
}

async function getNinjaChildren(): Promise<string[]> {
  return getChildrenInscriptions(NINJA_PARENT);
}

async function getNinjaPreview(ninjaId: string): Promise<TraitConfig[]> {
  try {
    // Check if ninja HTML exists on disk first
    const ninjaHtmlPath = path.join(__dirname, '..', 'ninjas/inscriptions', `${ninjaId}.html`);
    let html;
    try {
      html = await fs.readFile(ninjaHtmlPath, 'utf-8');
    } catch (err) {
      // If file doesn't exist, fetch from inscription preview and save
      html = await getInscriptionPreview(ninjaId);
      await fs.writeFile(ninjaHtmlPath, html);
    }

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
        const jsonStr = objStr.replace(/(\w+):/g, '"$1":').replace(/'/g, '"');
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
    const traitColorDefs = new Map<string, Record<string, string>>();

    for (const ninjaId of ninjaIds) {
      const traits = await getNinjaPreview(ninjaId);
      for (const trait of traits) {
        traitMap.set(trait.trait, trait.id);
        // Collect ST* color defs
        const colorDefs: Record<string, string> = {};
        for (const key in trait) {
          if (typeof key === 'string' && /^ST\d+$/.test(key) && trait[key as keyof TraitConfig]) {
            colorDefs[key] = trait[key as keyof TraitConfig] as string;
          }
        }
        if (Object.keys(colorDefs).length > 0) {
          const existing = traitColorDefs.get(trait.trait);
          if (existing) {
            let corrected = false;
            const existingStr = JSON.stringify(existing);
            const newStr = JSON.stringify(colorDefs);
            if (existingStr !== newStr) {
              let correctValue: Record<string, string> | undefined;
              switch (trait.trait) {
                case 'cat-eyes____dead-cat-eyes-white.svg':
                  correctValue = { ST0: '#000000', ST1: '#EDEDED', ST3: '#000000' };
                  break;
                case 'cat-eyes____dead-cat-eyes-yellow.svg':
                  correctValue = { ST0: '#000000', ST1: '#FFD400', ST3: '#000000' };
                  break;
                case 'hooded-head____hooded-head-blackout-white.svg':
                  correctValue = { ST1: '#000000', ST2: '#EDEDED' };
                  break;
              }

              const correctStr = JSON.stringify(correctValue);
              if (correctValue && existingStr !== correctStr) {
                traitColorDefs.set(trait.trait, correctValue);
                console.warn(
                  `\n[CORRECTED] Trait: ${trait.trait} corrected according to the ${trait.trait} rule.\nOld: ${existingStr}\nNew: ${correctStr}\n`
                );
                corrected = true;
              }
            }
            if (!corrected && existingStr !== newStr) {
              console.error(
                `\n\n[TRAIT COLOR DEF MISMATCH] Trait: ${trait.trait}\nExisting: ${existingStr}\nNew:      ${newStr}\n`
              );
            }
          } else {
            traitColorDefs.set(trait.trait, colorDefs);
          }
        }
      }
    }

    // Convert Map to object for JSON serialization
    const traitObject = Object.fromEntries(traitMap);
    const traitColorDefsObject = Object.fromEntries(traitColorDefs);

    // Save trait mapping to file
    const traitOutputPath = path.join(dataDir, 'trait-mappings.json');
    await fs.writeFile(traitOutputPath, JSON.stringify(traitObject, null, 2));

    // Save trait color defs to file
    const traitColorDefsPath = path.join(dataDir, 'trait-color-defs.json');
    await fs.writeFile(traitColorDefsPath, JSON.stringify(traitColorDefsObject, null, 2));

    console.log(`Successfully saved ${ninjaIds.length} ninja IDs to ${outputPath}`);
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main().catch(console.error);
