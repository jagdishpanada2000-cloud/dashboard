import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
}

const SkeletonCard = ({ className }: SkeletonCardProps) => {
  return (
    <div className={cn("bg-card rounded-xl p-6 border border-border animate-pulse", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-8 w-16 bg-muted rounded" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
        <div className="w-12 h-12 bg-muted rounded-lg" />
      </div>
    </div>
  );
};

export default SkeletonCard;
