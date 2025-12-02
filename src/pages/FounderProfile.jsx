import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Linkedin, Building2, Brain, Shield, Target, Globe } from "lucide-react";

export default function FounderProfile() {
  return (
    <div className="min-h-screen" style={{ 
      background: "radial-gradient(circle at center, #050814 0%, #111936 52%, #1a2744 100%)" 
    }}>
      <div className="max-w-5xl mx-auto px-5 py-8">
        {/* Back Button */}
        <Link to={createPageUrl("Landing")}>
          <Button variant="ghost" className="text-slate-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        {/* Hero Section */}
        <header className="grid md:grid-cols-[2.2fr_1.3fr] gap-8 items-center mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#35b4ff]/40 text-slate-400 text-xs tracking-wider uppercase"
              style={{ background: "radial-gradient(circle at top left, rgba(53, 180, 255, 0.16), transparent 55%)" }}>
              <span className="w-2 h-2 rounded-full bg-[#f4c15b]" style={{ boxShadow: "0 0 12px rgba(244, 193, 91, 0.8)" }} />
              <span>Perfil Executivo · CAIO.AI</span>
            </div>
            
            <h1 className="mt-5 text-4xl md:text-5xl font-bold text-white tracking-wide uppercase">
              Couto <span className="text-[#f4c15b] font-medium">| Founder & Chief Systems Architect</span>
            </h1>
            
            <p className="mt-4 text-slate-400 text-base max-w-xl">
              Arquiteto de sistemas institucionais que integra defesa, políticas públicas,
              finanças multilaterais e IA para ajudar organizações a pensar e operar como
              "cérebros institucionais": mais inteligentes, adaptativas e responsáveis.
            </p>
            
            <div className="mt-5 flex flex-wrap gap-2">
              {["Estratégia & Governança", "Políticas Públicas & Desenvolvimento", "IA & Arquitetura de Sistemas"].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full text-sm text-slate-400 border border-slate-600/50" 
                  style={{ background: "rgba(17, 24, 48, 0.9)" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Hero Card */}
          <aside className="rounded-3xl p-5 border border-[#70a2ff]/30 relative overflow-hidden"
            style={{ 
              background: "radial-gradient(circle at top, #17223f 0%, #070b18 55%)",
              boxShadow: "0 22px 60px rgba(2, 6, 23, 0.9)"
            }}>
            <div className="absolute inset-0 -m-[40%] pointer-events-none opacity-90"
              style={{
                background: "radial-gradient(circle at 10% 20%, rgba(53, 180, 255, 0.18), transparent 60%), radial-gradient(circle at 80% 80%, rgba(244, 193, 91, 0.16), transparent 60%)"
              }} />
            <div className="relative z-10">
              <p className="text-sm text-white mb-3">
                <span className="text-[#35b4ff] text-lg mr-1">"</span>
                Meu trabalho é desenhar sistemas que reduzam ruído, ampliem inteligência
                institucional e alinhem decisão de curto prazo com responsabilidade
                intergeracional.
              </p>
              <div className="text-sm text-slate-400">
                <strong className="text-white">Atuação atual:</strong> Founder & Chief Systems Architect do CAIO.AI,
                apoiando boards, C-level e fundadores na navegação de transformações complexas.
              </div>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, #35b4ff, #0b1930 55%), radial-gradient(circle at 70% 70%, #f4c15b, transparent 65%)",
                    boxShadow: "0 0 18px rgba(53, 180, 255, 0.4)"
                  }} />
                <div>
                  <span className="text-xs text-slate-500 tracking-widest uppercase">CAIO · AI</span>
                  <p className="text-xs text-slate-400">Institutional Brain & Strategic Systems Architecture</p>
                </div>
              </div>
            </div>
          </aside>
        </header>

        {/* Sections */}
        <Section title="Visão Geral" tag="Síntese">
          <p>
            Couto construiu uma trajetória que cruza defesa, governo federal, finanças
            multilaterais, governança ambiental e inovação em IA. Ao longo de duas décadas,
            atuou em ambientes onde decisões têm impacto macro: políticas de Estado,
            estratégias de desenvolvimento e desenho de instituições multilaterais.
          </p>
          <p>
            Hoje, como fundador e Chief Systems Architect do CAIO.AI, seu foco é apoiar
            organizações que enfrentam dilemas de complexidade crescente: redesenho de
            estratégia, reestruturações, integração de IA em decisões críticas e revisão
            de modelos de governança.
          </p>
        </Section>

        <Section title="Experiência Selecionada" tag="Trajetória">
          <ul className="space-y-2">
            {[
              "Atuação em posições estratégicas no Governo Federal brasileiro, com foco em economia, meio ambiente e planejamento de longo prazo.",
              "Liderança em governança, risco e estratégia no New Development Bank (BRICS), apoiando diretamente a presidência em temas sensíveis.",
              "Histórico militar como oficial e comandante, consolidando disciplina, gestão de crise e tomada de decisão sob pressão.",
              "Atuação em iniciativas de adaptação climática, desenvolvimento sustentável e cooperação internacional."
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-white">
                <span className="text-[#35b4ff] mt-1">•</span>
                <span dangerouslySetInnerHTML={{ __html: item.replace("New Development Bank (BRICS)", "<strong>New Development Bank (BRICS)</strong>") }} />
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Frameworks & Pesquisa Aplicada" tag="CAIO.AI · TSI">
          <p>
            Couto é criador do <strong className="text-white">TSI – Transformador Sistêmico Integrador</strong>, um
            metamodelo de transformação organizacional que combina teoria de sistemas,
            inteligência estratégica e desenho institucional. A partir dele, estruturou o
            ecossistema <strong className="text-white">CAIO.AI</strong>, que trata organizações como cérebros
            institucionais capazes de aprender, decidir e se adaptar com mais consciência.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {["Arquitetura de Sistemas", "Inteligência Estratégica", "Modelos Mentais", "IA aplicada à decisão"].map((pill) => (
              <span key={pill} className="px-3 py-1 rounded-full text-xs text-slate-400 border border-[#5287d7]/40"
                style={{ background: "rgba(13, 23, 45, 0.9)" }}>
                {pill}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Áreas de Atuação" tag="Foco">
          <ul className="space-y-2">
            {[
              "Estratégia e arquitetura organizacional em contextos de alta complexidade.",
              "Governança, risco e desenho institucional para governos, bancos e empresas.",
              "Integração de IA em processos críticos de decisão, com ênfase em responsabilidade.",
              "Políticas públicas, desenvolvimento sustentável e transições de longo prazo.",
              "Facilitação de processos de transformação para boards, C-level e fundadores."
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-white">
                <span className="text-[#35b4ff] mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Atuação Atual" tag="CAIO.AI">
          <p>
            No CAIO.AI, Couto atua como parceiro estratégico de líderes que precisam tomar
            decisões estruturais sob incerteza: redesenhar modelos de negócio, incorporar IA
            em estruturas críticas, alinhar governança a novas agendas e reduzir a distância
            entre visão e execução.
          </p>
          <p>
            Seu trabalho combina diagnósticos estruturais, desenho de frameworks, apoio a
            processos decisórios e desenvolvimento de capacidades internas, sempre com foco
            em impacto sistêmico e coerência de longo prazo.
          </p>
        </Section>

        {/* Footer */}
        <footer className="mt-8 flex flex-wrap justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full"
              style={{
                background: "radial-gradient(circle at 25% 25%, #35b4ff, #0b1930 55%), radial-gradient(circle at 75% 75%, #f4c15b, transparent 65%)"
              }} />
            <span>CAIO · AI — Institutional Brain</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Contato institucional:</span>
            <a href="mailto:contato@caio.ai" className="text-[#35b4ff] hover:underline">
              contato@caio.ai
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Section({ title, tag, children }) {
  return (
    <section className="mt-5 p-5 rounded-2xl border border-[#4f77c9]/40"
      style={{ background: "linear-gradient(135deg, #0a1020, #050814)" }}>
      <div className="flex justify-between items-baseline gap-2 mb-3">
        <h2 className="text-sm tracking-widest uppercase text-[#35b4ff]">{title}</h2>
        <span className="text-xs text-slate-500 uppercase tracking-wider">{tag}</span>
      </div>
      <div className="space-y-3 text-sm text-slate-300">
        {children}
      </div>
    </section>
  );
}