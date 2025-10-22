import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllUsers, 
  getAllShops, 
  getSystemStats,
  searchUsers,
  searchShops
} from '../../services/adminService';
import { useTranslations } from '../../hooks/useTranslations';
import LoadingSpinner from '../LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, shopsData] = await Promise.all([
        getSystemStats(),
        getAllUsers(50),
        getAllShops()
      ]);
      
      setStats(statsData);
      setUsers(usersData.users);
      setShops(shopsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadData();
      return;
    }

    try {
      setSearching(true);
      const [userResults, shopResults] = await Promise.all([
        searchUsers(searchTerm),
        searchShops(searchTerm)
      ]);
      
      setUsers(userResults);
      setShops(shopResults);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    loadData();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading admin panel..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">Admin Panel</h1>
            <Badge variant="outline" className="text-lg px-4 py-2">
              🔐 Admin Access
            </Badge>
          </div>
          <p className="text-gray-600">Manage users, shops, and view system statistics</p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search users by email or shops by domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? 'Searching...' : 'Search'}
              </Button>
              {searchTerm && (
                <Button variant="outline" onClick={handleClearSearch}>
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="shops">Shops ({shops.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <svg
                    className="h-4 w-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.adminUsers || 0} admin(s)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
                  <svg
                    className="h-4 w-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalShops || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.verifiedShops || 0} verified
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Shopify Stores</CardTitle>
                  <Badge variant="secondary">Shopify</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.shopTypeCount?.shopify || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Other Platforms</CardTitle>
                  <Badge variant="secondary">Other</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.shopTypeCount?.other || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">
                      {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Types:</span>
                    <span className="font-medium">
                      {Object.keys(stats?.shopTypeCount || {}).join(', ') || 'None'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Display Name</th>
                        <th className="text-left p-4">Role</th>
                        <th className="text-left p-4">Created At</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center p-8 text-gray-500">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{user.email || 'N/A'}</td>
                            <td className="p-4">{user.displayName || 'N/A'}</td>
                            <td className="p-4">
                              <Badge variant={user.role === 'admin' || user.isAdmin ? 'default' : 'secondary'}>
                                {user.role === 'admin' || user.isAdmin ? 'Admin' : 'User'}
                              </Badge>
                            </td>
                            <td className="p-4">{formatDate(user.createdAt)}</td>
                            <td className="p-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/admin/users/${user.id}`)}
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shops Tab */}
          <TabsContent value="shops">
            <Card>
              <CardHeader>
                <CardTitle>All Shops</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Shop Name</th>
                        <th className="text-left p-4">Owner</th>
                        <th className="text-left p-4">Platform</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Connected At</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shops.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center p-8 text-gray-500">
                            No shops found
                          </td>
                        </tr>
                      ) : (
                        shops.map((shop) => (
                          <tr key={`${shop.userId}-${shop.id}`} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium">{shop.shopName}</td>
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{shop.userName}</div>
                                <div className="text-sm text-gray-500">{shop.userEmail}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="secondary">
                                {shop.shopType || 'unknown'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge variant={shop.verified ? 'default' : 'outline'}>
                                {shop.verified ? 'Verified' : 'Unverified'}
                              </Badge>
                            </td>
                            <td className="p-4">{formatDate(shop.connectedAt)}</td>
                            <td className="p-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/admin/shops/${shop.userId}/${shop.id}`)}
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
