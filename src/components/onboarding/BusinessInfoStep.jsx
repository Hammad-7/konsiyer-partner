import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useTranslations } from '../../hooks/useTranslations';

const BusinessInfoStep = ({
  businessData = {},
  addressData = {},
  taxData = {},
  onUpdateBusiness,
  onUpdateAddress,
  onUpdateTax,
  onValidationChange
}) => {
  const { t } = useTranslations();
  const [business, setBusiness] = useState({
    brandName: businessData?.brandName || businessData?.name || ''
  });

  const [address, setAddress] = useState({
    street: addressData?.street || '',
    city: addressData?.city || '',
    state: addressData?.state || '',
    postalCode: addressData?.postalCode || '',
    country: addressData?.country || ''
  });

  const [tax, setTax] = useState({
    taxId: taxData?.taxId || '',
    taxOffice: taxData?.taxOffice || ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation rules for combined step
  useEffect(() => {
    const newErrors = {};

    // Brand name required
    if (!business.brandName || business.brandName.trim().length < 2) {
      newErrors.brandName = t('onboarding.brandNameRequired');
    }

    // Address validations
    if (!address.street || address.street.trim().length < 5) {
      newErrors.street = t('onboarding.streetRequired');
    }
    if (!address.city || address.city.trim().length < 2) {
      newErrors.city = t('onboarding.cityRequired');
    }
    if (!address.state || address.state.trim().length < 2) {
      newErrors.state = t('onboarding.stateRequired');
    }
    if (!address.postalCode || address.postalCode.trim().length < 3) {
      newErrors.postalCode = t('onboarding.postalCodeRequired');
    }
    if (!address.country) {
      newErrors.country = t('onboarding.countryRequired');
    }

    // Tax ID: required and must be 10-11 digits
    const cleanedTaxId = (tax.taxId || '').replace(/\s/g, '');
    if (!cleanedTaxId) {
      newErrors.taxId = t('onboarding.taxIdRequired');
    } else if (!/^[0-9]{10,11}$/.test(cleanedTaxId)) {
      newErrors.taxId = t('onboarding.taxIdInvalid');
    }

    setErrors(newErrors);

    const isValid = Object.keys(newErrors).length === 0;
    onValidationChange(isValid);

    // If valid, push updates upstream
    if (isValid) {
      if (onUpdateBusiness) onUpdateBusiness({ name: business.brandName, brandName: business.brandName });
      if (onUpdateAddress) onUpdateAddress(address);
      if (onUpdateTax) onUpdateTax({ taxId: cleanedTaxId, taxOffice: tax.taxOffice });
    }
  }, [business, address, tax, t, onValidationChange, onUpdateBusiness, onUpdateAddress, onUpdateTax]);

  const handleBusinessChange = (field, value) => {
    setBusiness(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleTaxChange = (field, value) => {
    setTax(prev => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('onboarding.businessInfoTitle')}</h2>
        <p className="text-gray-600">{t('onboarding.combineBusinessDetails')}</p>
      </div>

      {/* Business Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('onboarding.businessInfoSection')}</h3>
        <div>
          <Label htmlFor="brandName" className="text-sm font-medium text-gray-700">
            {t('onboarding.brandNameLabel')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="brandName"
            type="text"
            value={business.brandName}
            onChange={(e) => handleBusinessChange('brandName', e.target.value)}
            placeholder={t('onboarding.brandNamePlaceholder')}
            className="mt-1"
            onBlur={() => handleBlur('brandName')}
          />
          {touched.brandName && errors.brandName && <p className="mt-1 text-sm text-red-600">{errors.brandName}</p>}
        </div>
      </div>

      {/* Address Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('onboarding.businessAddress')}</h3>

        <div>
          <Label htmlFor="street" className="text-sm font-medium text-gray-700">{t('onboarding.streetAddress')} <span className="text-red-500">*</span></Label>
          <Input id="street" type="text" value={address.street} onChange={(e) => handleAddressChange('street', e.target.value)} className="mt-1" placeholder={t('onboarding.streetPlaceholder')} onBlur={() => handleBlur('street')} />
          {touched.street && errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city" className="text-sm font-medium text-gray-700">{t('onboarding.city')} <span className="text-red-500">*</span></Label>
            <Input id="city" type="text" value={address.city} onChange={(e) => handleAddressChange('city', e.target.value)} className="mt-1" onBlur={() => handleBlur('city')} />
            {touched.city && errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
          </div>
          <div>
            <Label htmlFor="state" className="text-sm font-medium text-gray-700">{t('onboarding.stateProvince')} <span className="text-red-500">*</span></Label>
            <Input id="state" type="text" value={address.state} onChange={(e) => handleAddressChange('state', e.target.value)} className="mt-1" onBlur={() => handleBlur('state')} />
            {touched.state && errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">{t('onboarding.postalZipCode')} <span className="text-red-500">*</span></Label>
            <Input id="postalCode" type="text" value={address.postalCode} onChange={(e) => handleAddressChange('postalCode', e.target.value)} className="mt-1" onBlur={() => handleBlur('postalCode')} />
            {touched.postalCode && errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
          </div>
          <div>
            <Label htmlFor="country" className="text-sm font-medium text-gray-700">{t('onboarding.country')} <span className="text-red-500">*</span></Label>
            <Input id="country" type="text" value={address.country} onChange={(e) => handleAddressChange('country', e.target.value)} className="mt-1" onBlur={() => handleBlur('country')} />
            {touched.country && errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
          </div>
        </div>
      </div>

      {/* Tax Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('onboarding.taxInfo')}</h3>

        <div>
          <Label htmlFor="taxId" className="text-sm font-medium text-gray-700">{t('onboarding.taxIdLabel')} <span className="text-red-500">*</span></Label>
          <Input id="taxId" type="text" value={tax.taxId} onChange={(e) => handleTaxChange('taxId', e.target.value)} className="mt-1 font-mono" maxLength={11} placeholder={t('onboarding.taxIdPlaceholder')} onBlur={() => handleBlur('taxId')} />
          {touched.taxId && errors.taxId && <p className="mt-1 text-sm text-red-600">{errors.taxId}</p>}
          <p className="mt-1 text-xs text-gray-500">{t('onboarding.taxIdHelp')}</p>
        </div>

        <div>
          <Label htmlFor="taxOffice" className="text-sm font-medium text-gray-700">{t('onboarding.taxOfficeName')} <span className="text-gray-400">({t('onboarding.taxOfficeOptional')})</span></Label>
          <Input id="taxOffice" type="text" value={tax.taxOffice} onChange={(e) => handleTaxChange('taxOffice', e.target.value)} className="mt-1" placeholder={t('onboarding.taxOfficePlaceholder')} />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">{t('onboarding.whyWeNeedThis')}</p>
            <p>{t('onboarding.whyWeNeedThisDescription')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessInfoStep;
