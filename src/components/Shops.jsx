import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

import ShopHeader from './shared/ShopHeader';
import { Button } from '@/components/ui/button';
import { MotionContainer, MotionItem } from './shared/MotionCard';

import { mockShops } from '@/data/mockData';
import { useShop } from '../contexts/ShopContext';

const Shops = () => {
  const { connectedShops } = useShop();

  // Combine real connected shops with mock data
  const allShops = mockShops.map(shop => {
    const connectedShop = connectedShops?.find(cs => cs.shopName === shop.name);
    return {
      ...shop,
      isRealConnection: !!connectedShop,
      realData: connectedShop,
    };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shops</h1>
            <p className="text-gray-600">
              Manage your connected shops and view their performance.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Connect New Shop
          </Button>
        </motion.div>

        {/* Shop List */}
        <MotionContainer className="space-y-6">
          {allShops.map((shop, index) => (
            <MotionItem key={shop.id}>
              <ShopHeader shop={shop} showStats={true} />
            </MotionItem>
          ))}
        </MotionContainer>

        {/* Empty State (if no shops) */}
        {allShops.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="mx-auto h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No shops connected
            </h3>
            <p className="text-gray-600 mb-6">
              Connect your first shop to start tracking sales and managing invoices.
            </p>
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Connect Your First Shop
            </Button>
          </motion.div>
        )}
      </div>
  );
};

export default Shops;
