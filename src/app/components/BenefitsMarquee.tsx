import { Check } from 'lucide-react';

const benefits = [
  'الدفع عند الاستلام',
  'توصيل سريع',
  'منتجات أصلية وموثوقة',
  'استشارة مجانية للعناية بالبشرة',
  'عروض وخصومات مستمرة',
];

const REPEATS_PER_GROUP = 6;

function buildSequence() {
  return Array.from({ length: REPEATS_PER_GROUP }, () => benefits).flat();
}

function MarqueeContent({ ariaHidden = false }: { ariaHidden?: boolean }) {
  const sequence = buildSequence();

  return (
    <ul
      className="marquee-content flex items-center shrink-0 list-none m-0 p-0"
      aria-hidden={ariaHidden}
    >
      {sequence.map((label, index) => (
        <li key={`${label}-${index}`} className="flex items-center shrink-0">
          {index > 0 && (
            <span className="marquee-separator" aria-hidden="true">
              •
            </span>
          )}
          <span className="marquee-item" dir="rtl">
            {index === 0 && (
              <Check className="marquee-check" strokeWidth={2.5} aria-hidden="true" />
            )}
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function BenefitsMarquee() {
  return (
    <section className="benefits-marquee" aria-label="مميزات المتجر">
      <div className="marquee-viewport">
        <div className="marquee-track">
          <MarqueeContent />
          <MarqueeContent ariaHidden />
        </div>
      </div>
    </section>
  );
}
