'use client';

import { EmptyState } from '@/components/EmptyState';
import { PoolCard } from '@/components';
import { usePoolsStore } from '@/src/store/poolsStore';

export default function BrowsePoolsPage() {
  const { pools } = usePoolsStore();

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 flex-1 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Donation Pools</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Discover donation pools on the network.
        </p>
      </div>

      {pools.length === 0 ? (
        <EmptyState
          variant="bordered"
          icon="search"
          iconTone="muted"
          title="No pools yet"
          description="There are no pools to display. Create the first one or check back later."
          secondaryAction={{ label: 'Create a Pool', href: '/pools/new' }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map((pool) => (
            <PoolCard key={pool.id} pool={pool} />
          ))}
        </div>
      )}
    </main>
  );
}
