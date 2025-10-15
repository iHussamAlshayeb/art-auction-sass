import { Link } from 'react-router-dom';

function ArtworkStatusBadge({ artwork }) {
    // بناءً على حالة العمل الفني، اعرض الشارة المناسبة
    switch (artwork.status) {
        case 'IN_AUCTION':
            return (
                <Link to={`/auctions/${artwork.auction.id}`} className="mt-4 inline-block">
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full hover:bg-green-200 transition">
                        متاح في مزاد
                    </span>
                </Link>
            );
        case 'SOLD':
            return (
                <span className="mt-4 inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                    مُباع
                </span>
            );
        case 'ENDED':
            return (
                <span className="mt-4 inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                    انتهى المزاد
                </span>
            );
        default: // الحالة الافتراضية هي 'DRAFT'
            return (
                <span className="mt-4 inline-block bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                    قريبًا
                </span>
            );
    }
}

export default ArtworkStatusBadge;

