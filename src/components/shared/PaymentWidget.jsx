import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Building2, Wallet, Loader2 } from 'lucide-react';
import { mockPaymentMethods } from '@/data/mockData';

export const PaymentWidget = ({ invoice, onPaymentComplete }) => {
  const [selectedMethod, setSelectedMethod] = useState(mockPaymentMethods[0].id);
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProcessing(false);
    onPaymentComplete?.({ success: true, invoiceId: invoice.id });
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getPaymentMethodIcon = (type) => {
    switch (type) {
      case 'bank_transfer':
        return <Building2 className="h-5 w-5" />;
      case 'paypal':
        return <Wallet className="h-5 w-5" />;
      case 'stripe':
        return <CreditCard className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  if (invoice.status === 'paid') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <span className="text-2xl">✅</span>
            Payment Received
          </CardTitle>
          <CardDescription>
            This invoice has been paid on {invoice.paidDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Amount Paid</p>
            <p className="text-3xl font-bold text-green-700">
              {formatCurrency(invoice.amount, invoice.currency)}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
        <CardDescription>
          Complete your payment for Invoice #{invoice.number}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Amount Due</p>
          <p className="text-3xl font-bold">
            {formatCurrency(invoice.amount, invoice.currency)}
          </p>
          <Badge variant="warning" className="mt-2">
            Due: {invoice.dueDate}
          </Badge>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Method</label>
          <Select value={selectedMethod} onValueChange={setSelectedMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {mockPaymentMethods.map((method) => (
                <SelectItem key={method.id} value={method.id}>
                  <div className="flex items-center gap-2">
                    <span>{method.icon}</span>
                    <div>
                      <p className="font-medium">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.details}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="bank" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bank">Bank</TabsTrigger>
            <TabsTrigger value="card">Card</TabsTrigger>
            <TabsTrigger value="paypal">PayPal</TabsTrigger>
          </TabsList>
          <TabsContent value="bank" className="space-y-2 mt-4">
            <div className="bg-muted p-3 rounded-md text-sm space-y-1">
              <p className="font-medium">Bank Transfer Details:</p>
              <p className="text-muted-foreground">IBAN: DE89 3704 0044 0532 0130 00</p>
              <p className="text-muted-foreground">BIC: COBADEFFXXX</p>
              <p className="text-muted-foreground">Reference: {invoice.number}</p>
            </div>
          </TabsContent>
          <TabsContent value="card" className="space-y-2 mt-4">
            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="text-muted-foreground">Credit card payment processing available</p>
            </div>
          </TabsContent>
          <TabsContent value="paypal" className="space-y-2 mt-4">
            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="text-muted-foreground">PayPal payment link will be generated</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          size="lg"
          onClick={handlePayment}
          disabled={processing}
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay {formatCurrency(invoice.amount, invoice.currency)}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentWidget;
