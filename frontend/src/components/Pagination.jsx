function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <nav className="flex justify-center items-center space-x-2 mt-12">
            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${currentPage === page
                        ? 'bg-orange-500 text-white font-bold shadow-md'
                        : 'bg-white text-gray-700 hover:bg-orange-100'
                        }`}
                >
                    {page}
                </button>
            ))}
        </nav>
    );
}
export default Pagination;