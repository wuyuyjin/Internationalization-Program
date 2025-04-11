const fs = require('fs');
const path = require('path');
const {Translate} = require('@google-cloud/translate').v2;
const deepDiff = require('deep-diff'); // 检测差异
const LANGUAGE_LOCALE_LIST = require('./language_locale_list'); // 导入语言列表

interface Change {
  key: string;
  value?: any;
}

interface Changes {
  added: Change[];
  modified: Change[];
  removed: Change[];
}

// 谷歌翻译API key
const GOOGLE_CLOUD_TRANSLATE_API_KEY = "AIzaSyCoOOeVKmlRKQPg1dEUQfuOKEKNaKbzUEo";

const translate = new Translate({key: GOOGLE_CLOUD_TRANSLATE_API_KEY});

// 英文文件(主文件)路径
const enFilePath = path.join(__dirname, '../../../public/locales/en.json');
// 主语言文件languageCode
const mainLanguageCode = 'en';
// 英文备份文件路径
const enBackupFilePath = path.join(__dirname, '../../../public/locales/en_backup.json');

// 检查文件是否存在
if (!fs.existsSync(enFilePath)) {
  console.error(`Error: English file not found at ${enFilePath}`);
  process.exit(1); // 退出程序
}
if (!fs.existsSync(enBackupFilePath)) {
  console.error(`Error: English backup file not found at ${enBackupFilePath}`);
  process.exit(1); // 退出程序
}

// 正则匹配变量占位符（格式：{{variable}})，国际化变量插值
const variableRegex = /{{[^}]+}}/g;

// 读取 JSON 文件内容
function readJson(filePath: string): Record<string, any> {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// 写入 JSON 文件内容
function writeJson(filePath: string, content: Record<string, any>): void {
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
}

// 翻译文本并处理占位符
async function translateTextWithPlaceholders(text: string, targetLanguage: string): Promise<string> {
  const placeholders = text.match(variableRegex) || [];
  const textToTranslate = text.replace(variableRegex, (match: string) => `__PLACEHOLDER_${placeholders.indexOf(match as never)}__`);
  const [translatedText] = await translate.translate(textToTranslate, targetLanguage);
  return translatedText.replace(/__PLACEHOLDER_(\d+)__/g, (_: any, index: number) => placeholders[Number(index)]);
}

// 检测变动
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
    const key = diff.path.join('.'); // 将路径数组转换为键名

    if (diff.kind === 'N') {
      changes.added.push({key, value: diff.rhs}); // 新增
    } else if (diff.kind === 'E') {
      changes.modified.push({key, value: diff.rhs}); // 修改
    } else if (diff.kind === 'D') {
      changes.removed.push({key}); // 删除
    }
  });


  return changes;
}

// 同步翻译,并写入到各语言文件，如果全部完成，则更新英文备份文件
const syncTranslations = async (): Promise<void> => {
  try {
    const enContent = readJson(enFilePath);
    const enBackupContent = readJson(enBackupFilePath);
    let changes: Changes = {
      added: [],
      modified: [],
      removed: [],
    }

    // 如果备份文件为空，则将所有当前内容视为新增
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

    // 遍历语言列表，生成翻译文件
    for (const locale of LANGUAGE_LOCALE_LIST) {
      const {google_language_code} = locale;
      // 排除主文件语言的更新
      if(google_language_code === mainLanguageCode) continue

      // 读取目标语言文件
      // const targetFilePath = path.join(__dirname, `../../locales/${google_language_code}.json`);
      const targetFilePath = path.join(__dirname, `../../../public/locales/${google_language_code}.json`);
      // 读取现有内容
      const updatedContent: Record<string, any> = readJson(targetFilePath);

      // 使用 changes 内容更新翻译
      for (const {key, value} of [...changes.added, ...changes.modified]) {
        console.log(`Translating: Key=${key} to ${google_language_code}`);
        updatedContent[key] = await translateTextWithPlaceholders(value, locale.google_language_code);
      }

      // 处理删除的键
      for (const {key} of changes.removed) {
        console.log(`Removing: ${key}`);
        delete updatedContent[key];
      }

      writeJson(targetFilePath, updatedContent);
      console.log(`Completed translation for ${google_language_code}: ${targetFilePath}`);
    }

    // 所有语言翻译完成后，更新英文备份文件
    writeJson(enBackupFilePath, enContent);
    console.log(`[All Success] All translations completed. English Backup File updated: ${enBackupFilePath}`);
  } catch (error) {
    console.error('Error during synchronization:', error);
  }
};

syncTranslations().catch(console.error);
