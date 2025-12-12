import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Lock, Mail, Shield, Eye, Download, MessageSquare, 
  AlertCircle, CheckCircle, Loader2, Calendar, Clock 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SharedResource() {
  const { shareToken } = useParams();
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [validated, setValidated] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    setValidationError(null);

    try {
      const { data } = await base44.functions.invoke('validateShareLink', {
        share_token: shareToken,
        password: password || undefined,
        email: email || undefined
      });

      if (data.valid) {
        setValidated(true);
      } else {
        setValidationError(data.error);
      }
    } catch (error) {
      setValidationError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const { data: shareData } = useQuery({
    queryKey: ['shared_resource', shareToken],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('validateShareLink', {
        share_token: shareToken,
        password,
        email
      });
      return data;
    },
    enabled: validated
  });

  if (!shareToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] flex items-center justify-center p-6">
        <Card className="bg-white/5 border-red-500/30 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Invalid Share Link</h2>
            <p className="text-slate-300">The share link is invalid or malformed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!validated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="bg-white/5 border-[#00D4FF]/20">
            <CardHeader className="text-center border-b border-white/10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white text-2xl">Secure Resource Access</CardTitle>
              <p className="text-slate-400 text-sm mt-2">
                This resource is protected. Please verify your access.
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {validationError?.includes('password') && (
                <div>
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="bg-white/5 border-white/10 text-white mt-2"
                    onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
                  />
                </div>
              )}

              {validationError?.includes('email') && (
                <div>
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Verification
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-white/5 border-white/10 text-white mt-2"
                    onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
                  />
                </div>
              )}

              {validationError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {validationError}
                  </p>
                </div>
              )}

              <Button
                onClick={handleValidate}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Access Resource
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Display the shared resource
  const { resource, share_link, access_info } = shareData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/5 border-[#00D4FF]/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Shared {share_link.resource_type}
                </h1>
                {share_link.custom_message && (
                  <p className="text-slate-300 text-sm mb-4">{share_link.custom_message}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Shared by: {share_link.created_by}</span>
                  {access_info.expires_in_hours !== null && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expires in {access_info.expires_in_hours}h
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {share_link.permissions.can_view && (
                  <Badge className="bg-blue-500/20 text-blue-400">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Badge>
                )}
                {share_link.permissions.can_download && (
                  <Badge className="bg-green-500/20 text-green-400">
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Badge>
                )}
                {share_link.permissions.can_comment && (
                  <Badge className="bg-purple-500/20 text-purple-400">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Comment
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resource Content */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8">
            {resource ? (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  {resource.title || resource.name}
                </h2>
                <p className="text-slate-300">{resource.description}</p>
                
                {/* Render resource-specific content here */}
                <pre className="mt-6 p-4 rounded-lg bg-black/30 text-slate-300 text-sm overflow-auto">
                  {JSON.stringify(resource, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-slate-400 text-center">Resource not found or access denied</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}