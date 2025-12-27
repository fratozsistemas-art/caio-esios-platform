import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { tsiModules } from './tsiModules';
import { testimonials } from './testimonials';
import { detailedUseCases } from './useCases';

export function useLandingContent() {
  const { currentLanguage } = useLanguage();
  const isPT = currentLanguage === 'pt-BR';

  return {
    getModuleContent: (module) => ({
      description: isPT ? module.descriptionPT : module.description,
      tag: isPT ? module.tagPT : module.tag
    }),
    getTestimonialContent: (testimonial) => ({
      quote: isPT ? testimonial.quotePT : testimonial.quote,
      metric: isPT ? testimonial.metricPT : testimonial.metric
    }),
    getUseCaseContent: (useCase) => ({
      challenge: isPT ? useCase.challengePT : useCase.challenge,
      solution: isPT ? useCase.solutionPT : useCase.solution,
      results: isPT ? useCase.resultsPT : useCase.results,
      savings: isPT ? useCase.savingsPT : useCase.savings,
      timeframe: isPT ? useCase.timeframePT : useCase.timeframe
    })
  };
}