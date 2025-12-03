import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useTranslations } from '../../hooks/useTranslations';

const PaymentInfoStep = ({ data, onUpdate, onValidationChange }) => {
  const { t } = useTranslations();
  const [formData, setFormData] = useState({
    method: data?.method || 'credit_card',
    cardToken: data?.cardToken || '' // Will be used later with payment provider
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validate form
  useEffect(() => {
    const newErrors = {};
    
    if (!formData.method) {
      newErrors.method = t('onboarding.paymentMethodRequired');
    }
    
    // No bank transfer option in redesigned flow; only ensure a method is selected

    setErrors(newErrors);
    
    // Notify parent of validation status
    const isValid = Object.keys(newErrors).length === 0;
    onValidationChange(isValid);
    
    // Auto-save to parent
    if (isValid) {
      onUpdate(formData);
    }
  }, [formData]); // Remove onUpdate and onValidationChange from dependencies

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBankDetailChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value
      }
    }));
  };

  // Format IBAN with spaces for better readability
  const formatIBAN = (iban) => {
    const cleaned = iban.replace(/\s/g, '');
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('onboarding.paymentInfoTitle')}
        </h2>
        <p className="text-gray-600">
          {t('onboarding.choosePreferredPayment')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Payment Method Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            {t('onboarding.paymentMethod')} <span className="text-red-500">*</span>
          </Label>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Only credit card option is available for now */}
            <div
              onClick={() => handleChange('method', 'credit_card')}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                formData.method === 'credit_card'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  formData.method === 'credit_card'
                    ? 'border-indigo-500'
                    : 'border-gray-300'
                }`}>
                  {formData.method === 'credit_card' && (
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('onboarding.creditCard')}</p>
                  <p className="text-xs text-gray-500">{t('onboarding.creditCardDescription')}</p>
                </div>
              </div>
            </div>
          </div>
          
          {touched.method && errors.method && (
            <p className="mt-2 text-sm text-red-600">{errors.method}</p>
          )}
        </div>

        {/* Bank transfer removed — no bank details to collect in this flow */}

        {/* Credit Card - Demo Only */}
        {formData.method === 'credit_card' && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">
                  {t('onboarding.demoModeTitle')}
                </h3>
                <p className="text-sm text-yellow-800 mb-3">
                  {t('onboarding.demoModeDescription')}
                </p>
                <p className="text-sm text-yellow-800 font-medium">
                  {t('onboarding.demoModeNote')}
                </p>
              </div>
            </div>
            
            {/* Demo Card Input (non-functional) */}
            <div className="mt-4 space-y-3 opacity-60 pointer-events-none">
              <Input
                type="text"
                placeholder={t('onboarding.cardNumberDemo')}
                className="font-mono"
                disabled
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  placeholder="MM/YY"
                  disabled
                />
                <Input
                  type="text"
                  placeholder="CVV"
                  disabled
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Update Information Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">{t('onboarding.paymentInfoUpdateTitle')}</p>
            <p>{t('onboarding.paymentInfoUpdateDescription')}</p>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">{t('onboarding.paymentSecurityTitle')}</p>
            <p>{t('onboarding.paymentSecurityDescription')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfoStep;
