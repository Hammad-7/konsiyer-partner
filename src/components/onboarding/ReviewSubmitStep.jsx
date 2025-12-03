import { useEffect } from 'react';
import { formatPaymentMethod } from '../../services/onboardingService';
import { useTranslations } from '../../hooks/useTranslations';

const ReviewSubmitStep = ({ data, onValidationChange }) => {
  const { t } = useTranslations();
  const { businessInfo, addressInfo, taxInfo, paymentInfo } = data;

  // Always mark as valid since this is just a review step
  useEffect(() => {
    onValidationChange(true);
  }, []); // Run once on mount

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('onboarding.reviewTitle')}
        </h2>
        <p className="text-gray-600">
          {t('onboarding.reviewAllInformation')}
        </p>
      </div>

      {/* Business Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {t('onboarding.businessInfoTitle')}
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('onboarding.brandName')}</dt>
            <dd className="mt-1 text-sm text-gray-900">{businessInfo?.name || businessInfo?.brandName}</dd>
          </div>
        </dl>
      </div>

      {/* Address Information */}
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

      {/* Tax Information */}
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

      {/* Payment Information */}
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
          
          {paymentInfo?.method === 'credit_card' && (
            <div className="text-sm text-gray-600 italic">
              {t('onboarding.creditCardDetailsLater')}
            </div>
          )}
        </dl>
      </div>

      {/* Important Information */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-indigo-900">
            <p className="font-medium mb-1">{t('onboarding.whatHappensNext')}</p>
            <ul className="list-disc list-inside space-y-1 text-indigo-800">
              <li>{t('onboarding.infoSavedSecurely')}</li>
              <li>{t('onboarding.connectShopImmediately')}</li>
              <li>{t('onboarding.startUsingServices')}</li>
              <li>{t('onboarding.mayContactForClarification')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Usage Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div className="text-sm text-green-900">
            <p className="font-medium mb-1">{t('onboarding.dataUsageNotice')}</p>
            <ul className="list-disc list-inside space-y-1 text-green-800">
              <li>{t('onboarding.secureDataHandling')}</li>
              <li>{t('onboarding.complianceWithRegulations')}</li>
              <li>{t('onboarding.neverShareData')}</li>
              <li>{t('onboarding.fullControlOverData')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Terms Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            defaultChecked
          />
          <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
            {t('onboarding.consentConfirmation')}
          </label>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmitStep;
