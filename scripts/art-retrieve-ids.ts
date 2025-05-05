import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT_ART_ASSET = '05fa463879a6e364082d019b4591c9f687cfabd5bb27849ac0ef94dbcf6cc599i0';
const BASE_URL = 'https://app.pizzapets.fun';

// ESM way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getChildrenInscriptions(parentId: string): Promise<string[]> {
    let allIds: string[] = [];
    let page = 0;
    let more = true;

    while (more) {
        const url = `${BASE_URL}/r/children/${parentId}/${page}`;
        try {
            const response = await axios.get(url, {
                headers: { 'Accept': 'application/json' }
            });
            const data = response.data;
            if (Array.isArray(data.ids)) {
                allIds.push(...data.ids);
            }
            more = !!data.more;
            page = data.page + 1;
        } catch (error) {
            console.error(`Error fetching children for ${parentId} on page ${page}:`, error);
            throw error;
        }
    }

    return allIds;
}

async function main() {
    try {
        console.log('Fetching art asset inscription IDs...');
        const artIds = await getChildrenInscriptions(ROOT_ART_ASSET);

        // Use __dirname for ESM
        const dataDir = path.join(__dirname, '../data');
        await fs.mkdir(dataDir, { recursive: true });

        // Save to JSON file
        const outputPath = path.join(dataDir, 'art-ids.json');
        await fs.writeFile(outputPath, JSON.stringify(artIds, null, 2));

        console.log(`Successfully saved ${artIds.length} art IDs to ${outputPath}`);
    } catch (error) {
        console.error('Error in main:', error);
        process.exit(1);
    }
}

main().catch(console.error); 