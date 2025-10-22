import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getAllAdmins, 
  addAdmin, 
  removeAdmin, 
  searchUsersForAdmin
} from '../../services/adminService';
import LoadingSpinner from '../LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '../ui/dialog';

const AdminManagement = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const adminList = await getAllAdmins();
      setAdmins(adminList);
    } catch (error) {
      console.error('Error loading admins:', error);
      setError('Failed to load admin list: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchTerm || searchTerm.trim().length < 3) {
      setError('Please enter at least 3 characters to search');
      return;
    }

    try {
      setSearching(true);
      setError(null);
      const results = await searchUsersForAdmin(searchTerm);
      setSearchResults(results);
      
      if (results.length === 0) {
        setError('No users found matching your search');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users: ' + error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!selectedUser) {
      setError('Please select a user to promote');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      
      await addAdmin(user.uid, selectedUser.id);
      
      setSuccess(`Successfully promoted ${selectedUser.email} to admin`);
      setIsAddDialogOpen(false);
      setSelectedUser(null);
      setSearchTerm('');
      setSearchResults([]);
      
      // Reload admin list
      await loadAdmins();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error adding admin:', error);
      setError('Failed to add admin: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!selectedUser) {
      setError('Please select an admin to remove');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      
      await removeAdmin(user.uid, selectedUser.id);
      
      setSuccess(`Successfully removed admin privileges from ${selectedUser.email}`);
      setIsRemoveDialogOpen(false);
      setSelectedUser(null);
      
      // Reload admin list
      await loadAdmins();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error removing admin:', error);
      setError('Failed to remove admin: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openRemoveDialog = (admin) => {
    setSelectedUser(admin);
    setIsRemoveDialogOpen(true);
    setError(null);
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
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" text="Loading admin management..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Header with Add Admin Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
          <p className="text-gray-600 mt-1">Manage admin users and permissions</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>
                Search for a user by email or user ID to promote them to admin
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search by email or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
                  className="flex-1"
                />
                <Button onClick={handleSearchUsers} disabled={searching}>
                  {searching ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 ${
                        selectedUser?.id === user.id ? 'bg-blue-50 border-blue-500' : ''
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{user.email}</div>
                          {user.displayName && user.displayName !== 'N/A' && (
                            <div className="text-sm text-gray-500">{user.displayName}</div>
                          )}
                          <div className="text-xs text-gray-400">ID: {user.id}</div>
                        </div>
                        {selectedUser?.id === user.id && (
                          <div className="text-blue-600">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setSelectedUser(null);
                  setSearchTerm('');
                  setSearchResults([]);
                  setError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddAdmin}
                disabled={!selectedUser || actionLoading}
              >
                {actionLoading ? 'Adding...' : 'Add as Admin'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Admins ({admins.length})</CardTitle>
          <CardDescription>
            Users with administrative access to the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Display Name</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Added</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-8 text-gray-500">
                      No admins found
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{admin.email}</td>
                      <td className="p-4">{admin.displayName}</td>
                      <td className="p-4">
                        <Badge variant={admin.isSuperAdmin ? 'default' : 'secondary'}>
                          {admin.isSuperAdmin ? (
                            <span className="flex items-center gap-1">
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Super Admin
                            </span>
                          ) : (
                            'Admin'
                          )}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {formatDate(admin.createdAt)}
                      </td>
                      <td className="p-4">
                        {admin.isSuperAdmin ? (
                          <Badge variant="outline" className="text-gray-400">
                            Protected
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openRemoveDialog(admin)}
                          >
                            Remove Admin
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Remove Admin Confirmation Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Admin Privileges</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove admin privileges from this user?
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium">{selectedUser.email}</div>
                {selectedUser.displayName && selectedUser.displayName !== 'N/A' && (
                  <div className="text-sm text-gray-600">{selectedUser.displayName}</div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                This user will no longer have access to the admin panel and admin-only features.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRemoveDialogOpen(false);
                setSelectedUser(null);
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveAdmin}
              disabled={actionLoading}
            >
              {actionLoading ? 'Removing...' : 'Remove Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManagement;
