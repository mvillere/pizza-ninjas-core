# Pizza Ninjas Art Processing Architecture

This document describes the art processing workflow for the Pizza Ninjas NFT collection, which handles the extraction and organization of trait data from Bitcoin ordinal inscriptions.

## Overview

The Pizza Ninjas collection consists of 1,500+ unique NFTs stored as Bitcoin ordinal inscriptions. Each ninja is composed of layered SVG art assets that are also stored as individual inscriptions. Our processing pipeline extracts trait information from the ninja HTML files and creates structured mappings between traits, art assets, and their color definitions.

## Workflow Steps

### Step 1: `art-retrieve-inscriptions.ts`
**Purpose**: Retrieve all inscription data from the Rocketship Ordinals node

**Process**:
- **Part A**: Using a root Art asset inscription ID (`05fa463879a6e364082d019b4591c9f687cfabd5bb27849ac0ef94dbcf6cc599i0`), retrieve all art asset SVG files and save them to `./art/inscriptions/`
- **Part B**: Using a root Pizza Ninja asset inscription ID (`80da3cecac858f2757c5b338be15980bdc9d9570d4e86765b4948be8143c82e1i0`), retrieve all ninja HTML files and save them to `./ninjas/inscriptions/`

**Outputs**:
- `./data/art-ids.json` - Array of all art inscription IDs
- `./data/ninja-ids.json` - Array of all ninja inscription IDs  
- `./art/inscriptions/*.svg` - Individual art asset files
- `./ninjas/inscriptions/*.html` - Individual ninja HTML files (player.html format)

### Step 2: `art-retrieve-traits.ts`  
**Purpose**: Extract trait configurations from ninja HTML files

**Process**:
- Parse the `Ninja.load()` array from each ninja's HTML file
- Convert JavaScript objects to `TraitConfig` structures
- Handle special cases (Ralf ninja, trait name normalization, ID corrections)
- Build comprehensive trait mappings and color definitions

**Outputs**:
- `./data/trait-mappings.json` - Maps trait names to inscription IDs (`trait -> id`)
- `./data/trait-color-defs.json` - Maps traits to their ST* color definitions

### Step 3: `art-process-ids.ts`
**Purpose**: Create inverse mappings and identify unused assets

**Process**:
- Load art IDs from Step 1 and trait mappings from Step 2
- Create inverse mapping from inscription IDs to their associated traits
- Identify art assets that aren't used by any ninja (for auditing)

**Outputs**:
- `./data/trait-relationships.json` - Maps inscription IDs to arrays of traits (`id -> traits[]`)
- `./data/art-ids-not-used.json` - Array of unused art inscription IDs

### Step 4: `art-process-traits.ts`
**Purpose**: Create final hierarchical trait mapping structure

**Process**:
- Load trait relationships and color definitions from previous steps
- Group traits by trait group (e.g., "back-accessories", "ninjalerts-face")
- Determine trait roots by analyzing common prefixes among trait variations
- Build final nested structure: `traitgroup -> trait-root -> id -> color -> colorDef`

**Outputs**:
- `./data/trait-root-mapping-v1-0-2.json` - Complete hierarchical trait mapping

## Data Structures

### TraitConfig
```typescript
interface TraitConfig {
  trait: string;           // "traitgroup____traitname.svg"
  id: string;             // Bitcoin inscription ID
  type?: string;          // Asset type classification
  holiday_swap?: string;  // Holiday variant reference
  [key: `ST${number}`]: string | undefined; // Color definitions (ST1, ST2, etc.)
}
```

### Final Mapping Structure
```typescript
{
  [traitgroup: string]: {
    [traitRoot: string]: {
      [inscriptionId: string]: {
        [color: string]: {
          [stKey: string]: string  // ST1: "#hexcolor"
        }
      }
    }
  }
}
```

## Special Handling

### Trait Name Normalization
- Convert underscores to dashes in filenames
- Handle frog-head color positioning (move leading colors to trailing)
- Correct misnamed traits from original collection

### Ralf Ninja (Ninja 1500)
- Special inscription ID: `269730d6cd8c0795317bb8fd043fc7cecb147bb98ae0fed1a1ca9cc646a0c6a2i0`
- Different JSON structure requires predefined trait mappings
- Custom parsing logic to handle malformed HTML structure

### ID Corrections
- Frog head variants use standardized inscription ID
- Dead ninja face variants use corrected inscription IDs
- Ensures consistency across color variations

## NPM Scripts

```bash
npm run art:retrieve-inscriptions  # Step 1: Retrieve all inscriptions
npm run art:retrieve-traits        # Step 2: Extract trait configs  
npm run art:process-ids            # Step 3: Create inverse mappings
npm run art:process-traits         # Step 4: Build final hierarchy
```

## Data Flow

```
Bitcoin Ordinals
       ↓
[Step 1] → art-ids.json + ninja-ids.json + inscription files
       ↓
[Step 2] → trait-mappings.json + trait-color-defs.json
       ↓  
[Step 3] → trait-relationships.json + art-ids-not-used.json
       ↓
[Step 4] → trait-root-mapping-v1-0-2.json
```

This architecture provides a robust foundation for reconstructing the generative art system and enables advanced features like layer ordering and trait analysis. 