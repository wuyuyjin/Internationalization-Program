import { useEffect } from 'react'
import './App.css'
import i18n from './i18n'
import { I18nextProvider, useTranslation } from 'react-i18next'
import ChangeLanguage from './ChangeLanguage'

function App() {
  const { t } = useTranslation()
  // 初始化语言
  useEffect(() => {
    changeLanguage()
  }, [])
  const changeLanguage = (item?: string) => {
    i18n.changeLanguage(item)
  }
  return (
    <I18nextProvider i18n={i18n}>
      <ChangeLanguage />
      <div>
        {t('languageTitle')}
      </div>
    </I18nextProvider>
  )
}

export default App
