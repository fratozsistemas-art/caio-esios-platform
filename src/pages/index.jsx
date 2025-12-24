import QuickActionCard from '../components/quickactions/QuickActionCard';
import { CheckCircle } from 'lucide-react';

const quickActions = [
  {
    title: "Strategic Intelligence Unit",
    category: "Strategy",
    theme: "Market Positioning",
    role: "Executive",
    estimated_time: "25 min",
    expected_outputs: [
      "Análise competitiva",
      "Mapeamento de mercado",
      "Plano de ação estratégico"
    ]
  },
  {
    title: "Security Posture Review",
    category: "Security",
    theme: "Threat Modeling",
    role: "Security",
    estimated_time: "20 min",
    expected_outputs: [
      "Inventário de riscos",
      "Checklist de compliance",
      "Plano de mitigação"
    ]
  },
  {
    title: "Observability Insights",
    category: "Operations",
    theme: "Reliability",
    role: "SRE",
    estimated_time: "15 min",
    expected_outputs: [
      "Health scorecard",
      "Ajustes de alertas",
      "Recomendações de automação"
    ]
  }
]

function Pages() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-6 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-slate-300">Welcome to CAIO·AI</p>
          <h1 className="text-3xl font-semibold text-white">Quick Actions Showcase</h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-emerald-300">
            <CheckCircle className="h-4 w-4" />
            <span>Quick actions ready to use.</span>
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {quickActions.map((action) => (
          <QuickActionCard key={action.title} action={action} />
        ))}
      </section>
    </div>
  )
}

export default Pages