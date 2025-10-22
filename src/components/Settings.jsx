import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Building2, CreditCard, Bell, Save } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import { mockCompanyDetails, mockPaymentSettings, mockNotificationSettings } from '@/data/mockData';

const Settings = () => {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('company');

  const companyForm = useForm({
    defaultValues: mockCompanyDetails,
  });

  const paymentForm = useForm({
    defaultValues: mockPaymentSettings,
  });

  const [notifications, setNotifications] = useState(mockNotificationSettings);

  const handleSaveCompany = async (data) => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Company details saved successfully!');
    setSaving(false);
  };

  const handleSavePayment = async (data) => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Payment settings saved successfully!');
    setSaving(false);
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
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input
                            id="companyName"
                            {...companyForm.register('companyName')}
                            placeholder="Your Company Name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="taxId">Tax ID</Label>
                          <Input
                            id="taxId"
                            {...companyForm.register('taxId')}
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
                          <Label htmlFor="contactPhone">Contact Phone</Label>
                          <Input
                            id="contactPhone"
                            {...companyForm.register('contactPhone')}
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Address */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Address</h3>
                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          {...companyForm.register('address.street')}
                          placeholder="123 Main Street"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            {...companyForm.register('address.city')}
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input
                            id="postalCode"
                            {...companyForm.register('address.postalCode')}
                            placeholder="12345"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            {...companyForm.register('address.country')}
                            placeholder="Country"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Bank Details */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Bank Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="accountHolder">Account Holder</Label>
                          <Input
                            id="accountHolder"
                            {...companyForm.register('bankDetails.accountHolder')}
                            placeholder="Account Holder Name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bankName">Bank Name</Label>
                          <Input
                            id="bankName"
                            {...companyForm.register('bankDetails.bankName')}
                            placeholder="Bank Name"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="iban">IBAN</Label>
                          <Input
                            id="iban"
                            {...companyForm.register('bankDetails.iban')}
                            placeholder="DE89 3704 0044 0532 0130 00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bic">BIC/SWIFT</Label>
                          <Input
                            id="bic"
                            {...companyForm.register('bankDetails.bic')}
                            placeholder="COBADEFFXXX"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
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
                    Configure your payment preferences and payout settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={paymentForm.handleSubmit(handleSavePayment)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="preferredMethod">Preferred Payment Method</Label>
                        <Select defaultValue={paymentForm.watch('preferredMethod')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="stripe">Credit Card (Stripe)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select defaultValue={paymentForm.watch('currency')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minimumPayoutAmount">Minimum Payout Amount</Label>
                        <Input
                          id="minimumPayoutAmount"
                          type="number"
                          {...paymentForm.register('minimumPayoutAmount')}
                          placeholder="100.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paymentSchedule">Payment Schedule</Label>
                        <Select defaultValue={paymentForm.watch('paymentSchedule')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="autoWithdraw" className="text-base">Auto-withdraw</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically withdraw funds when minimum is reached
                        </p>
                      </div>
                      <Switch
                        id="autoWithdraw"
                        checked={paymentForm.watch('autoWithdraw')}
                        onCheckedChange={(checked) => paymentForm.setValue('autoWithdraw', checked)}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
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
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
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
