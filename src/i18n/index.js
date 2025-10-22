import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        language: 'Language'
      },
      
      // Login/Register Page
      auth: {
        welcomeBack: 'Welcome back',
        createAccount: 'Create your account',
        signInSubtitle: 'Sign in to your Konsiyer dashboard',
        registerSubtitle: 'Start your journey with Konsiyer Enterprise',
        emailAddress: 'Email address',
        password: 'Password',
        enterEmail: 'Enter your email',
        enterPassword: 'Enter your password',
        signIn: 'Sign In',
        createAccount: 'Create Account',
        processing: 'Processing...',
        orContinueWith: 'Or continue with',
        continueWithGoogle: 'Continue with Google',
        alreadyHaveAccount: 'Already have an account? Sign in',
        dontHaveAccount: "Don't have an account? Sign up"
      },
      
      // Dashboard
      dashboard: {
        welcome: 'Welcome to Konsiyer Enterprise',
        subtitle: 'Your dashboard is ready to use.',
        welcomeBack: 'Welcome back! Your shop is connected.',
        shopConnected: 'Your Shopify shop is connected successfully.'
      },

      // Shop Connection
      shop: {
        connectTitle: 'Connect your shop',
        shopifyStore: 'Shopify Store',
        shopifyDescription: 'Connect your Shopify store automatically.',
        otherShops: 'Other Shops',
        otherShopsDescription: 'Connect other shop types using XML or CSV files.',
        shopifyInputPlaceholder: 'Enter your Shopify shop name or domain (e.g., shopname.myshopify.com)',
        connectButton: 'Connect',
        connecting: 'Connecting...',
        shopNamePlaceholder: 'Enter your shop name',
        uploadFiles: 'Upload Files',
        chooseFile: 'Choose File',
        supportedFormats: 'Supported formats: .xml, .csv',
        connectionSuccess: 'Shop connected successfully!',
        connectionError: 'Failed to connect shop. Please try again.',
        invalidShopDomain: 'Please enter a valid Shopify domain (e.g., shopname.myshopify.com)',
        backToOptions: 'Back to options',
        processing: 'Processing...',
        uploadSuccess: 'File uploaded successfully',
        uploadError: 'Failed to upload file'
      },
      
      // Common
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        confirm: 'Confirm',
        initializing: 'Initializing Konsiyer Enterprise...'
      }
    }
  },
  tr: {
    translation: {
      // Navigation
      nav: {
        login: 'Giriş',
        register: 'Kayıt Ol',
        logout: 'Çıkış',
        language: 'Dil'
      },
      
      // Login/Register Page
      auth: {
        welcomeBack: 'Tekrar hoş geldiniz',
        createAccount: 'Hesabınızı oluşturun',
        signInSubtitle: 'Konsiyer panonuza giriş yapın',
        registerSubtitle: 'Konsiyer Enterprise ile yolculuğunuza başlayın',
        emailAddress: 'E-posta adresi',
        password: 'Şifre',
        enterEmail: 'E-posta adresinizi girin',
        enterPassword: 'Şifrenizi girin',
        signIn: 'Giriş Yap',
        createAccount: 'Hesap Oluştur',
        processing: 'İşleniyor...',
        orContinueWith: 'Veya şununla devam edin',
        continueWithGoogle: 'Google ile devam et',
        alreadyHaveAccount: 'Zaten hesabınız var mı? Giriş yapın',
        dontHaveAccount: 'Hesabınız yok mu? Kayıt olun'
      },
      
      // Dashboard
      dashboard: {
        welcome: 'Konsiyer Enterprise\'a Hoş Geldiniz',
        subtitle: 'Panonuz kullanıma hazır.',
        welcomeBack: 'Tekrar hoş geldiniz! Mağazanız bağlı.',
        shopConnected: 'Shopify mağazanız başarıyla bağlandı.'
      },

      // Shop Connection
      shop: {
        connectTitle: 'Mağazanızı bağlayın',
        shopifyStore: 'Shopify Mağazası',
        shopifyDescription: 'Shopify mağazanızı otomatik olarak bağlayın.',
        otherShops: 'Diğer Mağazalar',
        otherShopsDescription: 'XML veya CSV dosyaları kullanarak diğer mağaza türlerini bağlayın.',
        shopifyInputPlaceholder: 'Shopify mağaza adınızı veya domain\'inizi girin (ör: shopname.myshopify.com)',
        connectButton: 'Bağla',
        connecting: 'Bağlanıyor...',
        shopNamePlaceholder: 'Mağaza adınızı girin',
        uploadFiles: 'Dosya Yükle',
        chooseFile: 'Dosya Seç',
        supportedFormats: 'Desteklenen formatlar: .xml, .csv',
        connectionSuccess: 'Mağaza başarıyla bağlandı!',
        connectionError: 'Mağaza bağlanırken hata oluştu. Lütfen tekrar deneyin.',
        invalidShopDomain: 'Lütfen geçerli bir Shopify domain\'i girin (ör: shopname.myshopify.com)',
        backToOptions: 'Seçeneklere dön',
        processing: 'İşleniyor...',
        uploadSuccess: 'Dosya başarıyla yüklendi',
        uploadError: 'Dosya yüklenirken hata oluştu'
      },
      
      // Common
      common: {
        loading: 'Yükleniyor...',
        error: 'Hata',
        success: 'Başarılı',
        cancel: 'İptal',
        save: 'Kaydet',
        edit: 'Düzenle',
        delete: 'Sil',
        confirm: 'Onayla',
        initializing: 'Konsiyer Enterprise başlatılıyor...'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;
