"use client";

import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FAQItem = {
  question: string;
  answer: string;
};

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  faqsLeft: FAQItem[];
  faqsRight: FAQItem[];
  className?: string;
}

export function FAQSection({
  title = "Product & Account Help",
  subtitle = "",
  description = "Get instant answers to the most common questions about your account, product setup, and updates.",
  buttonLabel = "Browse All FAQs →",
  onButtonClick,
  faqsLeft,
  faqsRight,
  className,
}: FAQSectionProps) {
  const allFaqs = [...faqsLeft, ...faqsRight];

  return (
    <section className={cn("w-full max-w-6xl mx-auto py-16 px-4", className)}>
      <style>{`
        .faq-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto 1fr;
          gap: 48px;
        }
        .faq-header { grid-column: 1; grid-row: 1; }
        .faq-img-col { grid-column: 2; grid-row: 1 / 3; position: sticky; top: 80px; }
        .faq-accordion { grid-column: 1; grid-row: 2; }
        @media (max-width: 767px) {
          .faq-layout { grid-template-columns: 1fr; grid-template-rows: unset; gap: 24px; }
          .faq-header { grid-column: 1; grid-row: 1; }
          .faq-img-col { grid-column: 1; grid-row: 2; position: static; }
          .faq-accordion { grid-column: 1; grid-row: 3; }
        }
      `}</style>

      <div className="faq-layout">
        {/* Header */}
        <div className="faq-header text-left" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {subtitle && <p className="text-sm text-muted-foreground font-medium tracking-wide">{subtitle}</p>}
          <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 500, lineHeight: 1.15 }}>
            <span style={{ color: '#fff' }}>{title}</span>
          </h2>
          <p style={{ fontSize: 15, color: '#898989', lineHeight: 1.65 }}>
            {description}
          </p>
          <span onClick={onButtonClick} style={{ color: '#00bc7d', fontSize: 15, cursor: 'pointer', userSelect: 'none' }}>
            {buttonLabel}
          </span>
        </div>

        {/* Image */}
        <div className="faq-img-col">
          <div style={{
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            aspectRatio: '1 / 1',
          }}>
            <Image
              src="/faq-img.jpg"
              alt="FAQ"
              width={600}
              height={600}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>

        {/* Accordion */}
        <div className="faq-accordion text-left">
          <Accordion type="single" collapsible className="space-y-4 w-full">
            {allFaqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  <div className="min-h-[40px] transition-all duration-200 ease-in-out">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
