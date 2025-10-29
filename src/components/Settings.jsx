import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Building2, CreditCard, Bell, Save, Loader2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from './LoadingSpinner';

import { 
  getOnboardingApplication, 
  saveOnboardingDraft,
  submitOnboardingApplication 
} from '@/services/onboardingService';
import { mockNotificationSettings } from '@/data/mockData';
import { auth } from '@/firebase';

const Settings = () => {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('company');
  const [onboardingData, setOnboardingData] = useState(null);

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

  const [notifications, setNotifications] = useState(mockNotificationSettings);

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
      toast.error('Failed to load your information');
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
      };

      // Submit as approved application
      await submitOnboardingApplication(updateData);
      
      toast.success('Company details saved successfully!');
      
      // Reload data to reflect changes
      await loadOnboardingData();
    } catch (error) {
      console.error('Error saving company details:', error);
      toast.error(error.message || 'Failed to save company details');
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
      };

      // Submit as approved application
      await submitOnboardingApplication(updateData);
      
      toast.success('Payment settings saved successfully!');
      
      // Reload data to reflect changes
      await loadOnboardingData();
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast.error(error.message || 'Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Notification preferences saved!');
    setSaving(false);
  };

  const toggleNotification = (category, key) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }));
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="xl" text="Loading your settings..." />
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="company">
                <Building2 className="h-4 w-4 mr-2" />
                Company
              </TabsTrigger>
              <TabsTrigger value="payment">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* Company Details Tab */}
            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle>Company Details</CardTitle>
                  <CardDescription>
                    Update your company information and contact details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={companyForm.handleSubmit(handleSaveCompany)} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="businessType">Business Type</Label>
                          <Select 
                            value={companyForm.watch('businessType')}
                            onValueChange={(value) => companyForm.setValue('businessType', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="individual">Individual</SelectItem>
                              <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
                              <SelectItem value="partnership">Partnership</SelectItem>
                              <SelectItem value="company">Company/Business Entity</SelectItem>
                              <SelectItem value="corporation">Corporation</SelectItem>
                              <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Business Name *</Label>
                          <Input
                            id="companyName"
                            {...companyForm.register('companyName', { required: true })}
                            placeholder="Your Business Name"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="legalStructure">Legal Structure (Optional)</Label>
                          <Input
                            id="legalStructure"
                            {...companyForm.register('legalStructure')}
                            placeholder="e.g., GmbH, Inc., LLC"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="taxId">Tax ID *</Label>
                          <Input
                            id="taxId"
                            {...companyForm.register('taxId', { required: true })}
                            placeholder="Tax Identification Number"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactEmail">Contact Email</Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            {...companyForm.register('contactEmail')}
                            placeholder="contact@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactPhone">Contact Phone (Optional)</Label>
                          <Input
                            id="contactPhone"
                            type="tel"
                            {...companyForm.register('contactPhone')}
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Address */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Address Information</h3>
                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address *</Label>
                        <Input
                          id="street"
                          {...companyForm.register('address.street', { required: true })}
                          placeholder="123 Main Street"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            {...companyForm.register('address.city', { required: true })}
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State / Province *</Label>
                          <Input
                            id="state"
                            {...companyForm.register('address.state', { required: true })}
                            placeholder="State or Province"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">Postal Code *</Label>
                          <Input
                            id="postalCode"
                            {...companyForm.register('address.postalCode', { required: true })}
                            placeholder="12345"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country *</Label>
                          <Input
                            id="country"
                            {...companyForm.register('address.country', { required: true })}
                            placeholder="Country"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Settings Tab */}
            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>
                    Configure your payment preferences and bank details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={paymentForm.handleSubmit(handleSavePayment)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Payment Method</h3>
                      <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Preferred Payment Method</Label>
                        <Select 
                          value={paymentForm.watch('paymentMethod')}
                          onValueChange={(value) => paymentForm.setValue('paymentMethod', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="credit_card">Credit Card</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    {/* Bank Details - only show for bank transfer */}
                    {paymentForm.watch('paymentMethod') === 'bank_transfer' && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Bank Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="accountHolder">Account Holder *</Label>
                            <Input
                              id="accountHolder"
                              {...paymentForm.register('bankDetails.accountHolder', { 
                                required: paymentForm.watch('paymentMethod') === 'bank_transfer' 
                              })}
                              placeholder="Account Holder Name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bankName">Bank Name *</Label>
                            <Input
                              id="bankName"
                              {...paymentForm.register('bankDetails.bankName', { 
                                required: paymentForm.watch('paymentMethod') === 'bank_transfer' 
                              })}
                              placeholder="Bank Name"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="iban">IBAN *</Label>
                            <Input
                              id="iban"
                              {...paymentForm.register('bankDetails.iban', { 
                                required: paymentForm.watch('paymentMethod') === 'bank_transfer' 
                              })}
                              placeholder="DE89 3704 0044 0532 0130 00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bic">BIC/SWIFT (Optional)</Label>
                            <Input
                              id="bic"
                              {...paymentForm.register('bankDetails.bic')}
                              placeholder="COBADEFFXXX"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button type="submit" disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about important events.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Notifications */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Email Notifications</h3>
                    {Object.entries(notifications.emailNotifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label className="text-base capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={() => toggleNotification('emailNotifications', key)}
                        />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Push Notifications */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Push Notifications</h3>
                    {Object.entries(notifications.pushNotifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label className="text-base capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={() => toggleNotification('pushNotifications', key)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotifications} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
  );
};

export default Settings;
