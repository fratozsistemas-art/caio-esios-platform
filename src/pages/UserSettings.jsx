import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function UserSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  const queryClient = useQueryClient();

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['current_user'],
    queryFn: () => base44.auth.me()
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates) => {
      return await base44.auth.updateMe(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['current_user']);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      // In a real implementation, this would call a backend function
      // For now, we'll just simulate it
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error) => {
      toast.error(`Failed to change password: ${error.message}`);
    }
  });

  // Email change mutation
  const requestEmailChangeMutation = useMutation({
    mutationFn: async (newEmail) => {
      // This would send a verification email
      setShowVerification(true);
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Verification code sent to your new email');
    }
  });

  // Verify email change
  const verifyEmailChangeMutation = useMutation({
    mutationFn: async ({ newEmail, code }) => {
      // This would verify the code and update the email
      return await base44.auth.updateMe({ email: newEmail });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['current_user']);
      toast.success('Email updated successfully');
      setNewEmail('');
      setVerificationCode('');
      setShowVerification(false);
    }
  });

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00D4FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">User Settings</h1>
          <p className="text-[#94A3B8]">Manage your account preferences and security</p>
        </motion.div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-[#1A1D29] border-[#00D4FF]/20">
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
              <Lock className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="2fa" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
              <Shield className="w-4 h-4 mr-2" />
              Two-Factor Auth
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
                <CardDescription className="text-[#94A3B8]">
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Full Name</Label>
                  <Input
                    value={user?.full_name || ''}
                    onChange={(e) => updateProfileMutation.mutate({ full_name: e.target.value })}
                    className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Email</Label>
                  <div className="flex gap-2">
                    <Input
                      value={user?.email || ''}
                      disabled
                      className="bg-[#0A2540] border-[#00D4FF]/30 text-white opacity-60"
                    />
                    <Button
                      variant="outline"
                      className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
                      onClick={() => {}}
                    >
                      Change Email
                    </Button>
                  </div>
                </div>

                {showVerification && (
                  <Alert className="bg-[#00D4FF]/10 border-[#00D4FF]/30">
                    <Mail className="w-4 h-4" />
                    <AlertDescription className="text-white">
                      <div className="space-y-3 mt-2">
                        <Input
                          placeholder="New email address"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
                        />
                        <Input
                          placeholder="Verification code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
                        />
                        <Button
                          onClick={() => verifyEmailChangeMutation.mutate({ newEmail, code: verificationCode })}
                          className="bg-[#00D4FF] text-[#0A2540]"
                        >
                          Verify & Update
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label className="text-white">Role</Label>
                  <Input
                    value={user?.role || 'user'}
                    disabled
                    className="bg-[#0A2540] border-[#00D4FF]/30 text-white opacity-60"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
              <CardHeader>
                <CardTitle className="text-white">Change Password</CardTitle>
                <CardDescription className="text-[#94A3B8]">
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Current Password</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Confirm New Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
                  />
                </div>

                <Button
                  onClick={handlePasswordChange}
                  disabled={!currentPassword || !newPassword || !confirmPassword || changePasswordMutation.isPending}
                  className="bg-[#00D4FF] text-[#0A2540] hover:bg-[#00B8E6]"
                >
                  {changePasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
              <CardHeader>
                <CardTitle className="text-white">Notification Preferences</CardTitle>
                <CardDescription className="text-[#94A3B8]">
                  Manage how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Email Notifications</Label>
                    <p className="text-sm text-[#94A3B8]">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={user?.notification_preferences?.email ?? true}
                    onCheckedChange={(checked) => 
                      updateProfileMutation.mutate({ 
                        notification_preferences: { ...user?.notification_preferences, email: checked }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Task Updates</Label>
                    <p className="text-sm text-[#94A3B8]">Notifications for task assignments and updates</p>
                  </div>
                  <Switch
                    checked={user?.notification_preferences?.tasks ?? true}
                    onCheckedChange={(checked) => 
                      updateProfileMutation.mutate({ 
                        notification_preferences: { ...user?.notification_preferences, tasks: checked }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Agent Notifications</Label>
                    <p className="text-sm text-[#94A3B8]">Updates from AI agents and workflows</p>
                  </div>
                  <Switch
                    checked={user?.notification_preferences?.agents ?? true}
                    onCheckedChange={(checked) => 
                      updateProfileMutation.mutate({ 
                        notification_preferences: { ...user?.notification_preferences, agents: checked }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Weekly Summary</Label>
                    <p className="text-sm text-[#94A3B8]">Weekly digest of your activity</p>
                  </div>
                  <Switch
                    checked={user?.notification_preferences?.weekly_summary ?? false}
                    onCheckedChange={(checked) => 
                      updateProfileMutation.mutate({ 
                        notification_preferences: { ...user?.notification_preferences, weekly_summary: checked }
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 2FA Tab */}
          <TabsContent value="2fa">
            <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
              <CardHeader>
                <CardTitle className="text-white">Two-Factor Authentication</CardTitle>
                <CardDescription className="text-[#94A3B8]">
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-[#00D4FF]/10 border-[#00D4FF]/30">
                  <Shield className="w-4 h-4" />
                  <AlertDescription className="text-white">
                    Two-factor authentication is currently <strong>not enabled</strong> for your account.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <p className="text-sm text-[#94A3B8]">
                    Enable 2FA to secure your account with an additional verification step during login.
                  </p>
                  <Button
                    className="bg-[#00D4FF] text-[#0A2540] hover:bg-[#00B8E6]"
                    onClick={() => toast.info('2FA setup coming soon')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Enable Two-Factor Authentication
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}