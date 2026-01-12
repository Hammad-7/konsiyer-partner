import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Building2, CreditCard, Save, Loader2, Edit, AlertCircle, Copy, Check } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from './LoadingSpinner';
import { useTranslations } from '@/hooks/useTranslations';

import { 
  getOnboardingApplication, 
  saveOnboardingDraft,
  submitOnboardingApplication 
} from '@/services/onboardingService';
import { auth } from '@/firebase';

const Settings = () => {
  const { t } = useTranslations();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('company');
  const [onboardingData, setOnboardingData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [showClosureDialog, setShowClosureDialog] = useState(false);
  const [closureRequestSent, setClosureRequestSent] = useState(false);
  const [ibanCopied, setIbanCopied] = useState(false);

  const companyForm = useForm({
    defaultValues: {
      businessType: '',
      companyName: '',
      legalStructure: '',
      taxId: '',
      taxOffice: '',
      contactEmail: '',
      contactPhone: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
    },
  });

  const paymentForm = useForm({
    defaultValues: {
      paymentMethod: 'bank_transfer',
      bankDetails: {
        accountHolder: '',
        iban: '',
        bic: '',
        bankName: '',
      },
    },
  });

  // Load onboarding data on mount
  useEffect(() => {
    loadOnboardingData();
  }, []);

  const loadOnboardingData = async () => {
    try {
      setLoading(true);
      const data = await getOnboardingApplication();
      
      if (data) {
        setOnboardingData(data);
        
        // Populate company form with onboarding data
        companyForm.reset({
          businessType: data.businessInfo?.type || '',
          companyName: data.businessInfo?.name || '',
          legalStructure: data.businessInfo?.legalStructure || '',
          taxId: data.taxInfo?.taxId || '',
          taxOffice: data.taxInfo?.taxOffice || '',
          contactEmail: data.contactInfo?.email || auth.currentUser?.email || '',
          contactPhone: data.contactInfo?.phone || auth.currentUser?.phoneNumber || '',
          address: {
            street: data.addressInfo?.street || '',
            city: data.addressInfo?.city || '',
            state: data.addressInfo?.state || '',
            postalCode: data.addressInfo?.postalCode || '',
            country: data.addressInfo?.country || '',
          },
        });

        // Populate payment form with onboarding data
        paymentForm.reset({
          paymentMethod: data.paymentInfo?.method || 'bank_transfer',
          bankDetails: {
            accountHolder: data.paymentInfo?.bankDetails?.accountHolder || '',
            iban: data.paymentInfo?.bankDetails?.iban || '',
            bic: data.paymentInfo?.bankDetails?.bic || '',
            bankName: data.paymentInfo?.bankDetails?.bankName || '',
          },
        });
      } else {
        // No onboarding data, set email from auth
        companyForm.setValue('contactEmail', auth.currentUser?.email || '');
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      toast.error(t('settings.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async (data) => {
    setSaving(true);
    try {
      // Prepare data in onboarding format
      const updateData = {
        businessInfo: {
          type: data.businessType,
          name: data.companyName,
          legalStructure: data.legalStructure,
          companyLegalName: data.companyName, // Add companyLegalName for validation
        },
        contactInfo: {
          email: data.contactEmail,
          phone: data.contactPhone,
        },
        addressInfo: {
          street: data.address.street,
          city: data.address.city,
          state: data.address.state,
          postalCode: data.address.postalCode,
          country: data.address.country,
        },
        taxInfo: {
          taxId: data.taxId,
          taxOffice: data.taxOffice,
        },
        // Preserve existing payment info if any
        paymentInfo: onboardingData?.paymentInfo || {
          method: 'bank_transfer',
          bankDetails: {},
        },
        // Preserve existing agreement data
        agreementData: onboardingData?.agreementData || {
          accepted: true,
          timestamp: new Date().toISOString(),
          ipAddress: 'Unknown',
          agreementVersion: '1.0',
        },
      };

      // Submit as approved application
      await submitOnboardingApplication(updateData);
      
      toast.success(t('settings.companyDetailsSaved'));
      setIsEditing(false);
      
      // Reload data to reflect changes
      await loadOnboardingData();
    } catch (error) {
      console.error('Error saving company details:', error);
      toast.error(error.message || t('settings.failedToSave'));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayment = async (data) => {
    setSaving(true);
    try {
      // Prepare complete data with existing info
      const updateData = {
        businessInfo: onboardingData?.businessInfo || {
          type: companyForm.getValues('businessType'),
          name: companyForm.getValues('companyName'),
        },
        contactInfo: onboardingData?.contactInfo || {
          email: companyForm.getValues('contactEmail'),
          phone: companyForm.getValues('contactPhone'),
        },
        addressInfo: onboardingData?.addressInfo || {
          street: companyForm.getValues('address.street'),
          city: companyForm.getValues('address.city'),
          state: companyForm.getValues('address.state'),
          postalCode: companyForm.getValues('address.postalCode'),
          country: companyForm.getValues('address.country'),
        },
        taxInfo: onboardingData?.taxInfo || {
          taxId: companyForm.getValues('taxId'),
          taxOffice: companyForm.getValues('taxOffice'),
        },
        paymentInfo: {
          method: data.paymentMethod,
          bankDetails: data.bankDetails,
        },
        // Preserve existing agreement data
        agreementData: onboardingData?.agreementData || {
          accepted: true,
          timestamp: new Date().toISOString(),
          ipAddress: 'Unknown',
          agreementVersion: '1.0',
        },
      };

      // Submit as approved application
      await submitOnboardingApplication(updateData);
      
      toast.success(t('settings.paymentSettingsSaved'));
      setIsEditingPayment(false);
      
      // Reload data to reflect changes
      await loadOnboardingData();
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast.error(error.message || t('settings.failedToSavePayment'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(t('settings.notificationsSaved'));
    setSaving(false);
  };

  const handleAccountClosureRequest = async () => {
    try {
      // Here you would typically send a request to your backend
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowClosureDialog(false);
      setClosureRequestSent(true);
      toast.success(t('settings.accountClosureRequestSent'));
    } catch (error) {
      console.error('Error sending account closure request:', error);
      toast.error('Failed to send request');
    }
  };

  const handleCopyIban = async () => {
    const iban = 'TR47 0006 2000 5750 0006 2969 56';
    try {
      await navigator.clipboard.writeText(iban);
      setIbanCopied(true);
      toast.success(t('settings.ibanCopied'));
      setTimeout(() => setIbanCopied(false), 2000);
    } catch (error) {
      console.error('Error copying IBAN:', error);
      toast.error(t('settings.copyFailed'));
    }
  };


  // Show loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="xl" text={t('settings.loadingSettings')} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('settings.title')}</h1>
          <p className="text-gray-600">
            {t('settings.description')}
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {closureRequestSent && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {t('settings.accountClosureRequestSent')}
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="company">
                <Building2 className="h-4 w-4 mr-2" />
                {t('settings.company')}
              </TabsTrigger>
              <TabsTrigger value="payment">
                <CreditCard className="h-4 w-4 mr-2" />
                {t('settings.payment')}
              </TabsTrigger>
            </TabsList>

            {/* Company Details Tab */}
            <TabsContent value="company" className="space-y-6">
              <Card>
                <CardHeader className="relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{t('settings.companyDetails')}</CardTitle>
                      <CardDescription>
                        {t('settings.updateCompanyInfo')}
                      </CardDescription>
                    </div>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {t('settings.edit')}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!isEditing ? (
                    // Read-only view
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold">{t('settings.basicInformation')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">{t('settings.businessType')}</Label>
                            <p className="mt-1 text-sm font-medium">
                              {companyForm.watch('businessType') 
                                ? t(`settings.${companyForm.watch('businessType')}`) || companyForm.watch('businessType')
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">{t('settings.businessName')}</Label>
                            <p className="mt-1 text-sm font-medium">{companyForm.watch('companyName') || '-'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">{t('settings.legalStructure')}</Label>
                            <p className="mt-1 text-sm font-medium">{companyForm.watch('legalStructure') || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">{t('settings.taxId')}</Label>
                            <p className="mt-1 text-sm font-medium">{companyForm.watch('taxId') || '-'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">{t('settings.contactEmail')}</Label>
                            <p className="mt-1 text-sm font-medium">{companyForm.watch('contactEmail') || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">{t('settings.contactPhone')}</Label>
                            <p className="mt-1 text-sm font-medium">{companyForm.watch('contactPhone') || '-'}</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold">{t('settings.addressInformation')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label className="text-muted-foreground">{t('settings.streetAddress')}</Label>
                            <p className="mt-1 text-sm font-medium">{companyForm.watch('address.street') || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">{t('settings.city')}</Label>
                            <p className="mt-1 text-sm font-medium">{companyForm.watch('address.city') || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">{t('settings.stateProvince')}</Label>
                            <p className="mt-1 text-sm font-medium">{companyForm.watch('address.state') || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">{t('settings.postalCode')}</Label>
                            <p className="mt-1 text-sm font-medium">{companyForm.watch('address.postalCode') || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">{t('settings.country')}</Label>
                            <p className="mt-1 text-sm font-medium">{companyForm.watch('address.country') || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Edit mode - Form view
                    <form onSubmit={companyForm.handleSubmit(handleSaveCompany)} className="space-y-6">
                      {/* Basic Info */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold">{t('settings.basicInformation')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="businessType">{t('settings.businessType')}</Label>
                            <Select 
                              value={companyForm.watch('businessType')}
                              onValueChange={(value) => companyForm.setValue('businessType', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t('settings.selectBusinessType')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="individual">{t('settings.individual')}</SelectItem>
                                <SelectItem value="sole_proprietor">{t('settings.soleProprietor')}</SelectItem>
                                <SelectItem value="partnership">{t('settings.partnership')}</SelectItem>
                                <SelectItem value="company">{t('settings.companyEntity')}</SelectItem>
                                <SelectItem value="corporation">{t('settings.corporation')}</SelectItem>
                                <SelectItem value="llc">{t('settings.llc')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="companyName">{t('settings.businessName')} *</Label>
                            <Input
                              id="companyName"
                              {...companyForm.register('companyName', { required: true })}
                              placeholder={t('settings.placeholders.businessName')}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="legalStructure">{t('settings.legalStructureOptional')}</Label>
                            <Input
                              id="legalStructure"
                              {...companyForm.register('legalStructure')}
                              placeholder={t('settings.placeholders.legalStructure')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="taxId">{t('settings.taxId')} *</Label>
                            <Input
                              id="taxId"
                              {...companyForm.register('taxId', { required: true })}
                              placeholder={t('settings.placeholders.taxId')}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contactEmail">{t('settings.contactEmail')}</Label>
                            <Input
                              id="contactEmail"
                              type="email"
                              {...companyForm.register('contactEmail')}
                              placeholder={t('settings.placeholders.email')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactPhone">{t('settings.contactPhoneOptional')}</Label>
                            <Input
                              id="contactPhone"
                              type="tel"
                              {...companyForm.register('contactPhone')}
                              placeholder={t('settings.placeholders.phone')}
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Address */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold">{t('settings.addressInformation')}</h3>
                        <div className="space-y-2">
                          <Label htmlFor="street">{t('settings.streetAddress')} *</Label>
                          <Input
                            id="street"
                            {...companyForm.register('address.street', { required: true })}
                            placeholder={t('settings.placeholders.street')}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">{t('settings.city')} *</Label>
                            <Input
                              id="city"
                              {...companyForm.register('address.city', { required: true })}
                              placeholder={t('settings.placeholders.city')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">{t('settings.stateProvince')} *</Label>
                            <Input
                              id="state"
                              {...companyForm.register('address.state', { required: true })}
                              placeholder={t('settings.placeholders.state')}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="postalCode">{t('settings.postalCode')} *</Label>
                            <Input
                              id="postalCode"
                              {...companyForm.register('address.postalCode', { required: true })}
                              placeholder={t('settings.placeholders.postalCode')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country">{t('settings.country')} *</Label>
                            <Input
                              id="country"
                              {...companyForm.register('address.country', { required: true })}
                              placeholder={t('settings.placeholders.country')}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsEditing(false);
                            loadOnboardingData(); // Reset form to original values
                          }}
                          disabled={saving}
                        >
                          {t('settings.cancel')}
                        </Button>
                        <Button type="submit" disabled={saving}>
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {t('settings.saving')}
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              {t('settings.saveChanges')}
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Account Management Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{t('settings.accountManagement')}</CardTitle>
                  <CardDescription className="text-sm">
                    {t('settings.accountManagementDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setShowClosureDialog(true)}
                  >
                    {t('settings.requestAccountClosure')}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Settings Tab */}
            <TabsContent value="payment">
              <Card>
                <CardHeader className="relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{t('settings.paymentSettings')}</CardTitle>
                      <CardDescription>
                        {t('settings.paymentSettingsDescription')}
                      </CardDescription>
                    </div>
                    {!isEditingPayment && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingPayment(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {t('settings.edit')}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!isEditingPayment ? (
                    // Read-only view
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-muted-foreground">{t('settings.paymentMethod')}</Label>
                          <p className="mt-1 text-sm font-medium">
                            {paymentForm.watch('paymentMethod') === 'credit_card' 
                              ? t('settings.creditCard') 
                              : t('settings.bankTransfer')}
                          </p>
                        </div>
                      </div>

                      {/* Bank Details - only show when payment method is bank_transfer */}
                      {paymentForm.watch('paymentMethod') === 'bank_transfer' && (
                        <>
                          <Separator />
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold">{t('settings.ourBankDetails')}</h3>
                            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-xs text-muted-foreground">{t('settings.bankName')}</Label>
                                  <p className="text-sm font-medium mt-1">T.Garanti Bankası</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">{t('settings.accountHolder')}</Label>
                                  <p className="text-sm font-medium mt-1">Konsiyer Teknoloji Anonim Şirketi</p>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">{t('settings.iban')}</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-sm font-medium font-mono">TR47 0006 2000 5750 0006 2969 56</p>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopyIban}
                                    className="h-8 w-8 p-0"
                                  >
                                    {ibanCopied ? (
                                      <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <Alert className="bg-blue-50 border-blue-200">
                              <AlertCircle className="h-4 w-4 text-blue-600" />
                              <AlertDescription className="text-sm text-blue-800">
                                {t('settings.paymentDescriptionNote')}
                              </AlertDescription>
                            </Alert>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    // Edit mode - Form view
                    <form onSubmit={paymentForm.handleSubmit(handleSavePayment)} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="paymentMethod">{t('settings.paymentMethod')}</Label>
                          <p className="text-sm text-muted-foreground">{t('settings.paymentMethodHelper')}</p>
                          <Select 
                            value={paymentForm.watch('paymentMethod')}
                            onValueChange={(value) => paymentForm.setValue('paymentMethod', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="credit_card">{t('settings.creditCard')}</SelectItem>
                              <SelectItem value="bank_transfer">{t('settings.bankTransfer')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsEditingPayment(false);
                            loadOnboardingData(); // Reset form to original values
                          }}
                          disabled={saving}
                        >
                          {t('settings.cancel')}
                        </Button>
                        <Button type="submit" disabled={saving}>
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {t('settings.saving')}
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              {t('settings.saveChanges')}
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Account Closure Confirmation Dialog */}
        <AlertDialog open={showClosureDialog} onOpenChange={setShowClosureDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader className="space-y-2">
              <AlertDialogTitle className="text-lg">{t('settings.accountClosureConfirmTitle')}</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                {t('settings.accountClosureConfirmMessage')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('settings.cancel')}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleAccountClosureRequest}
                className="bg-foreground hover:bg-foreground/90"
              >
                {t('settings.sendRequest')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default Settings;
