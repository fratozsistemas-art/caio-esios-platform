# 🌍 Guia de Implementação i18n - Base44 App

## Objetivo
Consolidar páginas duplicadas (EN/PT-BR) em uma única implementação com suporte a múltiplos idiomas.

---

## 📦 Instalação

```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

---

## 🏗️ Estrutura de Arquivos

```
src/
├── i18n/
│   ├── config.js                 # Configuração principal
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json       # Textos comuns (header, footer, etc)
│   │   │   ├── landing.json      # Landing page
│   │   │   ├── pricing.json      # Pricing page
│   │   │   ├── help.json         # Help center
│   │   │   └── knowledge.json    # Knowledge base
│   │   └── pt-BR/
│   │       ├── common.json
│   │       ├── landing.json
│   │       ├── pricing.json
│   │       ├── help.json
│   │       └── knowledge.json
│   └── index.js
```

---

## ⚙️ Configuração

### 1. Criar `src/i18n/config.js`

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import commonEN from './locales/en/common.json';
import landingEN from './locales/en/landing.json';
import pricingEN from './locales/en/pricing.json';

import commonPT from './locales/pt-BR/common.json';
import landingPT from './locales/pt-BR/landing.json';
import pricingPT from './locales/pt-BR/pricing.json';

const resources = {
  en: {
    common: commonEN,
    landing: landingEN,
    pricing: pricingEN,
  },
  'pt-BR': {
    common: commonPT,
    landing: landingPT,
    pricing: pricingPT,
  },
};

i18n
  .use(LanguageDetector) // Detecta idioma do browser
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React já faz escape
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

### 2. Criar `src/i18n/index.js`

```javascript
import './config';
export { default as i18n } from './config';
```

---

## 📝 Arquivos de Tradução

### `src/i18n/locales/en/landing.json`

```json
{
  "hero": {
    "title": "Strategic Intelligence Platform",
    "subtitle": "AI-Powered Executive Decision Making",
    "cta": "Get Started",
    "watchDemo": "Watch Demo"
  },
  "features": {
    "title": "Advanced Capabilities",
    "tsi": {
      "title": "TSI Methodology",
      "description": "Tactical Strategic Intelligence for complex analysis"
    },
    "agents": {
      "title": "AI Agents",
      "description": "Autonomous agents for data orchestration"
    },
    "knowledge": {
      "title": "Knowledge Graph",
      "description": "Connected intelligence for better insights"
    }
  },
  "cta": {
    "title": "Ready to transform your strategy?",
    "button": "Start Free Trial"
  }
}
```

### `src/i18n/locales/pt-BR/landing.json`

```json
{
  "hero": {
    "title": "Plataforma de Inteligência Estratégica",
    "subtitle": "Tomada de Decisão Executiva com IA",
    "cta": "Começar Agora",
    "watchDemo": "Ver Demo"
  },
  "features": {
    "title": "Capacidades Avançadas",
    "tsi": {
      "title": "Metodologia TSI",
      "description": "Inteligência Estratégica Tática para análises complexas"
    },
    "agents": {
      "title": "Agentes de IA",
      "description": "Agentes autônomos para orquestração de dados"
    },
    "knowledge": {
      "title": "Grafo de Conhecimento",
      "description": "Inteligência conectada para melhores insights"
    }
  },
  "cta": {
    "title": "Pronto para transformar sua estratégia?",
    "button": "Iniciar Teste Gratuito"
  }
}
```

---

## 🔧 Uso nos Componentes

### Before (Duplicated):

```jsx
// Landing.jsx (EN)
export default function Landing() {
  return (
    <div>
      <h1>Strategic Intelligence Platform</h1>
      <p>AI-Powered Executive Decision Making</p>
    </div>
  );
}

// LandingPT.jsx (PT)
export default function LandingPT() {
  return (
    <div>
      <h1>Plataforma de Inteligência Estratégica</h1>
      <p>Tomada de Decisão Executiva com IA</p>
    </div>
  );
}
```

### After (Consolidated with i18n):

```jsx
// Landing.jsx (Both languages)
import { useTranslation } from 'react-i18next';

