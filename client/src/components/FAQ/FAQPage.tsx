import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLocalize } from '~/hooks';

interface FAQQuestion {
  question: string;
  answer: string;
}

interface FAQSection {
  id: string;
  title: string;
  questions: FAQQuestion[];
}

interface FAQConfig {
  sections: FAQSection[];
}

export default function FAQPage() {
  const localize = useLocalize();
  const [faqData, setFaqData] = useState<FAQConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadFAQ = async () => {
      try {
        const response = await fetch('/static/faq-config.json');
        if (!response.ok) {
          throw new Error('Failed to load FAQ');
        }
        const data = await response.json();
        setFaqData(data);
      } catch (err) {
        console.error('Error loading FAQ:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadFAQ();
  }, []);

  const scrollToTop = () => {
    const topElement = document.getElementById('top');
    if (topElement) {
      topElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-text-primary" role="status" aria-live="polite">
          {localize('com_ui_faq_loading')}
        </div>
      </div>
    );
  }

  if (error || !faqData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-500" role="alert" aria-live="assertive">
          {localize('com_ui_faq_error')}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center overflow-y-auto bg-surface-primary">
      <div className="w-full max-w-4xl px-4 py-8 md:px-8 md:py-12">
        {/* Header */}
        <div id="top" className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary md:text-4xl">
            {localize('com_ui_faq_title')}
          </h1>
        </div>

        {/* Section Navigation Links */}
        <nav
          className="mb-8 rounded-lg bg-surface-secondary p-6 shadow-sm"
          aria-label={localize('com_ui_faq_section_nav')}
        >
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            {localize('com_ui_faq_jump_to_section')}
          </h2>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {faqData.sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(`section-${section.id}`)}
                  className="w-full rounded-md bg-surface-primary px-4 py-2 text-left text-text-primary transition-colors hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-ring-primary"
                  aria-label={`${localize('com_ui_faq_jump_to')} ${section.title}`}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqData.sections.map((section, sectionIndex) => (
            <section
              key={section.id}
              id={`section-${section.id}`}
              className="rounded-lg bg-surface-secondary p-6 shadow-sm"
              aria-labelledby={`section-heading-${section.id}`}
            >
              {/* Section Title */}
              <h2
                id={`section-heading-${section.id}`}
                className="mb-4 text-xl font-semibold text-text-primary md:text-2xl"
              >
                {section.title}
              </h2>

              {/* Accordion */}
              <Accordion.Root type="single" collapsible className="space-y-3">
                {section.questions.map((item, index) => (
                  <Accordion.Item
                    key={`${section.id}-${index}`}
                    value={`${section.id}-${index}`}
                    className="overflow-hidden rounded-md border border-border-light bg-surface-primary"
                  >
                    <Accordion.Header>
                      <Accordion.Trigger
                        className="group flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-ring-primary"
                        aria-expanded="false"
                      >
                        <span className="font-medium text-text-primary">{item.question}</span>
                        <ChevronDown
                          className="h-5 w-5 text-text-secondary transition-transform duration-200 group-data-[state=open]:rotate-180"
                          aria-hidden="true"
                        />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
                      <div className="px-4 pb-4 pt-2 text-text-secondary">
                        <ReactMarkdown
                          components={{
                            p: ({ node: _n, ...props }) => (
                              <p className="mb-4 last:mb-0" {...props} />
                            ),
                            ul: ({ node: _n, ...props }) => (
                              <ul className="mb-4 ml-4 list-disc space-y-2 last:mb-0" {...props} />
                            ),
                            ol: ({ node: _n, ...props }) => (
                              <ol className="mb-4 ml-4 list-decimal space-y-2 last:mb-0" {...props} />
                            ),
                            li: ({ node: _n, ...props }) => <li className="ml-2" {...props} />,
                          }}
                        >
                          {item.answer}
                        </ReactMarkdown>
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>

              {/* Back to Top Link */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={scrollToTop}
                  className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-ring-primary"
                  aria-label={localize('com_ui_faq_back_to_top')}
                >
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  <span>{localize('com_ui_faq_back_to_top')}</span>
                </button>
              </div>
            </section>
          ))}
        </div>

        {/* Final Back to Top Link */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 rounded-md bg-surface-secondary px-6 py-3 font-medium text-text-primary shadow-sm transition-colors hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-ring-primary"
            aria-label={localize('com_ui_faq_back_to_top')}
          >
            <ChevronUp className="h-5 w-5" aria-hidden="true" />
            <span>{localize('com_ui_faq_back_to_top')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
