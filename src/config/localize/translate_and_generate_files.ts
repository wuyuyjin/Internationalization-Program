const fs = require('fs');
const path = require('path');
const {Translate} = require('@google-cloud/translate').v2;
const deepDiff = require('deep-diff'); // Detecting differences
const LANGUAGE_LOCALE_LIST = require('./language_locale_list'); // Importing a language list

interface Change {
  key: string;
  value?: any;
}

interface Changes {
  added: Change[];
  modified: Change[];
  removed: Change[];
}

// Google Translate API key
const GOOGLE_CLOUD_TRANSLATE_API_KEY = "AIzaSyCoOOeVKmlRKQPg1dEUQfuOKEKNaKbzUEo";

const translate = new Translate({key: GOOGLE_CLOUD_TRANSLATE_API_KEY});

// Path to the English file (main file)
const enFilePath = path.join(__dirname, '../../../public/locales/en.json');
// Main language code
const mainLanguageCode = 'en';
// Path to the English backup file
const enBackupFilePath = path.join(__dirname, '../../../public/locales/en_backup.json');

// Check if files exist
if (!fs.existsSync(enFilePath)) {
  console.error(`Error: English file not found at ${enFilePath}`);
  process.exit(1); // Exit the program
}
if (!fs.existsSync(enBackupFilePath)) {
  console.error(`Error: English backup file not found at ${enBackupFilePath}`);
  process.exit(1); // Exit the program
}

// Regex to match variable placeholders (format: {{variable}}), used for i18n variable interpolation
const variableRegex = /{{[^}]+}}/g;

// Read JSON file content
function readJson(filePath: string): Record<string, any> {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Write JSON file content
function writeJson(filePath: string, content: Record<string, any>): void {
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
}

// Translate text while preserving placeholders
async function translateTextWithPlaceholders(text: string, targetLanguage: string): Promise<string> {
  const placeholders = text.match(variableRegex) || [];
  const textToTranslate = text.replace(variableRegex, (match: string) => `__PLACEHOLDER_${placeholders.indexOf(match as never)}__`);
  const [translatedText] = await translate.translate(textToTranslate, targetLanguage);
  return translatedText.replace(/__PLACEHOLDER_(\d+)__/g, (_: any, index: number) => placeholders[Number(index)]);
}

// Detect changes between new and old content
function detectChanges(newContent: Record<string, any>, oldContent: Record<string, any>): {
  added: any[],
  modified: any[],
  removed: any[]
} {
  const diffs = deepDiff.diff(oldContent, newContent) || [];
  const changes: Changes = {
    added: [],
    modified: [],
    removed: [],
  };

  diffs.forEach((diff: any) => {
    const key = diff.path.join('.'); // Convert path array to key name

    if (diff.kind === 'N') {
      changes.added.push({key, value: diff.rhs}); // Added
    } else if (diff.kind === 'E') {
      changes.modified.push({key, value: diff.rhs}); // Modified
    } else if (diff.kind === 'D') {
      changes.removed.push({key}); // Deleted
    }
  });

  return changes;
}

// Synchronize translations and write to language files, update English backup file when complete
const syncTranslations = async (): Promise<void> => {
  try {
    const enContent = readJson(enFilePath);
    const enBackupContent = readJson(enBackupFilePath);
    let changes: Changes = {
      added: [],
      modified: [],
      removed: [],
    }

    // If backup file is empty, treat all current content as new changes
    if (Object.keys(enBackupContent).length === 0) {
      console.warn(`Warning: English backup file is empty. Treating all current content as new changes.`);
      changes = {
        added: Object.keys(enContent).map(key => ({key, value: enContent[key]})),
        modified: [],
        removed: [],
      };
    } else {
      changes = detectChanges(enContent, enBackupContent);
    }

    if (Object.keys(changes).length === 0) {
      console.log('No changes detected. Exiting.')
      return
    }

    // Iterate through language list to generate translation files
    for (const locale of LANGUAGE_LOCALE_LIST) {
      const {google_language_code} = locale;
      // Skip updates for the main language file
      if(google_language_code === mainLanguageCode) continue

      // Read target language file
      const targetFilePath = path.join(__dirname, `../../../public/locales/${google_language_code}.json`);
      // Read existing content
      const updatedContent: Record<string, any> = readJson(targetFilePath);

      // Update translations using changes content
      for (const {key, value} of [...changes.added, ...changes.modified]) {
        console.log(`Translating: Key=${key} to ${google_language_code}`);
        updatedContent[key] = await translateTextWithPlaceholders(value, locale.google_language_code);
      }

      // Handle deleted keys
      for (const {key} of changes.removed) {
        console.log(`Removing: ${key}`);
        delete updatedContent[key];
      }

      writeJson(targetFilePath, updatedContent);
      console.log(`Completed translation for ${google_language_code}: ${targetFilePath}`);
    }

    // After all translations are complete, update the English backup file
    writeJson(enBackupFilePath, enContent);
    console.log(`[All Success] All translations completed. English Backup File updated: ${enBackupFilePath}`);
  } catch (error) {
    console.error('Error during synchronization:', error);
  }
};

syncTranslations().catch(console.error);
