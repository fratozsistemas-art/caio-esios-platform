import { useEffect } from 'react';

/**
 * SEO Head Component - Reusable SEO meta tags for all pages
 * @param {Object} props
 * @param {string} props.title - Page title (will be appended with " | CAIO·AI")
 * @param {string} props.description - Meta description (max 158 characters recommended)
 * @param {string} props.keywords - Comma-separated keywords
 * @param {string} props.canonical - Canonical URL (optional, defaults to current URL)
 * @param {string} props.ogImage - Open Graph image URL
 * @param {string} props.ogType - Open Graph type (default: "website")
 * @param {Object} props.schema - Schema.org JSON-LD data (optional)
 */
export default function SEOHead({
  title,
  description,
  keywords = '',
  canonical = '',
  ogImage = 'https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png',
  ogType = 'website',
  schema = null
}) {
  useEffect(() => {
    // Set page language
    document.documentElement.lang = 'en';

    // Set document title
    document.title = title ? `${title} | CAIO·AI` : 'CAIO·AI - Executive Strategic Intelligence Platform';

    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.setAttribute('content', description);
    } else if (description) {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    // Keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.content = keywords;
    }

    // Canonical URL
    const canonicalUrl = canonical || window.location.href;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    // Open Graph tags
    const ogTags = {
      'og:title': title || 'CAIO·AI - Executive Strategic Intelligence Platform',
      'og:description': description || 'Transform executive decision-making with 11-module AI platform.',
      'og:type': ogType,
      'og:url': canonicalUrl,
      'og:image': ogImage,
      'og:site_name': 'CAIO·AI Platform',
      'og:locale': 'en_US'
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    // Twitter Card tags
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title || 'CAIO·AI - Executive Strategic Intelligence Platform',
      'twitter:description': description || 'Transform executive decision-making with 11-module AI platform.',
      'twitter:image': ogImage,
      'twitter:site': '@CAIOAI',
      'twitter:creator': '@CAIOAI'
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
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
    }

    // Cleanup function
    return () => {
      // Optional: Clean up added elements when component unmounts
    };
  }, [title, description, keywords, canonical, ogImage, ogType, schema]);

  return null; // This component doesn't render anything
}