import { useEffect, useState } from "react";
import { getMyPayments } from "../../services/api";
import Spinner from "../components/Spinner";

import './MyPaymentsPage.css'

function MyPaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyPayments()
            .then((res) => setPayments(res.data.payments || []))
            .catch(() => setPayments([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Spinner />;

    return (
        <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-neutral-200 p-8 space-y-6">
            <h1 className="text-3xl font-extrabold text-primary-dark text-center mb-4">
                فواتيري
            </h1>

            {payments.length === 0 ? (
                <p className="text-center text-gray-500 text-lg">
                    لا توجد مدفوعات حتى الآن.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-center border-collapse border border-neutral-200">
                        <thead className="bg-primary/10 text-primary-dark text-sm uppercase">
                            <tr>
                                <th className="p-3">العمل الفني</th>
                                <th className="p-3">المبلغ</th>
                                <th className="p-3">الحالة</th>
                                <th className="p-3">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((p) => (
                                <tr key={p._id} className="border-b border-neutral-100 hover:bg-primary/5 transition">
                                    <td className="p-3 font-semibold">
                                        {p.auction?.artwork?.title || "غير معروف"}
                                    </td>
                                    <td className="p-3">{p.amount} ر.س</td>
                                    <td className="p-3 font-bold">
                                        {p.status === "SUCCESS" ? (
                                            <span className="text-green-600">✅ ناجح</span>
                                        ) : p.status === "FAILED" ? (
                                            <span className="text-red-600">❌ فشل</span>
                                        ) : (
                                            <span className="text-yellow-600">🕓 قيد التنفيذ</span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {new Date(p.createdAt).toLocaleDateString("ar-SA")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default MyPaymentsPage;
