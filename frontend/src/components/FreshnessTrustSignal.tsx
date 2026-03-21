import type { ApiFreshness } from '@/api/types';

interface FreshnessTrustSignalProps {
  freshness: ApiFreshness;
}

const statusMessageByCompleteness: Record<ApiFreshness['completeness'], string> =
  {
    complete: 'Data is up to date.',
    partial: 'Data may be incomplete.',
    unavailable: 'Data freshness is currently unavailable.',
  };

export const FreshnessTrustSignal = ({
  freshness,
}: FreshnessTrustSignalProps) => {
  const lastSyncText = freshness.last_sync_at || 'unavailable';
  const statusMessage = statusMessageByCompleteness[freshness.completeness];

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
      <p className="font-semibold">{statusMessage}</p>
      <p className="mt-1">Last synced: {lastSyncText}</p>
    </div>
  );
};
