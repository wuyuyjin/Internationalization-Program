# 🌍 Internationalization Program
## 📝 Overview
This project is a multi-language translation solution based on React and i18next, aiming to provide flexible and easy-to-use internationalization support for applications. 🌐

## 🛠️ Tech Stack
- **React**: 🧩 For building user interfaces
- **Vite**: ⚡ As a build tool, providing fast development experience
- **i18next**: 📚 Core internationalization library
- **react-i18next**: 🔗 React integration library
- **i18next-http-backend**: 🌐 Dynamic loading of language resources
- **i18next-browser-languagedetector**: 🔍 Automatic detection of user language

## 📦 What do these packages do?
- **i18next**: 📚 Core library for handling translations and language management
- **react-i18next**: 🔗 React integration library, providing hooks like `useTranslation`
- **i18next-http-backend**: 🌐 Dynamically loads translation resources from remote servers
- **i18next-browser-languagedetector**: 🔍 Automatically detects user's browser language

## 🚀 Installation
In the Create React App project, install these dependencies:
```bash
# using npm
npm install i18next react-i18next i18next-http-backend i18next-browser-languagedetector
```
```bash
# using yarn
yarn add i18next react-i18next i18next-http-backend i18next-browser-languagedetector
```
```bash
# using pnpm
pnpm install i18next react-i18next i18next-http-backend i18next-browser-languagedetector
```

## 📂Project Structure
translationScripts/
├── public/
│   └── locales/             # Language resource files
│       ├── en.json          # English translation file
│       ├── en_backup.json   # English backup empty translation file
│       └── ...              # Other language files
├── src/
│   ├── config/              # Configuration files
│   │   └── localize/        # Localization configuration
│   │       ├── language_locale_list.ts  # Language locale list
│   │       └── translate_and_generate_files.ts  # Translation file generator
│   ├── i18n/                # i18n configuration
│   │   └── index.ts         # i18next initialization
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry
│   └── ChangeLanguage.tsx             # Language drop-down box
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration


## 📥Import the dictionary into your react-i18next config
To dynamically load these resources at runtime, use i18next-http-backend. For example, create an i18n.ts (or .js) file in your project:
```ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    backend: {
      loadPath: '/locales/{{lng}}.json', // Use template string to dynamically load language files, path is under public folder
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    saveMissing: true, // Enable missing key logging
    missingKeyHandler: function(lng, ns, key) {
      console.warn(`Missing translation: ${key} in ${lng}`);
    },
  }, (err, t) => {
    if (err) console.error('i18n initialization failed:', err);
    else console.log('i18n initialization successful');
  });

export default i18n;
```
Then, in your root or index file (e.g., src/index.tsx), import this i18n setup before rendering App:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/index.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </StrictMode>,
)
```

## 📝Create and manage your content statement
Create an en.json and en_backup.json file from ./public , where en.json is the file that needs to record the text you want to translate, and en_backup.json is an empty json file.
The following is a minimal example of en.json and en_backup.json:
```json
// en.json (Corresponding translation text)
{
  "languageTitle": "What is your native language?"
}
```
```json
// en_backup.json (Initialization must be empty)
{}
```
## 🌍Generate text for each country
1. Need to delete "type": "module",
```json
// package.json
{
  "name": "my-app",
  "private": true,
  "version": "0.0.0",
  "type": "module", // Delete this line
}
```
2. Then run yarn run gen in the terminal to generate the corresponding text content for each country. The file will be generated in the "/public/locales" folder. Reminder: Every time you want to update the text content, you need to clear the "en_backup.json" file.
```bash
yarn run gen # or npm run gen # or pnpm run gen
```

## 🏃Run
1. First, check whether there is "type": "module" in the package.json file. If not, add it. This is because it is temporarily deleted when generating the translated text content of various countries. You need to add it back when running the project.

2. Run the project in the terminal.
```bash
yarn dev # or npm run dev # or pnpm run dev
```

## 🛠️Using translations in React components
```tsx
import { useEffect } from 'react'
import './App.css'
import { useTranslation } from 'react-i18next'
import ChangeLanguage from './ChangeLanguage'

function App() {
  const { t, i18n } = useTranslation()
  // Initialization language
  useEffect(() => {
    changeLanguage()
  }, [])

  const changeLanguage = (item?: string) => {
    // Change Language
    i18n.changeLanguage(item)
  }

  return (
    <div>
      <ChangeLanguage />
      {t('languageTitle')}
    </div>
  )
}

export default App
```

## 🤝Contributing
Issues and Pull Requests are welcome to improve the project.