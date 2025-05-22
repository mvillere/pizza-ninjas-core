import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface NinjaLayer {
  type: string;
  trait: string;
  id: string;
  ST0?: string;
  ST1?: string;
  [key: string]: any;
}

/**
 * Creates a composite SVG from an inscription ID by loading 
 * the ninja file and its referenced SVG layers
 * 
 * @param {string} inscriptionId - The inscription ID to process
 * @returns {Promise<string>} - The composite SVG content
 */
async function createCompositeSVG(inscriptionId: string): Promise<string> {
  try {
    // Construct paths
    const ninjaFilePath = path.join(__dirname, '..', 'ninjas', 'inscriptions', `${inscriptionId}.html`);
    
    // Read and parse the ninja file
    console.log(`Loading ninja file: ${ninjaFilePath}`);
    const ninjaFile = await fs.readFile(ninjaFilePath, 'utf-8');
    
    // Extract the Ninja.load array using regex
    const loadArrayMatch = ninjaFile.match(/Ninja\.load\(\[([\s\S]*?)\]\)/);
    
    if (!loadArrayMatch || !loadArrayMatch[1]) {
      throw new Error('Could not find Ninja.load array in the file');
    }
    
    // Parse the array content into a proper JSON array
    const layersText = `[${loadArrayMatch[1]}]`;
    const layersJson = layersText.replace(/([a-zA-Z0-9_]+):/g, '"$1":'); // Convert property names to quoted strings for valid JSON
    
    let layers: NinjaLayer[];
    try {
      layers = JSON.parse(layersJson);
    } catch (parseError) {
      console.error('Error parsing layer data:', parseError);
      throw new Error('Failed to parse layer data from ninja file');
    }
    
    // Load all SVG files referenced in the layers
    const svgContents = await Promise.all(
      layers.map(async (layer) => {
        const svgPath = path.join(__dirname, '..', 'art', 'inscriptions', `${layer.id}.svg`);
        console.log(`Loading SVG layer: ${svgPath}`);
        try {
          return await fs.readFile(svgPath, 'utf-8');
        } catch (error) {
          console.warn(`Could not load SVG file: ${svgPath}`, (error as Error).message);
          return null;
        }
      })
    );
    
    // Filter out any null values from SVGs that couldn't be loaded
    const validSvgContents = svgContents.filter((content): content is string => content !== null);
    
    if (validSvgContents.length === 0) {
      throw new Error('No valid SVG files were found');
    }
    
    // Create composite SVG
    // Extract SVG content from each file, removing opening and closing svg tags from all but the first one
    let compositeSvg = '';
    
    for (let i = 0; i < validSvgContents.length; i++) {
      let svgContent = validSvgContents[i];
      
      if (i === 0) {
        // For the first SVG, keep the opening tag but remove the closing tag
        svgContent = svgContent.replace(/<\/svg>\s*$/, '');
        compositeSvg += svgContent;
      } else if (i === validSvgContents.length - 1) {
        // For the last SVG, remove the opening tag but keep the closing tag
        svgContent = svgContent.replace(/^[\s\S]*?<svg[^>]*>/, '');
        compositeSvg += svgContent;
      } else {
        // For middle SVGs, remove both opening and closing tags
        svgContent = svgContent.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
        compositeSvg += svgContent;
      }
    }
    
    // If the first SVG didn't have opening tag or if we need to add background color
    if (!compositeSvg.trim().startsWith('<svg')) {
      // Create a new SVG with the orange background using a rect element
      compositeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <rect width="100%" height="100%" fill="#ff5400"/>
        ${compositeSvg.trim().startsWith('<svg') ? compositeSvg.replace(/^<svg[^>]*>/, '') : compositeSvg}
      </svg>`;
    } else {
      // Insert the background rectangle after the opening SVG tag
      compositeSvg = compositeSvg.replace(/<svg([^>]*)>/, 
        '<svg$1><rect width="100%" height="100%" fill="#ff5400"/>');
    }
    
    // Output directory for the composite SVG
    const outputDir = path.join(__dirname, '..', 'ninjas/vectorized');
    
    // Create output directory if it doesn't exist
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
    
    // Write the composite SVG to a file
    const outputPath = path.join(outputDir, `${inscriptionId}-composite.svg`);
    await fs.writeFile(outputPath, compositeSvg);
    
    console.log(`Successfully created composite SVG: ${outputPath}`);
    return compositeSvg;
  } catch (error) {
    console.error('Error creating composite SVG:', error);
    throw error;
  }
}

/**
 * Main function to run the script
 */
async function main(): Promise<void> {
  // Get inscription ID from command line arguments
  const inscriptionId = process.argv[2];
  
  if (!inscriptionId) {
    console.error('Please provide an inscription ID as an argument.');
    console.error('Usage: npm run vector <inscriptionId>');
    process.exit(1);
  }
  
  try {
    await createCompositeSVG(inscriptionId);
  } catch (error) {
    console.error('Failed to create composite SVG:', (error as Error).message);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 