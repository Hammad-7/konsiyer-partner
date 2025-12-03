import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '../../hooks/useTranslations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, FileText, Download, Eye, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

export const InvoiceCard = ({ invoice, onView, onPay, onDownload }) => {
  const { t } = useTranslations();
  
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const isOverdue = invoice.status === 'pending' && new Date(invoice.dueDate) < new Date();

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Invoice #{invoice.number}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {invoice.description}
              </CardDescription>
            </div>
          </div>
          <Badge variant={getStatusColor(isOverdue ? 'overdue' : invoice.status)} className="capitalize">
            {isOverdue ? t('invoices.overdue') : t(`invoices.${invoice.status}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">{t('invoices.issueDate')}</p>
              <p className="font-medium">{format(new Date(invoice.date), 'MMM dd, yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">{t('invoices.dueDate')}</p>
              <p className="font-medium">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t('invoices.amount')}</span>
            </div>
            <span className="text-2xl font-bold">
              {formatCurrency(invoice.amount, invoice.currency)}
            </span>
          </div>

          {invoice.status === 'paid' && invoice.paidDate && (
            <p className="text-xs text-muted-foreground mb-3">
              {t('invoices.paidOn')} {format(new Date(invoice.paidDate), 'MMM dd, yyyy')}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onView(invoice.id)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {t('invoices.view')}
            </Button>
            {invoice.status === 'pending' && (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onPay(invoice.id)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {t('invoices.payNow')}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownload(invoice.id)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceCard;
