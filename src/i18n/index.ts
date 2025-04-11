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
      loadPath: '/locales/{{lng}}.json', // 使用模板字符串, 动态加载语言文件，路径是在public文件夹下
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    saveMissing: true, // 启用缺失键记录
    missingKeyHandler: function(lng, ns, key) {
      console.warn(`Missing translation: ${key} in ${lng}`);
    },
  }, (err, t) => {
    if (err) console.error('i18n初始化失败:', err);
    else console.log('i18n初始化成功');
  });

export default i18n;
