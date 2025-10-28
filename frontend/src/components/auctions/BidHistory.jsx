function BidHistory({ bids }) {
  if (bids.length === 0) {
    return (
      <div className="mt-6 text-center text-neutral-700">
        <p>كن أول من يزايد!</p>
      </div>
    );
  }

  return (
    <div className="pt-6 border-t border-neutral-200">
      <h3 className="text-xl font-bold text-neutral-900 mb-4">سجل المزايدات</h3>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {bids.map((bid) => (
          <div key={bid.id} className="flex justify-between items-center bg-primary/5 p-3 rounded-lg">
            <span className="font-semibold text-neutral-700">{bid.bidder.name}</span>
            <span className="text-lg font-bold text-primary-dark">{bid.amount.toFixed(2)} ريال</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BidHistory;