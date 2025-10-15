import ClipLoader from "react-spinners/ClipLoader";

function Spinner({ loading = true, size = 50, color = "#ea580c" }) {
    if (!loading) return null;

    return (
        <div className="flex justify-center items-center w-full h-full py-10">
            <ClipLoader
                color={color}
                loading={loading}
                size={size}
                aria-label="Loading Spinner"
            />
        </div>
    );
}

export default Spinner;
