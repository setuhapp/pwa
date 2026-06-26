export function CompletenessBar({ percent }: { percent: number }) {
  return (
    <div>
      <div className="mb-1 text-sm text-gray-600">
        Your profile is {percent}% complete{percent < 100 ? " — add more to get views" : ""}.
      </div>
      <div className="h-3 w-full rounded-full bg-gray-200">
        <div className="h-3 rounded-full bg-green-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
