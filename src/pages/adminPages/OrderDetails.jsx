import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "../../features/orderSlice";
import Loading from "../../components/Loading";
import { IoClose } from "react-icons/io5";

const STATUS_OPTIONS = ["pending", "accepted", "preparing", "completed", "cancelled"]


export default function OrderDetails() {
    const { id } = useParams();
    const dispatch = useDispatch();

    const { order, loading } = useSelector(
        (state) => state.orderSlice
    );

    const [status, setStatus] = useState("");
    const [img, setimg] = useState(null);

    useEffect(() => {
        dispatch(getOrderById(id));

    }, [id, dispatch]);

    useEffect(() => {
        if (order?.status) {
            setStatus(order.status);
            console.log(order);
        }
    }, [order]);

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;

        
        setStatus(newStatus);

        // update backend
        dispatch(updateOrderStatus({ id, status: newStatus }));
    };

    if (img) {
        return (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-lg">
                <img
                    src={img}
                    alt="Preview"
                    className="w-full rounded-xl object-cover"
                />

                <button
                    onClick={() => setimg(null)}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white transition-all duration-200 hover:rotate-90 hover:scale-110"
                >
                    <IoClose size={22} />
                </button>
            </div>
        );
    }
    if (loading || !order) {
        return <Loading />;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto text-[var(--color-text)]">
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-2xl font-bold">
                    Order #{order._id.slice(-6)}
                </h1>

                <select
                    value={status}
                    onChange={handleStatusChange}
                    className="border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 rounded-lg text-sm"
                >
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            </div>

            {/* Card */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] shadow-sm rounded-xl p-5 space-y-4">

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-400">Table</p>
                        <p className="font-semibold">{order.tableNumber}</p>
                    </div>

                    <div>
                        <p className="text-gray-400">Payment</p>
                        <p className="font-semibold">{order.paymentMethod}</p>
                    </div>

                    <div>
                        <p className="text-gray-400">Status</p>
                        <p className="font-semibold text-[var(--color-accent)]">
                            {order.status}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-400">Order Time</p>
                        <p className="font-semibold">
                            {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                    {order.paymentMethod === "wallet" && (
                        <>
                            <div >
                                <p className="text-gray-400">Wallet Name</p>
                                <p className="font-semibold">
                                    {order.walletName}
                                </p>

                            </div>
                            <div >
                                <p className="text-gray-400">Wallet Number</p>
                                <p className="font-semibold">
                                    {order.walletNumber}
                                </p>

                            </div>
                            <div >
                                <p className="text-gray-400">Wallet Type</p>
                                <p className="font-semibold">
                                    {order.walletType}
                                </p>

                            </div>
                            <div className="  cursor-pointer" onClick={() => setimg(`${import.meta.env.VITE_API_URL}/uploads/${order.image}`)}>
                                <p className="text-gray-400">Payment Proof</p>
                                <img src={`${import.meta.env.VITE_API_URL}/uploads/${order.image}`} alt="" />
                            </div>
                        </>
                    )}
                </div>

                {/* Items */}
                <div className="border-t border-[var(--color-border)] pt-4">
                    <h2 className="font-bold mb-3">Items</h2>

                    <div className="space-y-2">
                        {order.cart?.map((item, i) => (
                            <div
                                key={i}
                                className="flex justify-between items-center p-2 rounded-lg border border-[var(--color-border)] text-sm"
                            >
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-xs text-gray-400">
                                        Size: {item.size}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p>
                                        {item.price} L.E × {item.count}
                                    </p>
                                    <p className="font-bold">
                                        {item.price * item.count} L.E
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total */}
                <div className="text-right text-xl font-bold border-t border-[var(--color-border)] pt-3">
                    Total: {order.totalPrice}€
                </div>
            </div>
        </div>
    );
}