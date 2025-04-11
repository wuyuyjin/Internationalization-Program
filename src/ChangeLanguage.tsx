import { useTranslation } from "react-i18next"

const ChangeLanguage = () => {
    const { i18n } = useTranslation()
    const languageKeys = [
        { code: 'en', name: 'English' },
        { code: 'zh', name: '中文' },
        { code: 'es', name: 'Español' },
        { code: 'tr', name: 'Türkçe' },
        { code: 'pt', name: 'Português' },
        { code: 'fr', name: 'Français' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'de', name: 'Deutsch' },
        { code: 'it', name: 'Italiano' },
        { code: 'uk', name: 'Українська' },
        { code: 'ru', name: 'Русский' },
        { code: 'ja', name: '日本語' },
        { code: 'ko', name: '한국어' },
        { code: 'ar', name: 'العربية' },
        { code: 'bn', name: 'বাংলা' },
        { code: 'ur', name: 'اردو' },
        { code: 'fa', name: 'فارسی' },
        { code: 'th', name: 'ไทย' },
        { code: 'vi', name: 'Tiếng Việt' },
        { code: 'id', name: 'Bahasa Indonesia' },
        { code: 'ms', name: 'Bahasa Melayu' },
        { code: 'fil', name: 'Filipino' },
        { code: 'sw', name: 'Kiswahili' },
        { code: 'am', name: 'አማርኛ' },
        { code: 'el', name: 'Ελληνικά' },
        { code: 'nl', name: 'Nederlands' },
        { code: 'da', name: 'Dansk' },
        { code: 'sv', name: 'Svenska' },
        { code: 'no', name: 'Norsk' },
        { code: 'fi', name: 'Suomi' },
        { code: 'is', name: 'Íslenska' },
        { code: 'hu', name: 'Magyar' },
        { code: 'pl', name: 'Polski' },
        { code: 'cs', name: 'Čeština' },
        { code: 'sl', name: 'Slovenščina' },
        { code: 'sk', name: 'Slovenčina' },
        { code: 'hr', name: 'Hrvatski' },
        { code: 'bg', name: 'Български' },
        { code: 'ro', name: 'Română' },
        { code: 'sr', name: 'Српски' },
        { code: 'mk', name: 'Македонски' },
        { code: 'sq', name: 'Shqip' },
        { code: 'he', name: 'עברית' },
        { code: 'ta', name: 'தமிழ்' }
    ];

    const handleChangeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // 处理语言切换逻辑
        console.log(e.target.value)
        changeLanguage(e.target.value)
    }

    const changeLanguage = (item?: string) => {
        console.log(item);
        i18n.changeLanguage(item)
    }

    return (
        <div>
            <span>Language</span>
            <select onChange={(e) => handleChangeLanguage(e)}>
                {
                    languageKeys.map((item, index) => {
                        return (
                            <option key={index} value={item.code}>{item.name}</option>
                        )
                    })
                }
            </select>
        </div>
    )

}

export default ChangeLanguage