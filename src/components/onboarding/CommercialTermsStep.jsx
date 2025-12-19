import { useEffect, useState } from 'react';
import { formatPaymentMethod } from '../../services/onboardingService';
import { useTranslations } from '../../hooks/useTranslations';

const CommercialTermsStep = ({ data, onValidationChange }) => {
  const { t } = useTranslations();
  const { businessInfo, addressInfo, taxInfo, paymentInfo } = data;
  const [informationAccurate, setInformationAccurate] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Commercial terms (would typically come from backend/config)
  const commercialTerms = {
    commissionRate: '8%',
    attributionWindow: '14',
    paymentSchedule: 'Monthly',
    effectiveDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  };

  // Update validation based on both checkboxes
  useEffect(() => {
    onValidationChange(informationAccurate && termsAccepted);
  }, [informationAccurate, termsAccepted, onValidationChange]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('onboarding.commercialTerms.title')}
        </h2>
        <p className="text-gray-600">
          {t('onboarding.commercialTerms.subtitle')}
        </p>
      </div>

      {/* Business Information Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {t('onboarding.businessInfoTitle')}
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('onboarding.companyLegalName')}</dt>
            <dd className="mt-1 text-sm text-gray-900">{businessInfo?.companyLegalName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('onboarding.brandName')}</dt>
            <dd className="mt-1 text-sm text-gray-900">{businessInfo?.name || businessInfo?.brandName}</dd>
          </div>
        </dl>
      </div>

      {/* Address Information Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {t('onboarding.businessAddress')}
        </h3>
        <div className="text-sm text-gray-900">
          <p>{addressInfo?.street}</p>
          <p>
            {addressInfo?.city}, {addressInfo?.state} {addressInfo?.postalCode}
          </p>
          <p>{addressInfo?.country}</p>
        </div>
      </div>

      {/* Tax Information Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('onboarding.taxInformation')}
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('onboarding.taxId')}</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">{taxInfo?.taxId}</dd>
          </div>
          {taxInfo?.taxOffice && (
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('onboarding.taxOffice')}</dt>
              <dd className="mt-1 text-sm text-gray-900">{taxInfo.taxOffice}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Payment Information Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          {t('onboarding.paymentInformation')}
        </h3>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('onboarding.paymentMethod')}</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatPaymentMethod(paymentInfo?.method)}
            </dd>
          </div>
          
          {paymentInfo?.method === 'bank_transfer' && paymentInfo?.bankDetails && (
            <>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('onboarding.bankName')}</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {paymentInfo.bankDetails.bankName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('onboarding.iban')}</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">
                  {paymentInfo.bankDetails.iban}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('onboarding.accountHolder')}</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {paymentInfo.bankDetails.accountHolder}
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>

      {/* Commercial Terms */}
      <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-6">
        <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
          <svg className="h-6 w-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('onboarding.commercialTerms.heading')}
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-indigo-200">
            <span className="font-medium text-gray-700">{t('onboarding.commercialTerms.commissionRate')}</span>
            <span className="text-lg font-bold text-indigo-900">{commercialTerms.commissionRate}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-indigo-200">
            <span className="font-medium text-gray-700">{t('onboarding.commercialTerms.attributionWindow')}</span>
            <span className="text-lg font-bold text-indigo-900">{commercialTerms.attributionWindow} {t('onboarding.commercialTerms.days')}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-indigo-200">
            <span className="font-medium text-gray-700">{t('onboarding.commercialTerms.paymentSchedule')}</span>
            <span className="text-lg font-bold text-indigo-900">{t(`onboarding.commercialTerms.${commercialTerms.paymentSchedule.toLowerCase()}`)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="font-medium text-gray-700">{t('onboarding.commercialTerms.effectiveDate')}</span>
            <span className="text-lg font-bold text-indigo-900">{commercialTerms.effectiveDate}</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg">
          <p className="text-sm text-gray-700 leading-relaxed">
            {t('onboarding.commercialTerms.applicabilityNotice')}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {t('onboarding.commercialTerms.updateNotice')}
          </p>
        </div>
      </div>

      {/* Mandatory Checkboxes */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6 space-y-4">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="information-accurate"
            className="mt-1 h-5 w-5 text-indigo-600 border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-indigo-500"
            checked={informationAccurate}
            onChange={(e) => setInformationAccurate(e.target.checked)}
          />
          <label htmlFor="information-accurate" className="ml-3 text-base text-gray-900 cursor-pointer font-medium">
            {t('onboarding.commercialTerms.confirmInformationAccurate')}
          </label>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms-accepted"
            className="mt-1 h-5 w-5 text-indigo-600 border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-indigo-500"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <label htmlFor="terms-accepted" className="ml-3 text-base text-gray-900 cursor-pointer font-medium">
            {t('onboarding.commercialTerms.acceptCommercialTerms')}
          </label>
        </div>
      </div>

      {/* Information Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-2">{t('onboarding.commercialTerms.nextStepInfo')}</p>
            <p className="text-blue-800">
              {t('onboarding.commercialTerms.reviewBeforeActivation')}
            </p>
            <p className="text-blue-800 mt-1">
              {t('onboarding.commercialTerms.agreementNextStep')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommercialTermsStep;
