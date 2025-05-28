import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getChildrenInscriptions, getInscriptionPreview } from './utils/ord.js';

// Root inscription IDs
const ROOT_ART_ASSET = '05fa463879a6e364082d019b4591c9f687cfabd5bb27849ac0ef94dbcf6cc599i0';
const NINJA_PARENT = '80da3cecac858f2757c5b338be15980bdc9d9570d4e86765b4948be8143c82e1i0';

// ESM way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadArtAsset(artId: string): Promise<void> {
  try {
    // Save SVG to ./art/inscriptions/<artId>.svg
    const artAsset = await getInscriptionPreview(artId);
    const artDir = path.join(__dirname, '..', 'art/inscriptions');
    await fs.mkdir(artDir, { recursive: true });
    const artSvgPath = path.join(artDir, `${artId}.svg`);
    await fs.writeFile(artSvgPath, artAsset);
  } catch (error) {
    console.error(`Error fetching art asset ${artId}:`, error);
  }
}

async function downloadNinjaHtml(ninjaId: string): Promise<void> {
  try {
    // Check if ninja HTML already exists on disk
    const ninjaDir = path.join(__dirname, '..', 'ninjas/inscriptions');
    await fs.mkdir(ninjaDir, { recursive: true });
    const ninjaHtmlPath = path.join(ninjaDir, `${ninjaId}.html`);

    try {
      // Check if file already exists
      await fs.access(ninjaHtmlPath);
      console.log(`Ninja ${ninjaId} already exists, skipping download`);
      return;
    } catch {
      // File doesn't exist, proceed with download
    }

    // Save HTML to ./ninjas/inscriptions/<ninjaId>.html
    const ninjaHtml = await getInscriptionPreview(ninjaId);
    await fs.writeFile(ninjaHtmlPath, ninjaHtml);
    console.log(`Downloaded ninja ${ninjaId}`);
  } catch (error) {
    console.error(`Error fetching ninja ${ninjaId}:`, error);
  }
}

async function main() {
  try {
    console.log('Starting inscription retrieval process...');

    // Ensure data directory exists
    const dataDir = path.join(__dirname, '../data');
    await fs.mkdir(dataDir, { recursive: true });

    // Part A: Retrieve art assets
    console.log('Fetching art asset inscription IDs...');
    const artIds = await getChildrenInscriptions(ROOT_ART_ASSET);

    const artIdsPath = path.join(dataDir, 'art-ids.json');
    await fs.writeFile(artIdsPath, JSON.stringify(artIds, null, 2));
    console.log(`Found ${artIds.length} art assets`);

    console.log('Downloading art assets...');
    for (const artId of artIds) {
      await downloadArtAsset(artId);
    }
    console.log(`Successfully downloaded ${artIds.length} art assets`);

    // Part B: Retrieve ninja inscriptions
    console.log('Fetching ninja inscription IDs...');
    const ninjaIds = await getChildrenInscriptions(NINJA_PARENT);

    const ninjaIdsPath = path.join(dataDir, 'ninja-ids.json');
    await fs.writeFile(ninjaIdsPath, JSON.stringify(ninjaIds, null, 2));
    console.log(`Found ${ninjaIds.length} ninjas`);

    console.log('Downloading ninja HTML files...');
    for (const ninjaId of ninjaIds) {
      await downloadNinjaHtml(ninjaId);
    }
    console.log(`Successfully processed ${ninjaIds.length} ninjas`);

    console.log('\n=== Inscription Retrieval Complete ===');
    console.log(`Art IDs saved to: ${artIdsPath}`);
    console.log(`Ninja IDs saved to: ${ninjaIdsPath}`);
    console.log('Art assets saved to: ./art/inscriptions/');
    console.log('Ninja HTML files saved to: ./ninjas/inscriptions/');
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main().catch(console.error);
