import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download, Palette, Type, Image, Layout, Sparkles, FileText,
  CheckCircle, Copy, ExternalLink, Eye, Layers, Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const LOGOS = {
  foundation_horizontal: {
    name: "Foundation - Horizontal",
    url: "https://www.genspark.ai/api/files/s/svnMkxg6",
    format: "16:9 Landscape (1365×768px)",
    usage: "Website, LinkedIn, apresentações corporativas",
    tagline: "Augmented Intelligence Platform",
    colors: ["#0A2540", "#00D4FF", "#F59E0B"]
  },
  foundation_vertical: {
    name: "Foundation - Vertical",
    url: "https://www.genspark.ai/api/files/s/o1856kPz",
    format: "9:16 Portrait",
    usage: "Instagram Stories, mobile splash screens, business cards",
    tagline: "Augmented Intelligence Platform",
    colors: ["#0A2540", "#00D4FF", "#F59E0B"]
  },
  vanguard_premium: {
    name: "Vanguard - Premium Exclusive 🔒",
    url: "https://www.genspark.ai/api/files/s/IOosW7Or",
    format: "16:9 Landscape (1365×768px)",
    usage: "Comunidade privada APENAS - eventos exclusivos, manifesto",
    tagline: "Strategic insight at thought speed",
    colors: ["#06101F", "#00D4FF", "#C7A763"],
    premium: true,
    warning: "⚠️ NÃO usar publicamente"
  },
  icon_biotech: {
    name: "Icon Only - Bio-Tech Neural",
    url: "https://www.genspark.ai/api/files/s/HUKHaZUi",
    format: "1:1 Square (1024×1024px)",
    usage: "App icons (iOS/Android), favicon, profile pictures",
    sizes: "Tree-branch neural pathways (bio-organic)",
    special: "Bio-organic neural design"
  },
  monochrome_print: {
    name: "Monochrome - Print B&W",
    url: "https://www.genspark.ai/api/files/s/2EUOwV92",
    format: "16:9 Horizontal (1365×768px)",
    usage: "Impressão P&B, bordado, alto contraste, engraving",
    colors: ["#FFFFFF", "#1A1D29"],
    special: "White on Graphite"
  }
};

const COLOR_PALETTE = {
  primary: [
    { name: "CAIO Deep Blue", hex: "#0A2540", rgb: "10, 37, 64", usage: "Primary brand, backgrounds" },
    { name: "Electric Cyan", hex: "#00D4FF", rgb: "0, 212, 255", usage: "Accents, CTAs, highlights" },
    { name: "Graphite", hex: "#1A1D29", rgb: "26, 29, 41", usage: "Cards, surfaces" }
  ],
  secondary: [
    { name: "Slate", hex: "#475569", rgb: "71, 85, 105", usage: "Secondary text" },
    { name: "Steel", hex: "#94A3B8", rgb: "148, 163, 184", usage: "Muted text" },
    { name: "Mist", hex: "#F1F5F9", rgb: "241, 245, 249", usage: "Light backgrounds" }
  ],
  semantic: [
    { name: "Success", hex: "#10B981", rgb: "16, 185, 129", usage: "Success states" },
    { name: "Warning", hex: "#F59E0B", rgb: "245, 158, 11", usage: "Warnings, amber accents" },
    { name: "Error", hex: "#EF4444", rgb: "239, 68, 68", usage: "Errors, critical" },
    { name: "Info", hex: "#3B82F6", rgb: "59, 130, 246", usage: "Information" }
  ],
  vanguard: [
    { name: "Abyss Blue", hex: "#06101F", rgb: "6, 16, 31", usage: "Vanguard backgrounds" },
    { name: "Metallic Gold", hex: "#C7A763", rgb: "199, 167, 99", usage: "Premium accents" },
    { name: "Purple Imperial", hex: "#2A1B3D", rgb: "42, 27, 61", usage: "Mystical depth" }
  ]
};

const TYPOGRAPHY = {
  display: {
    family: "Inter",
    weights: ["700", "800", "900"],
    usage: "Headlines, hero text",
    sizes: "32px - 72px",
    tracking: "-0.02em"
  },
  body: {
    family: "Inter",
    weights: ["400", "500", "600"],
    usage: "Body text, paragraphs",
    sizes: "14px - 18px",
    lineHeight: "1.6"
  },
  mono: {
    family: "JetBrains Mono",
    weights: ["400", "500", "600"],
    usage: "Code, technical specs",
    sizes: "12px - 16px"
  }
};

const RESOURCES = {
  brand_manual: {
    name: "Brand Manual Completo",
    url: "https://www.genspark.ai/api/files/s/GKSV5UYg",
    type: "PDF",
    size: "50+ páginas",
    description: "Documentação completa do sistema de identidade visual"
  },
  logo_kit: {
    name: "Logo Kit Original",
    url: "https://www.genspark.ai/api/files/s/nciJOZxj",
    type: "ZIP",
    description: "Pacote completo com todos os logos em múltiplos formatos"
  },
  video_widescreen: {
    name: "Vídeo Widescreen Animado",
    url: "https://www.genspark.ai/api/files/s/cOgDEmOb",
    type: "MP4",
    duration: "8 segundos",
    format: "16:9",
    description: "Brain bio-tech animado com tagline corrigida"
  }
};

