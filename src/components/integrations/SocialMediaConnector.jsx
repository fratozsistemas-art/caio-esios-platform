import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Facebook, Instagram, MessageCircle, Loader2
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const PLATFORMS = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'from-blue-600 to-blue-700',
    description: 'Conexões, posts e grupos'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'from-pink-600 to-purple-600',
    description: 'Seguidores e engajamento'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'from-green-600 to-green-700',
    description: 'Contatos e grupos'
  }
];

export default function SocialMediaConnector() {
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const queryClient = useQueryClient();

  const connectMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('connectSocialMedia', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['dataSources']);
      setSelectedPlatform(null);
      setAccessToken("");
      toast.success('Rede social conectada!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Erro ao conectar');
    }
  });

  const handleConnect = () => {
    if (!accessToken.trim()) {
      toast.error('Insira o access token');
      return;
    }

    connectMutation.mutate({
      platform: selectedPlatform,
      access_token: accessToken,
      config: {
        sync_frequency: 'daily',
        data_types: ['connections', 'messages', 'posts']
      }
    });
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Conectar Redes Sociais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            return (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`p-4 rounded-lg border ${
                  selectedPlatform === platform.id
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                } transition-all`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold text-sm mb-1">{platform.name}</h4>
                <p className="text-xs text-slate-400">{platform.description}</p>
              </button>
            );
          })}
        </div>

        {selectedPlatform && (
          <div className="space-y-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div>
              <h4 className="text-white font-semibold mb-2">
                Conectar {PLATFORMS.find(p => p.id === selectedPlatform)?.name}
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                Insira o access token da API. Para obtê-lo, acesse o dashboard de desenvolvedor da plataforma.
              </p>
            </div>

            <Input
              placeholder="Access Token"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />

            <div className="flex gap-2">
              <Button
                onClick={handleConnect}
                disabled={connectMutation.isPending}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {connectMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Conectar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedPlatform(null);
                  setAccessToken("");
                }}
                className="border-white/10 text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 text-xs text-yellow-300">
              ⚠️ Este é um recurso demo. Em produção, use OAuth flow completo.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}