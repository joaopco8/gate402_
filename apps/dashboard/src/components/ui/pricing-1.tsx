import { CheckIcon } from "lucide-react";
import React from "react";

const Pricing1 = () => {
  const pricingPlans = [
    {
      title: "Free",
      popular: false,
      description: "For developers getting started.",
      price: "$0",
      priceLabel: "forever",
      cta: "Read the docs",
      ctaHref: "/docs",
      ctaStyle: "ghost",
      features: [
        "npm install gate402",
        "x402 middleware",
        "Solana devnet + mainnet",
        "Up to 3 endpoints",
        "Last 5 calls visible",
        "7-day chart",
        "Community support",
        "MIT licensed",
      ],
    },
    {
      title: "Pro",
      popular: true,
      description: "For developers monetizing at scale.",
      price: "$99",
      priceLabel: "monthly",
      cta: "Start Pro",
      ctaHref: "/checkout",
      ctaStyle: "green",
      features: [
        "Everything in Free",
        "Unlimited endpoints",
        "Last 50 calls visible",
        "90-day analytics",
        "Revenue breakdown gross/net",
        "Top paying agents",
        "Latency p50/p95/p99",
        "CSV export + tax report",
        "Wallet management",
        "MRR projection",
        "Metering engine",
        "Priority email support",
        "Cancel anytime",
      ],
    },
    {
      title: "Enterprise",
      popular: false,
      description: "For teams processing serious volume.",
      price: "0.5%",
      priceLabel: "of volume",
      cta: "Talk to us",
      ctaHref: "mailto:joaocamargo@gate402.dev",
      ctaStyle: "green",
      features: [
        "Everything in Pro",
        "Custom domain",
        "White-label dashboard",
        "SLA guarantee",
        "Dedicated support",
        "Custom integrations",
        "Onboarding call",
        "Cancel anytime",
      ],
    },
  ];

  return (
    <section className="flex flex-col items-center justify-center gap-12 w-full px-4 sm:px-6 mx-auto py-16 sm:py-20 bg-background text-foreground">
      <div className="flex flex-col items-center gap-4 w-full">
        <h2 className="font-medium text-center" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: 1.15 }}>
          <span style={{ color: '#fff' }}>Pricing that</span> <span style={{ color: '#898989' }}>scales with you.</span>
        </h2>
        <p className="text-center" style={{ fontSize: 16, color: '#898989', lineHeight: 1.65, maxWidth: 480 }}>
          Start free. Upgrade when you need more. No hidden fees. No minimums. Cancel anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 w-full max-w-4xl">
        {pricingPlans.map((plan, index) => (
          <div
            key={index}
            className="border border-primary/10 rounded-none"
          >
            <div className="p-5 sm:p-7 flex flex-col h-full gap-6 justify-between">
              <div className="flex flex-col gap-6">
                <div className="p-0 flex flex-col gap-4">
                  <div className="font-medium text-xl leading-5">
                    {plan.title}{" "}
                    {plan.popular && (
                      <span className="text-sm leading-[14px] font-normal" style={{ color: '#00bc7d' }}>
                        // most popular
                      </span>
                    )}
                  </div>
                  <p className="opacity-80 font-normal text-sm leading-[22px]">
                    {plan.description}
                  </p>
                  <div className="font-normal text-xs leading-3">
                    <span className="font-medium text-base leading-4">
                      {plan.price}
                    </span>
                    <span> {plan.priceLabel}</span>
                  </div>
                </div>
                <hr />

                <div className="flex flex-col gap-2">
                  {plan.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-center gap-1.5"
                    >
                      <CheckIcon className="w-[15px] h-[15px]" />
                      <span className="font-normal text-sm leading-[15.4px]">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <hr />
              <div className="p-0 ">
                <a
                  href={plan.ctaHref}
                  className="w-full h-10 rounded-none flex items-center justify-center text-sm font-medium transition-opacity hover:opacity-90"
                  style={
                    plan.ctaStyle === 'green'
                      ? { backgroundColor: '#00bc7d', color: '#111111' }
                      : { backgroundColor: 'transparent', border: '1px solid #333', color: '#d1d5db' }
                  }
                >
                  {plan.cta}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export { Pricing1 };
