import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CreditCard,
  MoreVertical,
  CheckSquare,
  Square
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

import { mockInvoices, generateInvoicePDF, simulatePayment } from '@/data/mockData';
import { format } from 'date-fns';

const Invoices = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter invoices based on tab and search
  const filteredInvoices = useMemo(() => {
    let filtered = mockInvoices;

    // Filter by status tab
    if (activeTab === 'pending') {
      filtered = filtered.filter(inv => inv.status === 'pending');
    } else if (activeTab === 'paid') {
      filtered = filtered.filter(inv => inv.status === 'paid');
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(inv => 
        inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.shop.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [activeTab, searchQuery]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      all: mockInvoices.length,
      pending: mockInvoices.filter(inv => inv.status === 'pending').length,
      paid: mockInvoices.filter(inv => inv.status === 'paid').length,
      totalPending: mockInvoices
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + inv.amount, 0),
      totalPaid: mockInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0),
    };
  }, []);

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const variants = {
      paid: 'success',
      pending: 'warning',
      overdue: 'destructive',
    };
    return <Badge variant={variants[status]} className="capitalize">{status}</Badge>;
  };

  const handleSelectInvoice = (invoiceId) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map(inv => inv.id));
    }
  };

  const handleViewInvoice = (invoiceId) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handlePayInvoice = async (invoiceId) => {
    toast.promise(
      simulatePayment(invoiceId),
      {
        loading: 'Processing payment...',
        success: (result) => {
          if (result.success) {
            return 'Payment completed successfully!';
          }
          throw new Error(result.error);
        },
        error: 'Payment failed',
      }
    );
  };

  const handleDownloadInvoice = async (invoiceId) => {
    const invoice = mockInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    toast.promise(
      generateInvoicePDF(invoice),
      {
        loading: 'Generating PDF...',
        success: 'Invoice downloaded successfully!',
        error: 'Failed to download invoice',
      }
    );
  };

  const handleBulkAction = async (action) => {
    if (selectedInvoices.length === 0) {
      toast.error('Please select at least one invoice');
      return;
    }

    if (action === 'download') {
      toast.promise(
        Promise.all(selectedInvoices.map(id => {
          const invoice = mockInvoices.find(inv => inv.id === id);
          return generateInvoicePDF(invoice);
        })),
        {
          loading: `Downloading ${selectedInvoices.length} invoices...`,
          success: 'All invoices downloaded successfully!',
          error: 'Failed to download invoices',
        }
      );
      setSelectedInvoices([]);
    } else if (action === 'pay') {
      toast.promise(
        Promise.all(selectedInvoices.map(id => simulatePayment(id))),
        {
          loading: `Processing ${selectedInvoices.length} payments...`,
          success: 'All payments completed successfully!',
          error: 'Failed to process payments',
        }
      );
      setSelectedInvoices([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoices</h1>
          <p className="text-gray-600">
            Manage and track all your invoices in one place.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totals.all}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">{totals.pending}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(totals.totalPending, 'EUR')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Paid</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{totals.paid}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(totals.totalPaid, 'EUR')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatCurrency(totals.totalPending + totals.totalPaid, 'EUR')}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Invoice List</CardTitle>
                  <CardDescription>View and manage all your invoices</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {selectedInvoices.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAction('download')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download ({selectedInvoices.length})
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleBulkAction('pay')}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay All
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">
                    All ({totals.all})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending ({totals.pending})
                  </TabsTrigger>
                  <TabsTrigger value="paid">
                    Paid ({totals.paid})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                  {/* Table */}
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <button onClick={handleSelectAll}>
                              {selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0 ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Shop</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                              No invoices found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredInvoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell>
                                <button onClick={() => handleSelectInvoice(invoice.id)}>
                                  {selectedInvoices.includes(invoice.id) ? (
                                    <CheckSquare className="h-4 w-4 text-primary" />
                                  ) : (
                                    <Square className="h-4 w-4" />
                                  )}
                                </button>
                              </TableCell>
                              <TableCell className="font-medium">{invoice.number}</TableCell>
                              <TableCell>{invoice.shop}</TableCell>
                              <TableCell className="max-w-xs truncate">{invoice.description}</TableCell>
                              <TableCell>{format(new Date(invoice.date), 'MMM dd, yyyy')}</TableCell>
                              <TableCell>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</TableCell>
                              <TableCell className="font-semibold">
                                {formatCurrency(invoice.amount, invoice.currency)}
                              </TableCell>
                              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewInvoice(invoice.id)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    {invoice.status === 'pending' && (
                                      <DropdownMenuItem onClick={() => handlePayInvoice(invoice.id)}>
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Pay Now
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice.id)}>
                                      <Download className="h-4 w-4 mr-2" />
                                      Download PDF
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
  );
};

export default Invoices;
