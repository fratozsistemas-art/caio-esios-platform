
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { 
  LayoutDashboard, MessageSquare, Zap, FileText, Briefcase,
  Brain, Network, Target, LogOut, Menu, X, Sparkles, Code, BookOpen, Users, Database, Plug
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
      { name: 'CVM Graph', icon: Database, path: 'CVMGraph', badge: 'Neo4j' }
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
    title: "Projects",
    items: [
      { name: 'Workspaces', icon: Briefcase, path: 'Workspaces' },
      { name: 'Strategies', icon: Target, path: 'Strategies' }
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

  const handleLogout = () => base44.auth.logout();

  if (currentPageName === 'Landing') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <span className="text-white font-bold text-lg">CAIO·AI</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      <aside className={`fixed top-0 left-0 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">CAIO·AI</h1>
              <p className="text-slate-400 text-xs">Strategic Intelligence</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
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
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'}`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium flex-1 truncate">{item.name}</span>
                        {item.badge && (
                          <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
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
              className="w-full border-white/10 text-slate-300 hover:bg-white/5"
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
    </div>
  );
}
