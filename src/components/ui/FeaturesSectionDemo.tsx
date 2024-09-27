import { cn } from "@/lib/utils";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2,
  IconBrandMixpanel,
  IconWaveSawTool,
  IconMoneybag,
  IconCornerDownRightDouble,

} from "@tabler/icons-react";

export function FeaturesSectionDemo() {
  const features = [
    {
      title: "By producers. For producers",
      description:
        "Built for music producers, sound designers, beatmakers, and creators.",
      icon: <IconAdjustmentsBolt className="text-blue-500" />,
    },
    {
      title: "Precise control",
      description:
        "Add nuance to your sounds through precise text descriptions, tailoring each effect to fit your beat.",
      icon: <IconBrandMixpanel className="text-blue-500" />,
    },
    {
      title: "Royalty Free",
      description:
        "Use our sounds in your beats worry-free, with no licensing fees or royalties.",
      icon: <IconCurrencyDollar className="text-blue-500" />,
    },
    {
      title: "Highest Quality Audio",
      description: "Enjoy clear, high-fidelity sound that enhances your beats with pristine audio.",
      icon: <IconWaveSawTool className="text-blue-500" />,
    },
    {
      title: "Ease of use",
      description:
        "It's as easy as typing a sentence and describing your sound. Light work.",
      icon: <IconBrandMixpanel className="text-blue-500" />,
    },
    {
      title: "24/7 Customer Support",
      description:
        "We are available a 100% of the time. Atleast our AI Agents are.",
      icon: <IconHelp className="text-blue-500" />,
    },
    {
      title: "Money back guarantee",
      description:
        "If you don't like Loopgen after 30 days, no worries. We'll refund, no questions asked.",
      icon: <IconMoneybag className="text-blue-500" />,
    },
    {
      title: "Faster Workflow",
      description: "No more spending hours looking for that perfect sound. Generate it in seconds instead.",
      icon: <IconCornerDownRightDouble className="text-blue-500" />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r  py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
