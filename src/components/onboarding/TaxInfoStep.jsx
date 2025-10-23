import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const TaxInfoStep = ({ data, onUpdate, onValidationChange }) => {
  const [formData, setFormData] = useState({
    taxId: data?.taxId || '',
    taxOffice: data?.taxOffice || ''
  });

  const [errors, setErrors] = useState({});

  // Validate form
  useEffect(() => {
    const newErrors = {};
    
    if (!formData.taxId || formData.taxId.trim().length < 5) {
      newErrors.taxId = 'Tax ID is required (minimum 5 characters)';
    }
    
    // Tax ID format validation (adjust based on your country)
    // Turkish Tax ID is 10-11 digits
    const taxIdPattern = /^[0-9]{10,11}$/;
    if (formData.taxId && !taxIdPattern.test(formData.taxId.replace(/\s/g, ''))) {
      // Only warn, don't block (for international users)
      // newErrors.taxId = 'Please enter a valid tax ID (10-11 digits for Turkish tax ID)';
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tax Information
        </h2>
        <p className="text-gray-600">
          Provide your tax identification details
        </p>
      </div>

      <div className="space-y-4">
        {/* Tax ID */}
        <div>
          <Label htmlFor="taxId" className="text-sm font-medium text-gray-700">
            Tax Identification Number (Vergi No) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="taxId"
            type="text"
            value={formData.taxId}
            onChange={(e) => handleChange('taxId', e.target.value)}
            placeholder="1234567890"
            className="mt-1"
            maxLength={11}
          />
          {errors.taxId && (
            <p className="mt-1 text-sm text-red-600">{errors.taxId}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter your tax identification number (10-11 digits for Turkish tax ID)
          </p>
        </div>

        {/* Tax Office */}
        <div>
          <Label htmlFor="taxOffice" className="text-sm font-medium text-gray-700">
            Tax Office Name (Vergi Dairesi) <span className="text-gray-400">(Optional)</span>
          </Label>
          <Input
            id="taxOffice"
            type="text"
            value={formData.taxOffice}
            onChange={(e) => handleChange('taxOffice', e.target.value)}
            placeholder="e.g., Kadıköy Tax Office"
            className="mt-1"
          />
          <p className="mt-1 text-xs text-gray-500">
            The name of your tax office (if applicable in your jurisdiction)
          </p>
        </div>
      </div>

      {/* Information Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Why we need this information</p>
            <p>Tax information is required for compliance with local tax regulations and for generating legally valid invoices. This information will appear on your invoices.</p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="text-sm text-purple-800">
            <p className="font-medium mb-1">Data Privacy</p>
            <p>Your tax information is stored securely and encrypted. It is only accessible by you and authorized system administrators for support and compliance purposes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxInfoStep;
