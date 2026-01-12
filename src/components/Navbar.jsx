import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, LogOut, User, Settings as SettingsIcon, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import { useTranslations } from '../hooks/useTranslations';
import LanguageSwitcher from './LanguageSwitcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * UnifiedNavbar - Single navigation bar for all user states
 * Dynamically adjusts based on:
 * - Unauthenticated: Shows logo, language switcher, and login/register buttons
 * - Onboarding: Shows logo, language switcher, and user menu (limited)
 * - Authenticated: Shows full navigation with sidebar toggle, shop selector, notifications, and user menu
 */
const UnifiedNavbar = ({ onSidebarToggle, authMode = 'login', onAuthModeChange }) => {
  const { user, isAdmin, signOut, loading } = useAuth();
  const { connectedShops, hasConnectedShops } = useShop();
  const { t } = useTranslations();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine user state
  const isAuthenticated = !!user;
  const isOnboarding = isAuthenticated && !hasConnectedShops;
  const isFullyAuthenticated = isAuthenticated && hasConnectedShops;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const handleAuthNavigation = () => {
    if (authMode === 'login') {
      onAuthModeChange?.('register');
    } else {
      onAuthModeChange?.('login');
    }
  };

  const getAuthButtonText = () => {
    return authMode === 'login' ? t('nav.register') : t('nav.login');
  };

  if (loading) {
    return (
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <img src="/logo.svg" alt="Alfreya" className="h-8 w-auto" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Sidebar Toggle (only for fully authenticated users) */}
          {isFullyAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onSidebarToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Logo - Always visible */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => navigate(isFullyAuthenticated ? '/dashboard' : '/')}
          >
            <img src="/logo.svg" alt="Alfreya" className="h-8 w-auto" />
          </div>
        </div>

        {/* Right Section - Dynamic based on user state */}
        <div className="flex items-center gap-3">
          {/* Shop Selector - Only for fully authenticated users */}
          {/* {isFullyAuthenticated && connectedShops && connectedShops.length > 0 && (
            <div className="hidden md:block max-w-xs">
              <Select defaultValue={connectedShops[0]?.id}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t('nav.selectShop')} />
                </SelectTrigger>
                <SelectContent>
                  {connectedShops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      <div className="flex items-center gap-2">
                        {shop.shopType === 'shopify' && (
                          <img src="/icons/shopify_glyph.svg" alt="" className="h-4 w-4" />
                        )}
                        <span className="truncate">{shop.shopName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )} */}

          {/* Language Switcher - Always visible */}
          <LanguageSwitcher />

          {/* Notifications - Only for fully authenticated users */}
          {/* {isFullyAuthenticated && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('nav.notifications')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )} */}

          {/* Authentication Actions */}
          {!isAuthenticated ? (
            // Unauthenticated: Show login/register button
            <button
              onClick={handleAuthNavigation}
              className="flex items-center space-x-1 bg-brand-600 text-white hover:bg-brand-700 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-sm font-medium"
            >
              <span>{getAuthButtonText()}</span>
            </button>
          ) : (
            // Authenticated (onboarding or fully authenticated): Show user menu
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL} />
                    <AvatarFallback className="bg-brand-100 text-brand-600">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block text-sm font-medium">
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('common.account')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Only show profile/settings for fully authenticated users */}
                {isFullyAuthenticated && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <User className="mr-2 h-4 w-4" />
                      {t('common.profile')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      {t('common.settings')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                {/* Show admin panel link for admin users */}
                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="text-brand-600 font-medium">
                      <Shield className="mr-2 h-4 w-4" />
                      {t('nav.admin')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default UnifiedNavbar;
