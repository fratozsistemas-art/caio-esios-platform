import { useEffect } from 'react';

/**
 * SEO Optimizer Component
 * Adiciona meta tags otimizadas, favicon e melhorias de acessibilidade
 */
export default function SEOOptimizer({ 
  title, 
  description, 
  keywords, 
  canonicalPath,
  ogImage,
  schema,
  lang = 'pt-BR'
}) {
  useEffect(() => {
    // Language
    document.documentElement.lang = lang;

    // Title
    if (title) {
      document.title = title;
    }

    // Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription && description) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    if (metaDescription && description) {
      metaDescription.content = description;
    }

    // Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords && keywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    if (metaKeywords && keywords) {
      metaKeywords.content = keywords;
    }

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical && canonicalPath) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    if (canonical && canonicalPath) {
      canonical.href = window.location.origin + canonicalPath;
    }

    // Favicon
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/4e0fc9a8e_caio_ai_logo_refined.png';

    // Apple Touch Icon
    let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleTouchIcon);
    }
    appleTouchIcon.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/4e0fc9a8e_caio_ai_logo_refined.png';

    // Open Graph
    const defaultOgImage = ogImage || 'https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png';
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:url': window.location.href,
      'og:type': 'website',
      'og:image': defaultOgImage,
      'og:locale': lang === 'pt-BR' ? 'pt_BR' : 'en_US'
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      if (!content) return;
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    // Twitter Cards
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': defaultOgImage
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      if (!content) return;
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    // Schema.org JSON-LD
    if (schema) {
      const existingSchema = document.querySelector('script[type="application/ld+json"]');
      if (existingSchema) {
        existingSchema.remove();
      }
      
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.text = JSON.stringify(schema);
      document.head.appendChild(schemaScript);

      return () => {
        if (schemaScript.parentNode) {
          schemaScript.parentNode.removeChild(schemaScript);
        }
      };
    }
  }, [title, description, keywords, canonicalPath, ogImage, schema, lang]);

  return null;
}