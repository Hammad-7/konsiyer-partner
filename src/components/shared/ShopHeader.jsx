import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Globe, TrendingUp, Package } from 'lucide-react';
import { format } from 'date-fns';

export const ShopHeader = ({ shop, showStats = true }) => {
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {shop.logo ? (
              <img 
                src={shop.logo} 
                alt={shop.name} 
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-2xl mb-1">{shop.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>{shop.domain}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={shop.status === 'active' ? 'success' : 'secondary'} className="capitalize">
                  {shop.status}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {shop.shopType}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      {showStats && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Total Sales</span>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(shop.totalSales, shop.currency)}
              </p>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">Total Orders</span>
              </div>
              <p className="text-2xl font-bold">{shop.totalOrders.toLocaleString()}</p>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-muted-foreground">Connected Since</span>
              </div>
              <p className="text-2xl font-bold">
                {format(new Date(shop.connectedDate), 'MMM yyyy')}
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ShopHeader;
