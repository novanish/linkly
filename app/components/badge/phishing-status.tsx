import { Info, Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { PHISHING_STATUS } from '~/lib/consts';

type PhishingStatus = (typeof PHISHING_STATUS)[keyof typeof PHISHING_STATUS];

interface PhishingStatusBadgeProps {
  status: PhishingStatus;
  showLabel?: boolean;
}

export function PhishingStatusBadge({
  status,
  showLabel = true,
}: PhishingStatusBadgeProps) {
  const { icon, label, tooltip, variant, badgeClass } =
    getPhishingStatusMeta(status);

  return (
    <div className="flex items-center gap-1">
      <Badge
        variant={variant}
        className={`${variant === 'default' ? badgeClass : ''} flex items-center gap-1`}
      >
        {icon}
        {showLabel ? <span>{label}</span> : null}
      </Badge>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="More information about phishing status"
            >
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" align="center" className="max-w-xs">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

function getPhishingStatusMeta(status: PhishingStatus) {
  switch (status) {
    case PHISHING_STATUS.SAFE:
      return {
        icon: <ShieldCheck className="h-4 w-4" />,
        label: 'Safe',
        tooltip:
          'This URL appears safe. No signs of phishing or harmful content were detected.',
        variant: 'default' as const,
        badgeClass: 'bg-green-500 hover:bg-green-600',
      };

    case PHISHING_STATUS.SUSPICIOUS:
      return {
        icon: <ShieldAlert className="h-4 w-4" />,
        label: 'Suspicious',
        tooltip:
          'The URL shows patterns commonly associated with phishing (e.g., misleading domains or suspicious parameters).',
        variant: 'secondary' as const,
        badgeClass: 'bg-amber-500 hover:bg-amber-600',
      };

    case PHISHING_STATUS.PHISHING:
      return {
        icon: <ShieldX className="h-4 w-4" />,
        label: 'Phishing',
        tooltip:
          'This URL is confirmed to be malicious. It is known for phishing or scamming users.',
        variant: 'destructive' as const,
        badgeClass: 'bg-red-500 hover:bg-red-600',
      };

    default:
      return {
        icon: <Shield className="h-4 w-4" />,
        label: 'Unknown',
        tooltip: 'URL safety status unknown',
        variant: 'outline' as const,
        badgeClass: '',
      };
  }
}
