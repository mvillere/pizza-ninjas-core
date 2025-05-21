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

/**
 * Normalizes a trait name by:
 * 1. Converting underscores to dashes in the part after the '____' separator
 * 2. Converting uppercase to lowercase in the filename part
 * 3. For frog-head traits, moving leading color tokens to the trailing position
 * For example: 
 * - "back-accessories____ninjato_spirit_pink_yellow.svg" -> "back-accessories____ninjato-spirit-pink-yellow.svg"
 * - "blackout-eyes____Blackout-Scar.svg" -> "blackout-eyes____blackout-scar.svg"
 * - "frog-head____albino-frog-head.svg" -> "frog-head____frog-head-albino.svg"
 */
function normalizeTraitName(traitName: string): string {
  const parts = traitName.split('____');
  if (parts.length !== 2) return traitName;
  
  const [traitGroup, fileName] = parts;
  // Convert underscores to dashes and lowercase the file name part
  let normalizedFileName = fileName.replace(/_/g, '-').toLowerCase();
  
  // Special handling for frog-head traits with leading color
  if (traitGroup === 'frog-head' && normalizedFileName.includes('frog-head')) {
    // Check if the color is at the beginning (e.g., "albino-frog-head.svg")
    const segments = normalizedFileName.replace(/\.svg$/, '').split('-');
    if (segments.length >= 3 && segments[1] === 'frog' && segments[2] === 'head') {
      const color = segments[0];
      const root = 'frog-head';
      // Move color to the end
      normalizedFileName = `${root}-${color}.svg`;
    }
  }
  
  return `${traitGroup}____${normalizedFileName}`;
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
        // Normalize trait name (convert underscores to dashes)
        const originalTrait = trait.trait;
        const normalizedTrait = normalizeTraitName(originalTrait);
        
        if (originalTrait !== normalizedTrait) {
          // Check if this is a frog-head trait with a leading color being moved
          if (originalTrait.includes('frog-head') && 
              originalTrait.includes('frog-head____') && 
              !originalTrait.includes('____frog-head.svg')) {
            console.warn(`[LEADING COLOR MOVED TO TRAILING] ${originalTrait} -> ${normalizedTrait}`);
          } else {
            console.warn(`[TRAIT NAME NORMALIZED] ${originalTrait} -> ${normalizedTrait}`);
          }
          trait.trait = normalizedTrait;
        }
        
        // Correct frog-head IDs - all frog head variants should use the same inscription ID
        if (trait.trait.startsWith('frog-head____frog-head') && 
            trait.id !== '840a103adbc9adb3202d53477fcb0039d5e1935f6f20b91d3e7bbe7fa3a1e1a1i69') {
          const originalId = trait.id;
          trait.id = '840a103adbc9adb3202d53477fcb0039d5e1935f6f20b91d3e7bbe7fa3a1e1a1i69';
          console.warn(`[FROG HEAD ID CORRECTED] ${trait.trait} ID changed from ${originalId} to ${trait.id}`);
        }
        
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
