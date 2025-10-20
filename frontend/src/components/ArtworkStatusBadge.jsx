import { Link } from 'react-router-dom';

function ArtworkStatusBadge({ artwork }) {
    // فحص وقائي: إذا كانت بيانات العمل الفني غير موجودة، لا تقم بعرض أي شيء
    if (!artwork || !artwork.status) {
        return null;
    }

    // بناءً على حالة العمل الفني، اعرض الشارة المناسبة
    switch (artwork.status) {
        case 'IN_AUCTION':
            // تأكد من وجود المزاد قبل إنشاء الرابط
            if (artwork.auction) {
                return (
                    <Link to={`/auctions/${artwork.auction.id}`} className="mt-4 inline-block">
                        <span className="bg-primary/10 text-primary-dark text-xs font-semibold px-3 py-1 rounded-full hover:bg-primary/20 transition">
                            متاح في مزاد
                        </span>
                    </Link>
                );
            }
            return (
                <span className="mt-4 inline-block bg-neutral-200 text-neutral-700 text-xs font-semibold px-3 py-1 rounded-full">
                    قيد المعالجة
                </span>
            );
        case 'SOLD':
            return (
                <span className="mt-4 inline-block bg-secondary/10 text-secondary-dark text-xs font-semibold px-3 py-1 rounded-full">
                    مُباع
                </span>
            );
        case 'ENDED':
            return (
                <span className="mt-4 inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                    انتهى المزاد
                </span>
            );
        default: // الحالة الافتراضية هي 'DRAFT'
            return (
                <span className="mt-4 inline-block bg-neutral-200 text-neutral-700 text-xs font-semibold px-3 py-1 rounded-full">
                    قريبًا
                </span>
            );
    }
}

export default ArtworkStatusBadge;