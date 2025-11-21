import { useEffect } from 'react';

/**
 * Accessibility Enhancer
 * Adiciona atributos de acessibilidade e melhora contraste
 */
export default function AccessibilityEnhancer() {
  useEffect(() => {
    // Adiciona role="main" ao conteúdo principal se não existir
    const main = document.querySelector('main');
    if (main && !main.getAttribute('role')) {
      main.setAttribute('role', 'main');
    }

    // Adiciona role="navigation" aos navs se não existir
    const navs = document.querySelectorAll('nav');
    navs.forEach(nav => {
      if (!nav.getAttribute('role')) {
        nav.setAttribute('role', 'navigation');
      }
    });

    // Adiciona aria-label a botões sem texto visível
    const buttons = document.querySelectorAll('button:not([aria-label])');
    buttons.forEach(button => {
      if (!button.textContent.trim() && button.querySelector('svg')) {
        const iconClass = button.querySelector('svg').getAttribute('class') || '';
        if (!button.getAttribute('aria-label')) {
          button.setAttribute('aria-label', 'Ação do botão');
        }
      }
    });

    // Adiciona alt text a imagens sem ele
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach(img => {
      const src = img.getAttribute('src') || '';
      if (src.includes('logo') || src.includes('CAIO')) {
        img.setAttribute('alt', 'CAIO·AI Logo');
      } else {
        img.setAttribute('alt', 'Imagem ilustrativa');
      }
    });

    // Skip to main content link (acessibilidade)
    if (!document.querySelector('#skip-to-main')) {
      const skipLink = document.createElement('a');
      skipLink.id = 'skip-to-main';
      skipLink.href = '#main-content';
      skipLink.textContent = 'Pular para conteúdo principal';
      skipLink.style.cssText = `
        position: absolute;
        left: -9999px;
        z-index: 999;
        padding: 1em;
        background: #000;
        color: white;
        text-decoration: none;
        border-radius: 4px;
      `;
      skipLink.addEventListener('focus', () => {
        skipLink.style.left = '10px';
        skipLink.style.top = '10px';
      });
      skipLink.addEventListener('blur', () => {
        skipLink.style.left = '-9999px';
      });
      document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Marca conteúdo principal
    const mainContent = document.querySelector('.container, main, [role="main"]');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }
  }, []);

  return null;
}