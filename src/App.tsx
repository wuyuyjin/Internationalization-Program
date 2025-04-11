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
