import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getOnboardingApplication,
  saveOnboardingDraft,
  submitOnboardingApplication,
  validateOnboardingData
} from '../../services/onboardingService';
import LoadingSpinner from '../LoadingSpinner';
import BusinessInfoStep from './BusinessInfoStep';
import AddressInfoStep from './AddressInfoStep';
import TaxInfoStep from './TaxInfoStep';
import PaymentInfoStep from './PaymentInfoStep';
import ReviewSubmitStep from './ReviewSubmitStep';

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    businessInfo: {},
    addressInfo: {},
    taxInfo: {},
    paymentInfo: {}
  });
  
  // Step validation state
  const [stepValidity, setStepValidity] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: true // Review step is always valid
  });

  const totalSteps = 5;

  // Steps configuration
  const steps = [
    { number: 1, title: 'Business Info', icon: '🏢' },
    { number: 2, title: 'Address', icon: '📍' },
    { number: 3, title: 'Tax Info', icon: '📄' },
    { number: 4, title: 'Payment', icon: '💳' },
    { number: 5, title: 'Review', icon: '✓' }
  ];

  // Load existing application on mount
  useEffect(() => {
    const loadApplication = async () => {
      try {
        setLoading(true);
        const app = await getOnboardingApplication();
        
        if (app) {
          // Check if already approved - redirect to connect page
          if (app.status === 'approved') {
            navigate('/connect', { replace: true });
            return;
          }
          
          // Check if pending review
          if (app.status === 'pending_review') {
            setSuccess(true);
            setLoading(false);
            return;
          }
          
          // Load draft data
          setFormData({
            businessInfo: app.businessInfo || {},
            addressInfo: app.addressInfo || {},
            taxInfo: app.taxInfo || {},
            paymentInfo: app.paymentInfo || {}
          });
          
          // Resume at saved step
          setCurrentStep(app.currentStep || 1);
        }
      } catch (err) {
        console.error('Error loading application:', err);
        setError('Failed to load your application. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadApplication();
    }
  }, [user, navigate]);

  // Auto-save draft when form data changes
  useEffect(() => {
    const autoSave = async () => {
      if (!user || loading || submitting) return;
      
      // Only auto-save if we have some data
      const hasData = Object.values(formData).some(section => 
        Object.keys(section).length > 0
      );
      
      if (!hasData) return;
      
      try {
        setSaving(true);
        await saveOnboardingDraft(formData, currentStep);
      } catch (err) {
        console.error('Auto-save failed:', err);
        // Don't show error to user for auto-save failures
      } finally {
        setSaving(false);
      }
    };

    // Debounce auto-save
    const timer = setTimeout(autoSave, 2000);
    return () => clearTimeout(timer);
  }, [formData, currentStep, user, loading, submitting]);

  // Handle step data update
  const handleStepUpdate = useCallback((step, data) => {
    setFormData(prev => ({
      ...prev,
      [step]: data
    }));
  }, []);

  // Handle step validation change
  const handleValidationChange = useCallback((step, isValid) => {
    setStepValidity(prev => ({
      ...prev,
      [step]: isValid
    }));
  }, []);

  // Navigate to next step
  const handleNext = async () => {
    if (!stepValidity[currentStep]) {
      setError('Please complete all required fields before proceeding.');
      return;
    }
    
    setError(null);
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit application
  const handleSubmit = async () => {
    // Final validation
    const validationError = validateOnboardingData(formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      await submitOnboardingApplication(formData);
      
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render step component
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BusinessInfoStep
            data={formData.businessInfo}
            onUpdate={(data) => handleStepUpdate('businessInfo', data)}
            onValidationChange={(isValid) => handleValidationChange(1, isValid)}
          />
        );
      case 2:
        return (
          <AddressInfoStep
            data={formData.addressInfo}
            onUpdate={(data) => handleStepUpdate('addressInfo', data)}
            onValidationChange={(isValid) => handleValidationChange(2, isValid)}
          />
        );
      case 3:
        return (
          <TaxInfoStep
            data={formData.taxInfo}
            onUpdate={(data) => handleStepUpdate('taxInfo', data)}
            onValidationChange={(isValid) => handleValidationChange(3, isValid)}
          />
        );
      case 4:
        return (
          <PaymentInfoStep
            data={formData.paymentInfo}
            onUpdate={(data) => handleStepUpdate('paymentInfo', data)}
            onValidationChange={(isValid) => handleValidationChange(4, isValid)}
          />
        );
      case 5:
        return (
          <ReviewSubmitStep
            data={formData}
            onValidationChange={(isValid) => handleValidationChange(5, isValid)}
          />
        );
      default:
        return null;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <LoadingSpinner size="xl" text="Loading your application..." />
      </div>
    );
  }

  // Show success state - redirect immediately to connect page
  if (success) {
    // Redirect to shop connection page
    navigate('/connect', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shop Onboarding
          </h1>
          <p className="text-gray-600">
            Complete your profile to start connecting shops
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all ${
                      currentStep === step.number
                        ? 'bg-indigo-600 text-white scale-110'
                        : currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.number ? '✓' : step.icon}
                  </div>
                  <div className="mt-2 text-xs font-medium text-gray-600 hidden md:block">
                    {step.title}
                  </div>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Auto-save indicator */}
          {saving && (
            <div className="mb-4 flex items-center text-sm text-gray-500">
              <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving draft...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="mb-8">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ← Previous
            </button>

            <div className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </div>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!stepValidity[currentStep]}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  stepValidity[currentStep]
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !stepValidity[currentStep]}
                className={`px-8 py-2 rounded-lg font-semibold transition-colors flex items-center ${
                  submitting || !stepValidity[currentStep]
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    Continue to Shop Connection →
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Your progress is automatically saved. You can return anytime to continue.</p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
