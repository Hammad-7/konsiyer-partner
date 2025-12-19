import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import { useTranslations } from '../hooks/useTranslations';
import { fetchAffiliateStatsWithRetry } from '../services/affiliateService';
import { 
  mockKPIs, 
  mockChartData, 
  mockInvoices, 
  mockRecentActivities,
  getTotalPendingAmount,
  getTotalPaidAmount 
} from '../data/mockData';

// Components
import LoadingSpinner from './LoadingSpinner';
import KPICard from './shared/KPICard';
import RevenueChart from './shared/RevenueChart';
import InvoiceCard from './shared/InvoiceCard';
import { MotionContainer, MotionItem } from './shared/MotionCard';
import GtmStatusBanner from './shared/GtmStatusBanner';
import ShopifyOnboardingFlow from './onboarding/ShopifyOnboardingFlow';
import ShopifyDashboard from './ShopifyDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  CreditCard, 
  Plus,
  Upload,
  Download,
  Eye,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useRef } from 'react';

const CHECK_SYNC_STATUS_URL = 'https://check-shop-sync-status-kh3i5xlqba-uc.a.run.app';

const Dashboard = () => {
  const { user } = useAuth();
  const { hasConnectedShops, connectedShops, loading: shopLoading, finalizeShopifyConnection } = useShop();
  const navigate = useNavigate();
  const { t } = useTranslations();
  const [finalizing, setFinalizing] = useState(false);
  const [finalizationError, setFinalizationError] = useState('');
  const [affiliateStats, setAffiliateStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [shopifyOnboardingStatus, setShopifyOnboardingStatus] = useState(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  
  // Ref to prevent duplicate finalization calls (React Strict Mode double-invocation)
  const finalizationInProgress = useRef(false);

  console.log("Dashboard - hasConnectedShops:", hasConnectedShops);

  // Check for URL parameters (for Shopify callback)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shop = urlParams.get('shop');
    const state = urlParams.get('state');
    
    if (shop && state && user && !finalizationInProgress.current) {
      finalizationInProgress.current = true;
      
      const handleFinalization = async () => {
        try {
          setFinalizing(true);
          setFinalizationError('');
          await finalizeShopifyConnection(shop, state);
          
          // Clean up URL immediately after successful finalization
          window.history.replaceState({}, document.title, '/dashboard');
          // toast.success('Shop connected successfully!');
          
          // After finalizing Shopify connection, check onboarding status
          await checkShopifyOnboardingStatus(shop);
        } catch (error) {
          console.error('❌ Error finalizing Shopify connection:', error);
          
          // Don't show error if it's "Invalid or expired state" - this means it already succeeded
          if (error.message?.includes('Invalid or expired state')) {
            // State already consumed - connection likely succeeded, check status
            console.log('ℹ️ State already consumed, checking connection status...');
            window.history.replaceState({}, document.title, '/dashboard');
            await checkShopifyOnboardingStatus(shop);
          } else {
            setFinalizationError(error.message || 'Failed to finalize connection');
            toast.error('Failed to connect shop');
          }
        } finally {
          setFinalizing(false);
        }
      };
      
      handleFinalization();
    }
  }, [user, finalizeShopifyConnection]);

  // Check Shopify onboarding status for Shopify shops
  const checkShopifyOnboardingStatus = async (shopDomain) => {
    try {
      setCheckingOnboarding(true);
      const response = await fetch(
        `${CHECK_SYNC_STATUS_URL}?shop_domain=${encodeURIComponent(shopDomain)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setShopifyOnboardingStatus(data);
        console.log('Shopify onboarding status:', data);
      }
    } catch (error) {
      console.error('Error checking Shopify onboarding status:', error);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  // Check onboarding status for Shopify shops on mount
  useEffect(() => {
    if (hasConnectedShops && connectedShops) {
      const shopifyShop = connectedShops.find(shop => shop.shopType === 'shopify');
      if (shopifyShop) {
        const shopDomain = shopifyShop.shopName || shopifyShop.shop;
        if (shopDomain) {
          checkShopifyOnboardingStatus(shopDomain);
        }
      }
    }
  }, [hasConnectedShops, connectedShops]);

  // Fetch affiliate stats when user has connected shops
  useEffect(() => {
    const loadAffiliateStats = async () => {
      if (hasConnectedShops && user) {
        try {
          setStatsLoading(true);
          setStatsError('');
          const idToken = await user.getIdToken();
          const stats = await fetchAffiliateStatsWithRetry(idToken);
          setAffiliateStats(stats);
        } catch (error) {
          console.error('❌ Failed to load affiliate stats:', error);
          setStatsError(error.message || 'Failed to load affiliate statistics');
        } finally {
          setStatsLoading(false);
        }
      }
    };
    loadAffiliateStats();
  }, [hasConnectedShops, user]);

  // Calculate real total attributed sales from affiliate stats
  const calculateTotalAttributedSales = () => {
    if (!affiliateStats || !affiliateStats.events || affiliateStats.events.length === 0) {
      return 0;
    }
    return affiliateStats.events.reduce((total, event) => 
      total + (event.checkout?.totalAmount || 0), 0
    ) / 100;
  };

  const totalAttributedSales = calculateTotalAttributedSales();
  const currency = affiliateStats?.events?.[0]?.checkout?.currency || 'EUR';

  // Handle invoice actions
  const handleViewInvoice = (invoiceId) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handlePayInvoice = (invoiceId) => {
    navigate(`/invoices/${invoiceId}?pay=true`);
  };

  const handleDownloadInvoice = (invoiceId) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: t('invoices.downloading'),
        success: t('dashboard.downloadSuccess'),
        error: t('dashboard.downloadError'),
      }
    );
  };

  // Show loading while checking shop status or finalizing connection
  if (shopLoading || finalizing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <LoadingSpinner 
          size="xl" 
          text={finalizing ? t('dashboard.finalizingConnection') : t('common.loading')} 
        />
      </div>
    );
  }

  // Show finalization error
  if (finalizationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <CardTitle>{t('dashboard.connectionFailed')}</CardTitle>
            <CardDescription>{finalizationError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => {
                setFinalizationError('');
                navigate('/connect');
              }}
            >
              {t('common.tryAgain')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user has connected shops, show the main dashboard
  if (hasConnectedShops) {
    const recentInvoices = mockInvoices.slice(0, 3);
    const ikasShop = connectedShops?.find(shop => shop.shopType === 'ikas');
    const shopifyShop = connectedShops?.find(shop => shop.shopType === 'shopify');

    console.log("ikasShop:", ikasShop);
    console.log("shopifyShop:", shopifyShop);
    console.log("shopifyOnboardingStatus:", shopifyOnboardingStatus);

    // Handle Shopify shops separately
    if (shopifyShop) {
      const shopDomain = shopifyShop.shopName || shopifyShop.shop;

      // Still loading onboarding status
      if (checkingOnboarding || shopifyOnboardingStatus === null) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
            <LoadingSpinner 
              size="xl" 
              text="Loading dashboard..." 
            />
          </div>
        );
      }

      // Shop hasn't been synced yet - show onboarding flow
      if (!shopifyOnboardingStatus.has_synced) {
        return (
          <div className="max-w-7xl mx-auto">
            <ShopifyOnboardingFlow
              shopDomain={shopDomain}
              onComplete={() => {
                // Refresh the onboarding status after completion
                checkShopifyOnboardingStatus(shopDomain);
              }}
            />
          </div>
        );
      }

      // Shop has been synced - show Shopify dashboard
      return (
        <div className="max-w-7xl mx-auto">
          <ShopifyDashboard shopDomain={shopDomain} />
        </div>
      );
    }

    // For Ikas shops or other shop types, show the full merchant dashboard
    return (
      <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('dashboard.welcomeBack')}, {user?.displayName || t('common.merchant')}! 👋
            </h1>
            <p className="text-gray-600">
              {t('dashboard.todayOverview')}
            </p>
          </motion.div>

          {/* GTM Status Banner for Ikas stores */}
          {ikasShop && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GtmStatusBanner shop={ikasShop} />
            </motion.div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* KPI Cards */}
              <MotionContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MotionItem>
                  <KPICard
                    title={t('dashboard.totalAttributedSales')}
                    value={totalAttributedSales}
                    currency={currency}
                    icon={TrendingUp}
                    description={t('dashboard.affiliateStatsDescription')}
                    loading={statsLoading}
                    trend={{ direction: 'up', value: '+12.5%', label: t('dashboard.fromLastMonth') }}
                  />
                </MotionItem>
                <MotionItem>
                  <KPICard
                    title={t('dashboard.thisMonthSales')}
                    value={mockKPIs.thisMonthSales}
                    currency="EUR"
                    icon={DollarSign}
                    description={t('dashboard.thisMonthSalesDescription')}
                    trend={{ direction: 'up', value: '+8.2%', label: t('dashboard.fromLastMonth') }}
                  />
                </MotionItem>
                <MotionItem>
                  <KPICard
                    title={t('dashboard.pendingAmount')}
                    value={getTotalPendingAmount()}
                    currency="EUR"
                    icon={FileText}
                    description={t('dashboard.pendingAmountDescription')}
                    trend={{ direction: 'neutral', value: '3 ' + t('invoices.title').toLowerCase(), label: t('invoices.pending').toLowerCase() }}
                  />
                </MotionItem>
                <MotionItem>
                  <KPICard
                    title={t('dashboard.amountPaid')}
                    value={getTotalPaidAmount()}
                    currency="EUR"
                    icon={CreditCard}
                    description={t('dashboard.amountPaidDescription')}
                    trend={{ direction: 'up', value: '+15.3%', label: t('dashboard.fromLastMonth') }}
                  />
                </MotionItem>
              </MotionContainer>

              {/* Revenue Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <RevenueChart data={mockChartData} title={t('dashboard.revenueOverview')} />
              </motion.div>

              {/* Recent Invoices */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{t('dashboard.recentInvoices')}</CardTitle>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/invoices">
                          {t('dashboard.viewAll')}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentInvoices.map((invoice) => (
                      <InvoiceCard
                        key={invoice.id}
                        invoice={invoice}
                        onView={handleViewInvoice}
                        onPay={handlePayInvoice}
                        onDownload={handleDownloadInvoice}
                      />
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Quick Actions & Info */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('dashboard.quickActions')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      {t('dashboard.newPaymentLink')}
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      {t('dashboard.uploadInvoice')}
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <Link to="/invoices">
                        <FileText className="mr-2 h-4 w-4" />
                        {t('dashboard.viewAllInvoices')}
                      </Link>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <Link to="/settings">
                        <CreditCard className="mr-2 h-4 w-4" />
                        {t('dashboard.paymentSettings')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('dashboard.recentActivity')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockRecentActivities.slice(0, 4).map((activity, index) => (
                        <div key={activity.id}>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-lg">
                              {activity.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {activity.date}
                              </p>
                            </div>
                          </div>
                          {index < mockRecentActivities.slice(0, 4).length - 1 && (
                            <Separator className="my-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Methods */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('dashboard.paymentMethods')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🏦</div>
                        <div>
                          <p className="text-sm font-medium">{t('settings.bankTransfer')}</p>
                          <p className="text-xs text-muted-foreground">IBAN: DE89...0130 00</p>
                        </div>
                      </div>
                      <Badge variant="success">{t('dashboard.default')}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">💳</div>
                        <div>
                          <p className="text-sm font-medium">PayPal</p>
                          <p className="text-xs text-muted-foreground">merchant@example.com</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="link" className="w-full" asChild>
                      <Link to="/settings">{t('dashboard.managePaymentMethods')}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
    );
  }

  // This shouldn't happen as we redirect to /connect, but fallback just in case
  return null;
};

export default Dashboard;
