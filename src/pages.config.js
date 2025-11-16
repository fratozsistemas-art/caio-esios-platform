import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Strategies from './pages/Strategies';
import Analyses from './pages/Analyses';
import QuickActions from './pages/QuickActions';
import FileAnalyzer from './pages/FileAnalyzer';
import Workspaces from './pages/Workspaces';
import TechIntelligence from './pages/TechIntelligence';
import StrategicIntelligence from './pages/StrategicIntelligence';
import KnowledgeBase from './pages/KnowledgeBase';
import WorkspaceDetail from './pages/WorkspaceDetail';
import PaymentSuccess from './pages/PaymentSuccess';
import KnowledgeGraph from './pages/KnowledgeGraph';
import QueryEngine from './pages/QueryEngine';
import TSIProject from './pages/TSIProject';
import KnowledgeManagement from './pages/KnowledgeManagement';
import UserManagement from './pages/UserManagement';
import BehavioralIntelligence from './pages/BehavioralIntelligence';
import CVMGraph from './pages/CVMGraph';
import Integrations from './pages/Integrations';
import CompanyDiscovery from './pages/CompanyDiscovery';
import CompanyProfile from './pages/CompanyProfile';
import BatchIngestion from './pages/BatchIngestion';
import TechnicalAudit from './pages/TechnicalAudit';
import Layout from './Layout.jsx';


export const PAGES = {
    "Landing": Landing,
    "Dashboard": Dashboard,
    "Chat": Chat,
    "Strategies": Strategies,
    "Analyses": Analyses,
    "QuickActions": QuickActions,
    "FileAnalyzer": FileAnalyzer,
    "Workspaces": Workspaces,
    "TechIntelligence": TechIntelligence,
    "StrategicIntelligence": StrategicIntelligence,
    "KnowledgeBase": KnowledgeBase,
    "WorkspaceDetail": WorkspaceDetail,
    "PaymentSuccess": PaymentSuccess,
    "KnowledgeGraph": KnowledgeGraph,
    "QueryEngine": QueryEngine,
    "TSIProject": TSIProject,
    "KnowledgeManagement": KnowledgeManagement,
    "UserManagement": UserManagement,
    "BehavioralIntelligence": BehavioralIntelligence,
    "CVMGraph": CVMGraph,
    "Integrations": Integrations,
    "CompanyDiscovery": CompanyDiscovery,
    "CompanyProfile": CompanyProfile,
    "BatchIngestion": BatchIngestion,
    "TechnicalAudit": TechnicalAudit,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: Layout,
};