import React, { useState } from 'react';
import { User, MapPin, Shield, Bell, CheckCircle2, Lock, Plus } from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { toast } from '../../components/ui/Toast';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    firstName: user?.first_name || 'Customer',
    lastName: user?.last_name || '',
    phone: user?.phone || '+91 98765 43210'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    toast.success('Profile updated successfully');
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Security password updated');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const tabs = [
    { id: 'profile', label: 'Profile Details', icon: <User className="w-4 h-4" /> },
    { id: 'addresses', label: 'Saved Addresses', icon: <MapPin className="w-4 h-4" /> },
    { id: 'security', label: 'Security & Password', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Preferences', icon: <Bell className="w-4 h-4" /> }
  ];

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <Card padding="lg" className="rounded-3xl border border-border shadow-xl">
            <div className="w-16 h-16 rounded-full bg-accent-subtle text-accent flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-text mb-2">Account Required</h2>
            <p className="text-sm text-text-muted mb-6">Please log in to manage your rental profile and preferences.</p>
            <div className="flex flex-col gap-3">
              <Button size="lg" className="rounded-xl font-bold" onClick={() => navigate('/login')}>Sign In</Button>
              <Button variant="secondary" size="lg" className="rounded-xl font-bold" onClick={() => navigate('/register')}>Create Account</Button>
            </div>
          </Card>
        </div>
      </PageTransition>
    );
  }

  const initials = `${user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}${user?.last_name?.charAt(0) || ''}`.toUpperCase();

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Account Dashboard</span>
            <h1 className="text-3xl font-extrabold text-text mt-1">Account Settings</h1>
          </div>
          <Button variant="secondary" size="sm" className="rounded-xl font-bold text-danger hover:bg-danger/10 w-fit" onClick={logout}>
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Sidebar Nav */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="flex md:flex-col gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0 bg-bg-elevated p-2 rounded-2xl border border-border">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap text-left
                    ${activeTab === tab.id 
                      ? 'bg-accent text-white shadow-sm' 
                      : 'hover:bg-bg-subtle text-text-secondary hover:text-text'}
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-8 lg:col-span-9">
            <Card padding="lg" className="rounded-3xl border border-border bg-bg-elevated shadow-sm">
              
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-text mb-1">Personal Profile</h2>
                    <p className="text-xs text-text-muted">Manage your personal identification and contact details</p>
                  </div>
                  
                  <div className="flex items-center gap-4 py-3 border-y border-border-subtle">
                    <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center text-xl font-extrabold shadow-sm">
                      {initials}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-text text-base">{user?.first_name} {user?.last_name}</h4>
                      <p className="text-xs text-text-muted">{user?.email}</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">First Name</label>
                        <Input 
                          value={profileForm.firstName} 
                          onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} 
                          className="bg-bg-subtle border-border"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Last Name</label>
                        <Input 
                          value={profileForm.lastName} 
                          onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} 
                          className="bg-bg-subtle border-border"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Email Address</label>
                      <Input 
                        value={user?.email || 'customer@rentos.com'} 
                        readOnly 
                        className="bg-bg-subtle text-text-muted cursor-not-allowed border-border opacity-75" 
                      />
                      <span className="text-[11px] text-text-muted mt-1 block">Account primary email cannot be changed directly.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Phone Number</label>
                      <Input 
                        value={profileForm.phone} 
                        onChange={e => setProfileForm({...profileForm, phone: e.target.value})} 
                        className="bg-bg-subtle border-border"
                      />
                    </div>

                    <Button type="submit" size="lg" className="rounded-xl font-bold shadow-md px-6 py-2.5">
                      Save Profile Changes
                    </Button>
                  </form>
                </div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-extrabold text-text mb-1">Saved Addresses</h2>
                      <p className="text-xs text-text-muted">Manage your doorstep delivery & return pick-up locations</p>
                    </div>
                    <Button size="sm" className="rounded-xl font-bold flex items-center gap-1" onClick={() => toast.info('Add Address dialog opens')}>
                      <Plus className="w-4 h-4" /> Add Address
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="border border-accent bg-accent-subtle/40 rounded-2xl p-5 relative">
                      <span className="absolute top-3 right-3 bg-accent text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Default Delivery
                      </span>
                      <h4 className="font-extrabold text-text mb-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent" /> Home Location
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed mb-4">
                        123 Main Street, Suite 4B<br/>
                        Connaught Place, New Delhi - 110001, India<br/>
                        Phone: {user?.phone || '+91 98765 43210'}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" className="rounded-lg text-xs font-bold">Edit</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <div className="space-y-6 max-w-lg">
                  <div>
                    <h2 className="text-xl font-extrabold text-text mb-1">Security & Password</h2>
                    <p className="text-xs text-text-muted">Update your account password and security settings</p>
                  </div>

                  <form onSubmit={handlePasswordSave} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Current Password</label>
                      <Input 
                        type="password" 
                        placeholder="••••••••"
                        value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        required
                        className="bg-bg-subtle border-border"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">New Password</label>
                      <Input 
                        type="password" 
                        placeholder="At least 8 characters"
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        required
                        className="bg-bg-subtle border-border"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Confirm New Password</label>
                      <Input 
                        type="password" 
                        placeholder="Repeat new password"
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        required
                        className="bg-bg-subtle border-border"
                      />
                    </div>

                    <Button type="submit" size="lg" className="rounded-xl font-bold shadow-md px-6 py-2.5">
                      Update Password
                    </Button>
                  </form>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div className="space-y-6 max-w-lg">
                  <div>
                    <h2 className="text-xl font-extrabold text-text mb-1">Communication Preferences</h2>
                    <p className="text-xs text-text-muted">Choose how you receive rental updates and reminders</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { title: 'Rental Order Status Updates', desc: 'Email alerts when rental is confirmed, dispatched, or delivered' },
                      { title: 'Return Due Date Reminders', desc: 'SMS and email notifications 24 hours before return date' },
                      { title: 'Security Deposit Refund Alert', desc: 'Instant notification upon deposit release confirmation' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-bg-subtle border border-border">
                        <div>
                          <h4 className="font-bold text-text text-sm">{item.title}</h4>
                          <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
                        </div>
                        <input 
                          type="checkbox" 
                          defaultChecked 
                          className="w-5 h-5 rounded border-border text-accent accent-accent cursor-pointer mt-1"
                        />
                      </div>
                    ))}
                    
                    <Button size="lg" className="rounded-xl font-bold shadow-md px-6 py-2.5" onClick={() => toast.success('Preferences saved')}>
                      Save Preferences
                    </Button>
                  </div>
                </div>
              )}

            </Card>
          </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default AccountPage;
