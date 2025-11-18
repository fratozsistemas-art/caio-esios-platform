import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { 
  LayoutDashboard, MessageSquare, Zap, FileText, Briefcase,
  Brain, Network, Target, LogOut, Menu, X, Sparkles, Code, BookOpen, Users, Database, Plug, Building2, Upload, BarChart3, Bell, Activity, HeartPulse, GitMerge, Shield, Search, Layers, TrendingUp, Ticket, Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlobalSearch from './components/GlobalSearch';

const navSections = [
  {
    title: "Core",
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: 'Dashboard' },
      { name: 'Chat with CAIO', icon: MessageSquare, path: 'Chat', badge: 'AI' },
      { name: 'Quick Actions', icon: Zap, path: 'QuickActions' }
    ]
  },
  {
    title: "Intelligence",
    items: [
      { name: 'Behavioral Intelligence', icon: Brain, path: 'BehavioralIntelligence', badge: 'NEW' },
      { name: 'Knowledge Management', icon: BookOpen, path: 'KnowledgeManagement' },
      { name: 'Knowledge Graph', icon: Network, path: 'KnowledgeGraph' },
      { name: 'Network Map', icon: Network, path: 'NetworkMap', badge: 'AI' },
      { name: 'Agent Memory', icon: Brain, path: 'AgentMemory', badge: 'NEW' },
      { name: 'CVM Graph', icon: Database, path: 'CVMGraph', badge: 'Neo4j' }
    ]
  },
  {
    title: "Companies",
    items: [
      { name: 'Company Discovery', icon: Building2, path: 'CompanyDiscovery', badge: 'ESIOS' },
      { name: 'CVM Ingestion', icon: Database, path: 'CVMIngestion', badge: 'CVM' },
      { name: 'Batch Ingestion', icon: Upload, path: 'BatchIngestion', badge: 'BULK' }
    ]
  },
  {
    title: "Analysis",
    items: [
      { name: 'TSI Projects', icon: Brain, path: 'TSIProject', badge: 'v6.0' },
      { name: 'File Analyzer', icon: FileText, path: 'FileAnalyzer' },
      { name: 'Tech Intelligence', icon: Code, path: 'TechIntelligence' }
    ]
  },
  {
    title: "AI Workflows",
    items: [
      { name: 'Agent Orchestration', icon: GitMerge, path: 'AgentOrchestration', badge: 'NEW' },
      { name: 'Workflow Templates', icon: Layers, path: 'WorkflowTemplates', badge: 'NEW' },
      { name: 'Agent Performance', icon: TrendingUp, path: 'AgentPerformance', badge: 'NEW' },
      { name: 'Agent Training', icon: Cpu, path: 'AgentTraining', badge: 'NEW' }
    ]
  },
  {
    title: "Governance",
    items: [
      { name: 'Hermes Dashboard', icon: Shield, path: 'HermesDashboard', badge: 'NEW' },
      { name: 'Hermes Trust-Broker', icon: Shield, path: 'HermesTrustBroker' },
      { name: 'Auto-Trigger Rules', icon: Zap, path: 'HermesTriggerManagement' },
      { name: 'Support Tickets', icon: Ticket, path: 'SupportTickets', badge: 'NEW' }
    ]
  },
  {
    title: "Projects",
    items: [
      { name: 'Workspaces', icon: Briefcase, path: 'Workspaces' },
      { name: 'Strategies', icon: Target, path: 'Strategies' }
    ]
  },
  {
    title: "Monitoring",
    items: [
      { name: 'Analytics', icon: BarChart3, path: 'Analytics', badge: 'NEW' },
      { name: 'Notifications', icon: Bell, path: 'Notifications' },
      { name: 'System Health', icon: Activity, path: 'SystemHealth', badge: 'NEW' },
      { name: 'Integration Health', icon: HeartPulse, path: 'IntegrationHealth', badge: 'NEW' }
    ]
  },
  {
    title: "Settings",
    items: [
      { name: 'Integrations', icon: Plug, path: 'Integrations', badge: 'NEW' },
      { name: 'User Management', icon: Users, path: 'UserManagement', adminOnly: true }
    ]
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(async u => {
        setUser(u);
        
        if (u.role === 'admin') {
          setIsAdmin(true);
        } else {
          const userRoles = await base44.entities.UserRole.filter({
            user_email: u.email,
            is_active: true
          });
          
          if (userRoles && userRoles.length > 0) {
            setIsAdmin(userRoles[0].role_name === 'admin');
          }
        }
      })
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => base44.auth.logout();

  if (currentPageName === 'Landing') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-yellow-950">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/4e0fc9a8e_caio_ai_logo_refined.png" 
              alt="CAIO·AI" 
              className="w-6 h-6 object-contain"
            />
            <span className="text-white font-bold text-lg">CAIO·AI</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(true)}
              className="text-white hover:bg-white/10"
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-white/10"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      <aside className={`fixed top-0 left-0 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 z-40 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/4e0fc9a8e_caio_ai_logo_refined.png" 
              alt="CAIO·AI" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-white font-bold text-lg">CAIO·AI</h1>
              <p className="text-slate-400 text-xs">Strategic Intelligence</p>
            </div>
          </div>
          <Button
            onClick={() => setShowSearch(true)}
            variant="outline"
            className="w-full mt-4 bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white justify-start"
          >
            <Search className="w-4 h-4 mr-2" />
            Buscar... <kbd className="ml-auto text-xs">⌘K</kbd>
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-6">
          {navSections.map((section, idx) => {
            const items = section.items.filter(item => {
              if (item.adminOnly) {
                return isAdmin;
              }
              return true;
            });

            if (items.length === 0) return null;

            return (
              <div key={idx}>
                <div className="px-4 mb-2">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPageName === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={createPageUrl(item.path)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${isActive ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'}`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium flex-1 truncate">{item.name}</span>
                        {item.badge && (
                          <Badge className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {user && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-yellow-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.full_name}</p>
                <p className="text-slate-400 text-xs truncate">{user.email}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full bg-slate-800/80 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </aside>

      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <GlobalSearch open={showSearch} onClose={() => setShowSearch(false)} />
    </div>
  );
}