import { useTranslations } from '../hooks/useTranslations';

const LoadingSpinner = ({ size = 'md', text, className = '' }) => {
  const { t } = useTranslations();
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // Only show text if text is explicitly provided and not an empty string
  const displayText = text === undefined ? t('common.loading') : text;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600 ${sizeClasses[size]} ${className}`}></div>
      {displayText && (
        <p className="mt-3 text-sm text-gray-600 font-medium">{displayText}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