export default function BrandManual() {
  const [activeTab, setActiveTab] = useState("logos");

  const copyColor = (hex) => {
    navigator.clipboard.writeText(hex);
    toast.success(`Color ${hex} copied to clipboard`);
  };

  const downloadLogo = (logoKey, logoData) => {
    toast.info(`Opening ${logoData.name} in new tab for download`);
    window.open(logoData.url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <Palette className="w-6 h-6 text-white" />
          </div>
          Brand Manual & Assets
        </h1>
        <p className="text-slate-400">Complete brand identity system for CAIO·AI Platform</p>
      </div>

      {/* Status Summary */}
      <Card className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-green-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Phase 1 Complete ✅</h3>
              <p className="text-sm text-slate-400">5/5 logos finalized • Full brand system documented</p>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Foundation
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Shield className="w-3 h-3 mr-1" />
                Vanguard
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10 grid grid-cols-5">
          <TabsTrigger value="logos" className="data-[state=active]:bg-cyan-500/20">
            <Image className="w-4 h-4 mr-2" />
            Logos
          </TabsTrigger>
          <TabsTrigger value="colors" className="data-[state=active]:bg-purple-500/20">
            <Palette className="w-4 h-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="data-[state=active]:bg-blue-500/20">
            <Type className="w-4 h-4 mr-2" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="guidelines" className="data-[state=active]:bg-green-500/20">
            <Layout className="w-4 h-4 mr-2" />
            Guidelines
          </TabsTrigger>
          <TabsTrigger value="downloads" className="data-[state=active]:bg-yellow-500/20">
            <Download className="w-4 h-4 mr-2" />
            Downloads
          </TabsTrigger>
        </TabsList>

        {/* Logos Tab */}
        <TabsContent value="logos" className="mt-6">
          <div className="grid gap-6">
            {Object.entries(LOGOS).map(([key, logo], idx) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`bg-white/5 border-white/10 ${logo.premium ? 'border-purple-500/30' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          {logo.name}
                          {logo.premium && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {logo.format} • {logo.usage}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(logo.url, '_blank')}
                          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => downloadLogo(key, logo)}
                          className="bg-cyan-600 hover:bg-cyan-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-lg p-8 mb-4 border border-white/10">
                      <img
                        src={logo.url}
                        alt={logo.name}
                        className="w-full h-auto"
                        style={{ maxHeight: '200px', objectFit: 'contain' }}
                        loading="lazy"
                      />
                    </div>
                    {logo.warning && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm font-medium">{logo.warning}</p>
                      </div>
                    )}
                    {logo.special && (
                      <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <p className="text-purple-400 text-sm">✨ {logo.special}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {logo.tagline && (
                        <div>
                          <p className="text-slate-500 mb-1">Tagline</p>
                          <p className="text-white font-medium">{logo.tagline}</p>
                        </div>
                      )}
                      {logo.colors && (
                        <div>
                          <p className="text-slate-500 mb-1">Colors</p>
                          <div className="flex gap-2">
                            {logo.colors.map(color => (
                              <div
                                key={color}
                                className="w-8 h-8 rounded border border-white/20 cursor-pointer hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => copyColor(color)}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {logo.sizes && (
                        <div>
                          <p className="text-slate-500 mb-1">Sizes</p>
                          <p className="text-white font-medium">{logo.sizes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="mt-6">
          <div className="space-y-6">
            {Object.entries(COLOR_PALETTE).map(([category, colors]) => (
              <Card key={category} className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white capitalize">{category} Palette</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {colors.map((color) => (
                      <div
                        key={color.hex}
                        className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                      >
                        <div
                          className="w-16 h-16 rounded-lg border border-white/20 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                          style={{ backgroundColor: color.hex }}
                          onClick={() => copyColor(color.hex)}
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium mb-1">{color.name}</p>
                          <div className="flex gap-2 mb-2">
                            <code className="text-xs bg-black/30 px-2 py-1 rounded text-cyan-400">{color.hex}</code>
                            <code className="text-xs bg-black/30 px-2 py-1 rounded text-slate-400">RGB {color.rgb}</code>
                          </div>
                          <p className="text-xs text-slate-500">{color.usage}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyColor(color.hex)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="mt-6">
          <div className="space-y-6">
            {Object.entries(TYPOGRAPHY).map(([type, specs]) => (
              <Card key={type} className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white capitalize">{type} Typography</CardTitle>
                  <CardDescription>
                    {specs.family} • Weights: {specs.weights.join(", ")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 rounded-lg">
                      <p
                        className="text-white mb-2"
                        style={{
                          fontFamily: specs.family === "Inter" ? "Inter, sans-serif" : specs.family === "JetBrains Mono" ? "JetBrains Mono, monospace" : "inherit",
                          fontSize: type === "display" ? "48px" : type === "body" ? "18px" : "16px",
                          fontWeight: specs.weights[0],
                          letterSpacing: specs.tracking
                        }}
                      >
                        The quick brown fox jumps over the lazy dog
                      </p>
                      <p className="text-slate-400 text-sm">0123456789 • !@#$%^&*()</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 mb-1">Usage</p>
                        <p className="text-white">{specs.usage}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Sizes</p>
                        <p className="text-white">{specs.sizes}</p>
                      </div>
                      {specs.lineHeight && (
                        <div>
                          <p className="text-slate-500 mb-1">Line Height</p>
                          <p className="text-white">{specs.lineHeight}</p>
                        </div>
                      )}
                      {specs.tracking && (
                        <div>
                          <p className="text-slate-500 mb-1">Letter Spacing</p>
                          <p className="text-white">{specs.tracking}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Guidelines Tab */}
        <TabsContent value="guidelines" className="mt-6">
          <div className="grid gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Logo Usage Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div>
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Do's
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-6">
                    <li>Maintain minimum clear space (equal to logo height)</li>
                    <li>Use approved color variations only</li>
                    <li>Scale proportionally, never distort</li>
                    <li>Use on contrasting backgrounds for legibility</li>
                    <li>Foundation for public, Vanguard for exclusive contexts</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-red-400" />
                    Don'ts
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-6">
                    <li>Never rotate or skew the logo</li>
                    <li>Don't apply drop shadows or effects</li>
                    <li>Never outline or add borders</li>
                    <li>Don't use on busy backgrounds</li>
                    <li>Never recreate or modify logo elements</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Brand Architecture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <h4 className="text-cyan-400 font-semibold mb-2">Foundation Layer</h4>
                  <p>Institutional identity for public-facing communications, enterprise clients, and professional contexts. Conveys trust, reliability, and technological excellence.</p>
                </div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <h4 className="text-purple-400 font-semibold mb-2">Vanguard Layer</h4>
                  <p>Premium exclusive identity for inner circle, manifesto, and high-value partnerships. Mystical "Dune + Versailles Neural" aesthetic for strategic elites.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Downloads Tab */}
        <TabsContent value="downloads" className="mt-6">
          <div className="space-y-6">
            {/* Logo Downloads */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Image className="w-5 h-5 text-cyan-400" />
                  Logo Assets (5 Variações)
                </CardTitle>
                <CardDescription>
                  URLs públicas diretas - compartilháveis sem login
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(LOGOS).map(([key, logo]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-[#00D4FF]/30 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <img 
                          src={logo.url} 
                          alt={logo.name}
                          className="w-12 h-12 object-contain bg-slate-900 rounded border border-white/10"
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium flex items-center gap-2">
                            {logo.name}
                            {logo.premium && (
                              <Badge className="bg-purple-500/20 text-purple-400 text-xs">Premium</Badge>
                            )}
                          </p>
                          <p className="text-xs text-slate-500">{logo.format}</p>
                          {logo.warning && (
                            <p className="text-xs text-red-400 mt-1">{logo.warning}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(logo.url);
                            toast.success('URL copiada!');
                          }}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          URL
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => window.open(logo.url, '_blank')}
                          className="bg-cyan-600 hover:bg-cyan-700"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Resources */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Recursos Adicionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(RESOURCES).map(([key, resource]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">{resource.name}</p>
                        <p className="text-sm text-slate-400 mb-1">{resource.description}</p>
                        <div className="flex gap-2">
                          <Badge className="bg-white/10 text-slate-400 text-xs">
                            {resource.type}
                          </Badge>
                          {resource.size && (
                            <Badge className="bg-white/10 text-slate-400 text-xs">
                              {resource.size}
                            </Badge>
                          )}
                          {resource.duration && (
                            <Badge className="bg-white/10 text-slate-400 text-xs">
                              {resource.duration}
                            </Badge>
                          )}
                          {resource.format && (
                            <Badge className="bg-white/10 text-slate-400 text-xs">
                              {resource.format}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(resource.url);
                            toast.success('URL copiada!');
                          }}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          URL
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => window.open(resource.url, '_blank')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Complete Package */}
            <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Layers className="w-8 h-8 text-purple-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-white font-bold text-lg mb-2">Complete Brand Package</p>
                    <p className="text-sm text-slate-300 mb-4">
                      5 logos + Brand Manual (50+ páginas) + Logo Kit Original + Vídeo Animado
                    </p>
                    <p className="text-xs text-slate-400 mb-4">
                      13 arquivos públicos • Compartilháveis sem login • Persistentes
                    </p>
                    <Button 
                      onClick={() => {
                        const urls = [
                          ...Object.values(LOGOS).map(l => l.url),
                          ...Object.values(RESOURCES).map(r => r.url)
                        ];
                        const text = urls.join('\n');
                        navigator.clipboard.writeText(text);
                        toast.success('Todas as URLs copiadas!');
                      }}
                      className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Todas as URLs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}