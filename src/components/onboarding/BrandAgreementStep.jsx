import { useEffect, useState } from 'react';
import { useTranslations } from '../../hooks/useTranslations';
import agreementPDF from '../../assets/agreement/Lite Agreement.pdf';

// Agreement version for tracking
const AGREEMENT_VERSION = '1.0';

const BrandAgreementStep = ({ onValidationChange, onAgreementData }) => {
  const { t } = useTranslations();
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [isLoadingIP, setIsLoadingIP] = useState(true);

  // Fetch user's IP address
  useEffect(() => {
    const fetchIPAddress = async () => {
      try {
        // Using a public API to get IP address
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setIpAddress(data.ip);
      } catch (error) {
        console.error('Error fetching IP address:', error);
        setIpAddress('Unable to determine');
      } finally {
        setIsLoadingIP(false);
      }
    };

    fetchIPAddress();
  }, []);

  // Update validation and pass agreement data when checkbox changes
  useEffect(() => {
    onValidationChange(agreementAccepted);
    
    if (agreementAccepted && onAgreementData) {
      const acceptanceData = {
        accepted: true,
        timestamp: new Date().toISOString(),
        ipAddress: ipAddress,
        agreementVersion: AGREEMENT_VERSION,
        userAgent: navigator.userAgent
      };
      onAgreementData(acceptanceData);
    }
  }, [agreementAccepted, ipAddress, onValidationChange, onAgreementData]);

  // Function to download agreement PDF from assets
  const handleDownloadPDF = () => {
    const link = document.createElement('a');
    link.href = agreementPDF;
    link.download = `Brand_Partnership_Agreement_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header with Download Button */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('onboarding.brandAgreement.title')}
          </h2>
          <p className="text-gray-600">
            {t('onboarding.brandAgreement.subtitle')}
          </p>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('onboarding.brandAgreement.downloadPDF')}
        </button>
      </div>

      {/* Introduction Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-900">
            <p className="font-medium">{t('onboarding.brandAgreement.pleaseReview')}</p>
            <p className="text-blue-800 mt-1">
              {t('onboarding.brandAgreement.governsPartnership')}
            </p>
          </div>
        </div>
      </div>

      {/* Agreement Content - Full Page Text */}
      <div 
        id="agreement-content"
        className="bg-white border border-gray-300 rounded-lg p-8 max-h-[600px] overflow-y-auto"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        <div className="prose max-w-none">
          <h1 className="text-2xl font-bold text-center mb-6">
            {t('onboarding.brandAgreement.documentTitle')}
          </h1>
          
          <p className="text-sm text-gray-600 text-center mb-8">
            {t('onboarding.brandAgreement.version')}: {AGREEMENT_VERSION} | {t('onboarding.brandAgreement.effectiveDate')}: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-6 text-gray-800 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold mb-3">1. {t('onboarding.brandAgreement.section1Title')}</h2>
              <p>
                {t('onboarding.brandAgreement.section1Content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">2. {t('onboarding.brandAgreement.section2Title')}</h2>
              <p>
                {t('onboarding.brandAgreement.section2Content')}
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>{t('onboarding.brandAgreement.section2Point1')}</li>
                <li>{t('onboarding.brandAgreement.section2Point2')}</li>
                <li>{t('onboarding.brandAgreement.section2Point3')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">3. {t('onboarding.brandAgreement.section3Title')}</h2>
              <p>
                {t('onboarding.brandAgreement.section3Content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">4. {t('onboarding.brandAgreement.section4Title')}</h2>
              <p>
                {t('onboarding.brandAgreement.section4Content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">5. {t('onboarding.brandAgreement.section5Title')}</h2>
              <p>
                {t('onboarding.brandAgreement.section5Content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">6. {t('onboarding.brandAgreement.section6Title')}</h2>
              <p>
                {t('onboarding.brandAgreement.section6Content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">7. {t('onboarding.brandAgreement.section7Title')}</h2>
              <p>
                {t('onboarding.brandAgreement.section7Content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">8. {t('onboarding.brandAgreement.section8Title')}</h2>
              <p>
                {t('onboarding.brandAgreement.section8Content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">9. {t('onboarding.brandAgreement.section9Title')}</h2>
              <p>
                {t('onboarding.brandAgreement.section9Content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">10. {t('onboarding.brandAgreement.section10Title')}</h2>
              <p>
                {t('onboarding.brandAgreement.section10Content')}
              </p>
            </section>

            <div className="mt-8 pt-6 border-t-2 border-gray-300">
              <p className="text-sm text-gray-600 italic">
                {t('onboarding.brandAgreement.footerNote')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Acceptance Checkbox */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="agreement-accepted"
            className="mt-1 h-5 w-5 text-indigo-600 border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-indigo-500"
            checked={agreementAccepted}
            onChange={(e) => setAgreementAccepted(e.target.checked)}
          />
          <label htmlFor="agreement-accepted" className="ml-3 text-base text-gray-900 cursor-pointer font-medium">
            {t('onboarding.brandAgreement.acceptAgreement')}
          </label>
        </div>
      </div>

      {/* Recording Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="text-sm text-gray-700">
            <p className="font-medium">{t('onboarding.brandAgreement.recordingNotice')}</p>
            <div className="mt-2 space-y-1 text-gray-600">
              <p>• {t('onboarding.brandAgreement.recordDate')}</p>
              <p>• {t('onboarding.brandAgreement.recordTime')}</p>
              <p>• {t('onboarding.brandAgreement.recordIP')}{isLoadingIP ? t('onboarding.brandAgreement.loading') : ipAddress}</p>
              <p>• {t('onboarding.brandAgreement.recordVersion')}{AGREEMENT_VERSION}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BrandAgreementStep;
