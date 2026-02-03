import { motion } from 'framer-motion';
import { useShop } from '../../contexts/ShopContext';
import { useTranslations } from '../../hooks/useTranslations';
import ShopifyDashboardContent from './ShopifyDashboardContent';
import IkasDashboardContent from './IkasDashboardContent';
import XmlDashboardContent from './XmlDashboardContent';
import { Store } from 'lucide-react';

// Shop type icons
const SHOP_TYPE_ICONS = {
  shopify: '/icons/shopify_glyph.svg',
  ikas: '/icons/ikas_icon.png',
  xml: null, // No specific icon for XML, will use default
};

/**
 * UnifiedDashboard Component
 * 
 * A unified dashboard that works for all shop types (Shopify, Ikas, XML).
 * Each shop type has its own pluggable child component that is injected into the main dashboard.
 * 
 * Note: This component assumes that routing/loading logic is already handled by parent (Dashboard.jsx)
 */
export default function UnifiedDashboard() {
  const { connectedShops } = useShop();
  const { t } = useTranslations();

  console.log("=== UnifiedDashboard Render ===");
  console.log("connectedShops:", connectedShops);

  // If user has no connected shops, this shouldn't happen but fallback just in case
  if (!connectedShops || connectedShops.length === 0) {
    console.log("❌ No connected shops - returning null");
    return null;
  }

  // Get the primary shop (for now, use the first one)
  // In the future, this could be configurable by the user
  const primaryShop = connectedShops[0];
  const shopType = primaryShop.shopType || 'shopify';
  const shopName = primaryShop.shopName || primaryShop.shop || 'Unknown Shop';
  const shopIcon = SHOP_TYPE_ICONS[shopType];

  console.log("Primary shop:", { shopName, shopType, shopIcon });

  // Get shop type display name
  const getShopTypeDisplay = (type) => {
    switch (type) {
      case 'shopify':
        return 'Shopify';
      case 'ikas':
        return 'Ikas';
      case 'xml':
        return 'XML';
      default:
        return type;
    }
  };

  // Get the appropriate dashboard content component based on shop type
  const getDashboardContent = () => {
    switch (shopType) {
      case 'shopify':
        return <ShopifyDashboardContent shop={primaryShop} />;
      case 'ikas':
        return <IkasDashboardContent shop={primaryShop} />;
      case 'xml':
        return <XmlDashboardContent shop={primaryShop} />;
      default:
        return <IkasDashboardContent shop={primaryShop} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Dashboard Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          {/* Shop Icon */}
          {shopIcon ? (
            <img 
              src={shopIcon} 
              alt={getShopTypeDisplay(shopType)}
              className="w-12 h-12 object-contain"
            />
          ) : (
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-indigo-600" />
            </div>
          )}
          
          {/* Shop Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {shopName}
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {getShopTypeDisplay(shopType)}
              </span>
              <span>•</span>
              <span>{t('unifiedDashboard.welcomeBack')}</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Shop-Specific Dashboard Content */}
      {getDashboardContent()}
    </div>
  );
}
