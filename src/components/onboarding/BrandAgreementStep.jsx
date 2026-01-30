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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('onboarding.brandAgreement.title')}
        </h2>
        <p className="text-gray-600">
          {t('onboarding.brandAgreement.subtitle')}
        </p>
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
            <span className="text-lg font-bold text-indigo-900">8%</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-indigo-200">
            <div className="flex items-center group relative">
              <span className="font-medium text-gray-700">{t('onboarding.commercialTerms.attributionWindow')}</span>
              <svg className="h-4 w-4 text-gray-400 ml-1 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                {t('onboarding.commercialTerms.attributionWindowTooltip')}
              </div>
            </div>
            <span className="text-lg font-bold text-indigo-900">14 {t('onboarding.commercialTerms.days')}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-indigo-200">
            <span className="font-medium text-gray-700">{t('onboarding.commercialTerms.paymentSchedule')}</span>
            <span className="text-lg font-bold text-indigo-900">{t('onboarding.commercialTerms.monthly')}</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="font-medium text-gray-700">{t('onboarding.commercialTerms.effectiveDate')}</span>
            <span className="text-lg font-bold text-indigo-900">{t('onboarding.brandAgreement.effectiveDateValue')}</span>
          </div>
        </div>
      </div>

      {/* Partner Agreement Section */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t('onboarding.brandAgreement.agreementTitle')}
        </h3>
        <p className="text-gray-700 mb-4">
          {t('onboarding.brandAgreement.agreementDescription')}
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('onboarding.brandAgreement.viewAgreement')}
        </button>
      </div>

      {/* Agreement Highlights */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('onboarding.brandAgreement.highlightsTitle')}
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start">
            <svg className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700 text-sm">{t('onboarding.brandAgreement.highlight1')}</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700 text-sm">{t('onboarding.brandAgreement.highlight2')}</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700 text-sm">{t('onboarding.brandAgreement.highlight3')}</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700 text-sm">{t('onboarding.brandAgreement.highlight4')}</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700 text-sm">{t('onboarding.brandAgreement.highlight5')}</span>
          </li>
        </ul>
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

      {/* Agreement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => setIsModalOpen(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              {/* Modal Header with Download Button */}
              <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  {t('onboarding.brandAgreement.modalTitle')}
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t('onboarding.brandAgreement.downloadPDF')}
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Scrollable Agreement Content */}
              <div className="bg-white px-6 py-6 max-h-[70vh] overflow-y-auto" style={{ fontFamily: 'Georgia, serif' }}>
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
                      <p>{t('onboarding.brandAgreement.section1Content')}</p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3">2. {t('onboarding.brandAgreement.section2Title')}</h2>
                      <p>{t('onboarding.brandAgreement.section2Content')}</p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3">3. {t('onboarding.brandAgreement.section3Title')}</h2>
                      <p>{t('onboarding.brandAgreement.section3Content')}</p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3">4. {t('onboarding.brandAgreement.section4Title')}</h2>
                      <p>{t('onboarding.brandAgreement.section4Content')}</p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3">5. {t('onboarding.brandAgreement.section5Title')}</h2>
                      <p>{t('onboarding.brandAgreement.section5Content')}</p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3">6. {t('onboarding.brandAgreement.section6Title')}</h2>
                      <p>{t('onboarding.brandAgreement.section6Content')}</p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3">7. {t('onboarding.brandAgreement.section7Title')}</h2>
                      <p>{t('onboarding.brandAgreement.section7Content')}</p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3">8. {t('onboarding.brandAgreement.section8Title')}</h2>
                      <p>{t('onboarding.brandAgreement.section8Content')}</p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3">9. {t('onboarding.brandAgreement.section9Title')}</h2>
                      <p>{t('onboarding.brandAgreement.section9Content')}</p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3">10. {t('onboarding.brandAgreement.section10Title')}</h2>
                      <p>{t('onboarding.brandAgreement.section10Content')}</p>
                    </section>

                    <div className="mt-8 pt-6 border-t-2 border-gray-300">
                      <p className="text-sm text-gray-600 italic">
                        {t('onboarding.brandAgreement.footerNote')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  {t('onboarding.brandAgreement.closeModal')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BrandAgreementStep;
