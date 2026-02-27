import { ClaimForm } from '@/components/claims/claim-form';

export default function NewClaimPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New Claim</h1>
      <div className="rounded-lg border bg-white p-6">
        <ClaimForm />
      </div>
    </div>
  );
}
