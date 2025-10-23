import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';

const BusinessInfoStep = ({ data, onUpdate, onValidationChange }) => {
  const [formData, setFormData] = useState({
    type: data?.type || '',
    name: data?.name || '',
    legalStructure: data?.legalStructure || ''
  });

  const [errors, setErrors] = useState({});

  // Business types
  const businessTypes = [
    { value: 'individual', label: 'Individual' },
    { value: 'company', label: 'Company/Business Entity' },
    { value: 'sole_proprietor', label: 'Sole Proprietor' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'corporation', label: 'Corporation' },
    { value: 'llc', label: 'Limited Liability Company (LLC)' }
  ];

  // Validate form
  useEffect(() => {
    const newErrors = {};
    
    if (!formData.type) {
      newErrors.type = 'Business type is required';
    }
    
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name is required (minimum 2 characters)';
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
          Business Information
        </h2>
        <p className="text-gray-600">
          Tell us about your business entity
        </p>
      </div>

      <div className="space-y-4">
        {/* Business Type */}
        <div>
          <Label htmlFor="businessType" className="text-sm font-medium text-gray-700">
            Business Type <span className="text-red-500">*</span>
          </Label>
          <select
            id="businessType"
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select business type</option>
            {businessTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type}</p>
          )}
        </div>

        {/* Business/Client Name */}
        <div>
          <Label htmlFor="businessName" className="text-sm font-medium text-gray-700">
            {formData.type === 'individual' ? 'Full Name' : 'Company Name'} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="businessName"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder={formData.type === 'individual' ? 'John Doe' : 'Acme Corporation'}
            className="mt-1"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.type === 'individual' 
              ? 'Enter your full legal name as it appears on official documents'
              : 'Enter your company\'s legal name'}
          </p>
        </div>

        {/* Legal Structure (optional for companies) */}
        {formData.type !== 'individual' && (
          <div>
            <Label htmlFor="legalStructure" className="text-sm font-medium text-gray-700">
              Legal Structure (Optional)
            </Label>
            <Input
              id="legalStructure"
              type="text"
              value={formData.legalStructure}
              onChange={(e) => handleChange('legalStructure', e.target.value)}
              placeholder="e.g., Limited Liability Company, Private Limited"
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">
              Additional details about your business structure
            </p>
          </div>
        )}
      </div>

      {/* Information Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Why we need this information</p>
            <p>This information is required for generating accurate invoices and ensuring compliance with tax regulations. Your data is securely stored and only accessible by you and authorized administrators.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessInfoStep;