export default function Landing() {
  const { t } = useTranslation('landing');
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.subtitle')}</p>
      <Button>{t('hero.cta')}</Button>
    </div>
  );
}
```

---

## 🎯 Seletor de Idioma

### `src/components/LanguageSwitcher.jsx`

```jsx
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const currentLanguage = languages.find(
    (lang) => lang.code === i18n.language
  ) || languages[0];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Globe className="mr-2 h-4 w-4" />
          {currentLanguage.flag} {currentLanguage.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={i18n.language === lang.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 🚀 Integração no App

### `src/main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n' // ← Adicionar

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### `src/Layout.jsx`

```jsx
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Layout({ children }) {
  return (
    <div>
      <header>
        {/* ... outros componentes ... */}
        <LanguageSwitcher />
      </header>
      <main>{children}</main>
    </div>
  );
}
```

---

## 📋 Plano de Migração

### Fase 1: Setup (1 dia)
- [x] Instalar dependências
- [x] Criar estrutura de arquivos
- [x] Configurar i18n
- [x] Criar LanguageSwitcher

### Fase 2: Landing Pages (2 dias)
- [ ] Extrair textos de Landing.jsx
- [ ] Criar landing.json (en + pt-BR)
- [ ] Refatorar Landing.jsx para usar i18n
- [ ] Testar ambos idiomas
- [ ] Deletar LandingPT.jsx
- [ ] Atualizar routes (remover /LandingPT)

### Fase 3: Pricing Pages (1 dia)
- [ ] Extrair textos de Pricing.jsx
- [ ] Criar pricing.json (en + pt-BR)
- [ ] Refatorar Pricing.jsx
- [ ] Deletar Precos.jsx
- [ ] Atualizar routes

### Fase 4: Help/Knowledge Pages (2 dias)
- [ ] Migrar HelpCenter + CentralAjuda
- [ ] Migrar KnowledgeBase + BaseConhecimento
- [ ] Atualizar routes

### Fase 5: Textos Comuns (1 dia)
- [ ] Extrair header/footer/navigation
- [ ] Criar common.json
- [ ] Refatorar Layout.jsx

---

## 🧪 Testes

### Checklist de Testes:
- [ ] Idioma detectado automaticamente do browser
- [ ] Idioma persiste após reload (localStorage)
- [ ] Troca de idioma funciona sem reload
- [ ] Todas traduções carregam corretamente
- [ ] Sem textos em branco (missing keys)
- [ ] SEO: `<html lang="en">` atualiza dinamicamente
- [ ] URLs não quebram após mudança de idioma

### Comando de Teste:
```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview
npm run preview
```

---

## 🎨 Variantes (LandingLight)

Para `LandingLight.jsx`, converter em variante ao invés de página separada:

```jsx
// Landing.jsx
export default function Landing({ variant = 'default' }) {
  const { t } = useTranslation('landing');
  
  const isLight = variant === 'light';
  
  return (
    <div className={isLight ? 'bg-white' : 'bg-gradient-to-b from-slate-900'}>
      {/* Conteúdo com styling condicional */}
    </div>
  );
}

// Route config
<Route path="/landing" element={<Landing />} />
<Route path="/landing-light" element={<Landing variant="light" />} />
```

---

## 📊 Métricas de Sucesso

### Antes:
- 4 arquivos de landing (Landing, LandingPT, LandingLight, Home)
- 2 arquivos de pricing (Pricing, Precos)
- 2 arquivos de help (HelpCenter, CentralAjuda)
- 2 arquivos de knowledge (KnowledgeBase, BaseConhecimento)
- **Total: 10 arquivos duplicados**

### Depois:
- 1 arquivo Landing (com variant)
- 1 arquivo Pricing
- 1 arquivo HelpCenter
- 1 arquivo KnowledgeBase
- **Total: 4 arquivos + traduções JSON**

### Ganhos:
- ✅ -6 arquivos JSX (~2.500 linhas)
- ✅ Traduções centralizadas em JSON
- ✅ Manutenção simplificada
- ✅ Fácil adicionar novos idiomas

---

## 🔗 Recursos Úteis

- [react-i18next Docs](https://react.i18next.com/)
- [i18next Docs](https://www.i18next.com/)
- [Best Practices](https://react.i18next.com/latest/using-with-hooks)

---

## ⚠️ Cuidados

1. **SEO:** Atualizar `<html lang>` dinamicamente
2. **URLs:** Decidir se usar rotas com prefixo (`/en/`, `/pt-BR/`)
3. **Plurais:** i18next suporta pluralização automática
4. **Datas/Números:** Usar `Intl` API para formatação
5. **RTL:** Preparar para idiomas RTL se necessário

---

**Gerado em:** 2025-12-27  
**Versão:** 1.0  
**Status:** Ready for implementation
