import axios from 'axios';

const BASE_URL = 'https://app.pizzapets.fun';

export async function getChildrenInscriptions(parentId: string): Promise<string[]> {
  let allIds: string[] = [];
  let page = 0;
  let more = true;

  while (more) {
    const url = `${BASE_URL}/r/children/${parentId}/${page}`;
    try {
      const response = await axios.get(url, {
        headers: { Accept: 'application/json' },
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

export async function getInscriptionPreview(inscriptionId: string): Promise<string> {
  console.log(`Retrieving ${inscriptionId} from Ord node.`);
  try {
    const response = await axios.get(`${BASE_URL}/preview/${inscriptionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching preview for ${inscriptionId}:`, error);
    throw error;
  }
}
