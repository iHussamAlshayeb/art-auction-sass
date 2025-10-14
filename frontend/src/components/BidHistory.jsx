function BidHistory({ bids }) {
  if (bids.length === 0) {
    return (
      <div className="mt-6 text-center text-gray-500">
        <p>كن أول من يزايد!</p>
      </div>
    );
  }

  return (
    <div className="pt-6 border-t border-orange-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4">سجل المزايدات</h3>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {bids.map((bid) => (
          <div key={bid.id} className="flex justify-between items-center bg-orange-50 p-3 rounded-lg">
            <span className="font-semibold text-gray-700">{bid.bidder.name}</span>
            <span className="text-lg font-bold text-gray-900">{bid.amount.toFixed(2)} ريال</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BidHistory;