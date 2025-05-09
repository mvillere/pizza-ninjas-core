import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getChildrenInscriptions, getInscriptionPreview } from './utils/ord.js';

const ROOT_ART_ASSET = '05fa463879a6e364082d019b4591c9f687cfabd5bb27849ac0ef94dbcf6cc599i0';

// ESM way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadArtAsset(artId: string): Promise<void> {
  try {
    // Save HTML to ./ninjas/<ninjaId>.html
    const artAsset = await getInscriptionPreview(artId);
    const artHtmlPath = path.join(__dirname, '..', 'art/inscriptions', `${artId}.svg`);
    await fs.writeFile(artHtmlPath, artAsset);
  } catch (error) {
    console.error(`Error fetching preview for ${artId}:`, error);
  }
}

async function main() {
  try {
    console.log('Fetching art asset inscription IDs...');
    const artIds = await getChildrenInscriptions(ROOT_ART_ASSET);

    const dataDir = path.join(__dirname, '../data');
    await fs.mkdir(dataDir, { recursive: true });

    const outputPath = path.join(dataDir, 'art-ids.json');
    await fs.writeFile(outputPath, JSON.stringify(artIds, null, 2));

    for (const artId of artIds) {
      await downloadArtAsset(artId);
    }

    console.log(`Successfully saved ${artIds.length} art IDs to ${outputPath}`);
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main().catch(console.error);
