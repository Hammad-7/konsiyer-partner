import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const PaymentInfoStep = ({ data, onUpdate, onValidationChange }) => {
  const [formData, setFormData] = useState({
    method: data?.method || '',
    bankDetails: data?.bankDetails || {
      bankName: '',
      iban: '',
      accountHolder: ''
    },
    cardToken: data?.cardToken || '' // Will be used later with payment provider
  });

  const [errors, setErrors] = useState({});

  // Validate form
  useEffect(() => {
    const newErrors = {};
    
    if (!formData.method) {
      newErrors.method = 'Payment method is required';
    }
    
    if (formData.method === 'bank_transfer') {
      if (!formData.bankDetails.bankName || formData.bankDetails.bankName.trim().length < 2) {
        newErrors.bankName = 'Bank name is required';
      }
      
      if (!formData.bankDetails.iban || formData.bankDetails.iban.trim().length < 15) {
        newErrors.iban = 'Valid IBAN is required (minimum 15 characters)';
      }
      
      // Basic IBAN format validation (alphanumeric)
      const ibanPattern = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/i;
      if (formData.bankDetails.iban && !ibanPattern.test(formData.bankDetails.iban.replace(/\s/g, ''))) {
        newErrors.iban = 'Invalid IBAN format';
      }
      
      if (!formData.bankDetails.accountHolder || formData.bankDetails.accountHolder.trim().length < 2) {
        newErrors.accountHolder = 'Account holder name is required';
      }
    }

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
          Payment Information
        </h2>
        <p className="text-gray-600">
          Choose your preferred payment method
        </p>
      </div>

      <div className="space-y-4">
        {/* Payment Method Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Payment Method <span className="text-red-500">*</span>
          </Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bank Transfer Option */}
            <div
              onClick={() => handleChange('method', 'bank_transfer')}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                formData.method === 'bank_transfer'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  formData.method === 'bank_transfer'
                    ? 'border-indigo-500'
                    : 'border-gray-300'
                }`}>
                  {formData.method === 'bank_transfer' && (
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Bank Transfer</p>
                  <p className="text-xs text-gray-500">Pay via bank transfer</p>
                </div>
              </div>
            </div>

            {/* Credit Card Option */}
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
                  <p className="font-medium text-gray-900">Credit Card</p>
                  <p className="text-xs text-gray-500">Pay with credit card</p>
                </div>
              </div>
            </div>
          </div>
          
          {errors.method && (
            <p className="mt-2 text-sm text-red-600">{errors.method}</p>
          )}
        </div>

        {/* Bank Transfer Details */}
        {formData.method === 'bank_transfer' && (
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900">Bank Account Details</h3>
            
            {/* Bank Name */}
            <div>
              <Label htmlFor="bankName" className="text-sm font-medium text-gray-700">
                Bank Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bankName"
                type="text"
                value={formData.bankDetails.bankName}
                onChange={(e) => handleBankDetailChange('bankName', e.target.value)}
                placeholder="e.g., İş Bankası, Garanti BBVA"
                className="mt-1"
              />
              {errors.bankName && (
                <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
              )}
            </div>

            {/* IBAN */}
            <div>
              <Label htmlFor="iban" className="text-sm font-medium text-gray-700">
                IBAN <span className="text-red-500">*</span>
              </Label>
              <Input
                id="iban"
                type="text"
                value={formData.bankDetails.iban}
                onChange={(e) => handleBankDetailChange('iban', e.target.value.toUpperCase())}
                onBlur={(e) => handleBankDetailChange('iban', formatIBAN(e.target.value))}
                placeholder="TR33 0006 1005 1978 6457 8413 26"
                className="mt-1 font-mono"
                maxLength={34}
              />
              {errors.iban && (
                <p className="mt-1 text-sm text-red-600">{errors.iban}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                International Bank Account Number
              </p>
            </div>

            {/* Account Holder */}
            <div>
              <Label htmlFor="accountHolder" className="text-sm font-medium text-gray-700">
                Account Holder Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="accountHolder"
                type="text"
                value={formData.bankDetails.accountHolder}
                onChange={(e) => handleBankDetailChange('accountHolder', e.target.value)}
                placeholder="Full name as it appears on the account"
                className="mt-1"
              />
              {errors.accountHolder && (
                <p className="mt-1 text-sm text-red-600">{errors.accountHolder}</p>
              )}
            </div>
          </div>
        )}

        {/* Credit Card - Demo Only */}
        {formData.method === 'credit_card' && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Demo Mode - Payment Integration Coming Soon
                </h3>
                <p className="text-sm text-yellow-800 mb-3">
                  Credit card payment integration is currently under development. You can select this option now, but actual payment processing will be available in a future update.
                </p>
                <p className="text-sm text-yellow-800 font-medium">
                  For now, you can proceed with this selection and we'll notify you when the integration is ready. You can also update your payment method later in your account settings.
                </p>
              </div>
            </div>
            
            {/* Demo Card Input (non-functional) */}
            <div className="mt-4 space-y-3 opacity-60 pointer-events-none">
              <Input
                type="text"
                placeholder="Card Number (Demo - Not Functional)"
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
            <p className="font-medium mb-1">You can update payment information later</p>
            <p>Your payment information can be updated anytime in your account settings after completing the onboarding process.</p>
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
            <p className="font-medium mb-1">Bank Details Security</p>
            <p>Your bank account information is encrypted and stored securely. We never store credit card numbers directly - all card processing uses secure tokenization.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfoStep;
