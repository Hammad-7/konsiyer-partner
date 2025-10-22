import { useTranslation } from 'react-i18next';

export const useTranslations = () => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };
  
  const currentLanguage = i18n.language;
  
  return {
    t,
    changeLanguage,
    currentLanguage,
    isEnglish: currentLanguage === 'en',
    isTurkish: currentLanguage === 'tr'
  };
};