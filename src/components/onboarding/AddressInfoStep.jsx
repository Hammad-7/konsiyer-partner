import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useTranslations } from '../../hooks/useTranslations';

const AddressInfoStep = ({ data, onUpdate, onValidationChange }) => {
  const { t } = useTranslations();
  const [formData, setFormData] = useState({
    street: data?.street || '',
    city: data?.city || '',
    state: data?.state || '',
    postalCode: data?.postalCode || '',
    country: data?.country || ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Common countries
  const countries = [
    { value: 'TR', label: 'Turkey' },
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'IT', label: 'Italy' },
    { value: 'ES', label: 'Spain' },
    { value: 'NL', label: 'Netherlands' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'other', label: 'Other' }
  ];

  // Validate form
  useEffect(() => {
    const newErrors = {};
    
    if (!formData.street || formData.street.trim().length < 5) {
      newErrors.street = t('onboarding.streetRequired');
    }
    
    if (!formData.city || formData.city.trim().length < 2) {
      newErrors.city = t('onboarding.cityRequired');
    }

    if (!formData.state || formData.state.trim().length < 2) {
      newErrors.state = t('onboarding.stateRequired');
    }

    if (!formData.postalCode || formData.postalCode.trim().length < 3) {
      newErrors.postalCode = t('onboarding.postalCodeRequired');
    }

    if (!formData.country) {
      newErrors.country = t('onboarding.countryRequired');
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

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Business Address
        </h2>
        <p className="text-gray-600">
          Provide your complete business address
        </p>
      </div>

      <div className="space-y-4">
        {/* Street Address */}
        <div>
          <Label htmlFor="street" className="text-sm font-medium text-gray-700">
            Street Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="street"
            type="text"
            value={formData.street}
            onChange={(e) => handleChange('street', e.target.value)}
            placeholder="123 Main Street, Suite 100"
            className="mt-1"
            onBlur={() => handleBlur('street')}
          />
          {touched.street && errors.street && (
            <p className="mt-1 text-sm text-red-600">{errors.street}</p>
          )}
        </div>

        {/* City and State (side by side on larger screens) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city" className="text-sm font-medium text-gray-700">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Istanbul"
              className="mt-1"
              onBlur={() => handleBlur('city')}
            />
            {touched.city && errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>

          <div>
            <Label htmlFor="state" className="text-sm font-medium text-gray-700">
              State/Province <span className="text-red-500">*</span>
            </Label>
            <Input
              id="state"
              type="text"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="Istanbul"
              className="mt-1"
              onBlur={() => handleBlur('state')}
            />
            {touched.state && errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state}</p>
            )}
          </div>
        </div>

        {/* Postal Code and Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
              Postal/ZIP Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="postalCode"
              type="text"
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              placeholder="34000"
              className="mt-1"
              onBlur={() => handleBlur('postalCode')}
            />
            {touched.postalCode && errors.postalCode && (
              <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
            )}
          </div>

          <div>
            <Label htmlFor="country" className="text-sm font-medium text-gray-700">
              Country <span className="text-red-500">*</span>
            </Label>
            <select
              id="country"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              onBlur={() => handleBlur('country')}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
            {touched.country && errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country}</p>
            )}
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
            <p className="font-medium mb-1">Data Security</p>
            <p>Your address information is encrypted and stored securely. It will only be used for invoice generation and will not be shared with third parties.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressInfoStep;
