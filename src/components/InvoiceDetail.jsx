import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Mail,
  Building2,
  Calendar,
  FileText
} from 'lucide-react';

import PaymentWidget from './shared/PaymentWidget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { getInvoiceById, generateInvoicePDF, simulatePayment, mockCompanyDetails } from '@/data/mockData';
import { format } from 'date-fns';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const shouldShowPayment = searchParams.get('pay') === 'true';

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const foundInvoice = getInvoiceById(id);
      if (foundInvoice) {
        setInvoice(foundInvoice);
      } else {
        toast.error('Invoice not found');
        navigate('/invoices');
      }
      setLoading(false);
    }, 500);
  }, [id, navigate]);

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleDownload = async () => {
    toast.promise(
      generateInvoicePDF(invoice),
      {
        loading: 'Generating PDF...',
        success: 'Invoice downloaded successfully!',
        error: 'Failed to download invoice',
      }
    );
  };

  const handlePrint = () => {
    window.print();
    toast.success('Opening print dialog...');
  };

  const handleEmail = () => {
    toast.success('Email functionality coming soon!');
  };

  const handlePaymentComplete = async (result) => {
    if (result.success) {
      toast.success('Payment completed successfully!');
      // Refresh invoice data
      const updatedInvoice = getInvoiceById(id);
      setInvoice(updatedInvoice);
    } else {
      toast.error('Payment failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const tax = 0; // Could add tax calculation
  const total = subtotal + tax;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Actions */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/invoices')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Invoice {invoice.number}
              </h1>
              <p className="text-gray-600 mt-1">
                {invoice.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Invoice Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="space-y-4 print:space-y-6">
                {/* Invoice Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {mockCompanyDetails.companyName}
                    </h2>
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <p>{mockCompanyDetails.address.street}</p>
                      <p>
                        {mockCompanyDetails.address.postalCode} {mockCompanyDetails.address.city}
                      </p>
                      <p>{mockCompanyDetails.address.country}</p>
                      <p className="mt-2">Tax ID: {mockCompanyDetails.taxId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={invoice.status === 'paid' ? 'success' : 'warning'} 
                      className="text-lg px-4 py-2 capitalize"
                    >
                      {invoice.status}
                    </Badge>
                    <p className="text-3xl font-bold text-gray-900 mt-4">
                      INVOICE
                    </p>
                    <p className="text-lg text-gray-600 mt-1">
                      #{invoice.number}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Bill To & Dates */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">BILL TO</h3>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">{invoice.shop}</p>
                      <p className="text-gray-600 mt-1">Shop ID: {invoice.shopId}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">INVOICE DETAILS</h3>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Issue Date:</span>
                        <span className="font-medium">{format(new Date(invoice.date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Due Date:</span>
                        <span className="font-medium">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</span>
                      </div>
                      {invoice.paidDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Paid Date:</span>
                          <span className="font-medium text-green-600">
                            {format(new Date(invoice.paidDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Line Items Table */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-4">ITEMS</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.lineItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.description}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.rate, invoice.currency)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(item.amount, invoice.currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">
                            Subtotal:
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(subtotal, invoice.currency)}
                          </TableCell>
                        </TableRow>
                        {tax > 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">
                              Tax:
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(tax, invoice.currency)}
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right text-lg font-bold">
                            Total:
                          </TableCell>
                          <TableCell className="text-right text-lg font-bold">
                            {formatCurrency(total, invoice.currency)}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                </div>

                {/* Payment Instructions */}
                {invoice.status === 'pending' && (
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">PAYMENT INSTRUCTIONS</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Please make payment to:</p>
                      <p className="font-medium">{mockCompanyDetails.bankDetails.accountHolder}</p>
                      <p>IBAN: {mockCompanyDetails.bankDetails.iban}</p>
                      <p>BIC: {mockCompanyDetails.bankDetails.bic}</p>
                      <p>Bank: {mockCompanyDetails.bankDetails.bankName}</p>
                      <p className="mt-2 font-medium">Reference: {invoice.number}</p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="text-sm text-gray-600">
                  <p className="font-semibold mb-2">Notes:</p>
                  <p>Thank you for your business! If you have any questions about this invoice, please contact us at {mockCompanyDetails.contactEmail}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Payment Widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <PaymentWidget 
              invoice={invoice} 
              onPaymentComplete={handlePaymentComplete}
            />

            {/* Invoice Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'} className="capitalize">
                    {invoice.status}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Issue Date</span>
                  <span className="text-sm font-medium">
                    {format(new Date(invoice.date), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Due Date</span>
                  <span className="text-sm font-medium">
                    {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Total Amount</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
  );
};

export default InvoiceDetail;
