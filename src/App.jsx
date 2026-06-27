import { RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppRoutes } from "./routes/AppRoutes.jsx";
import './App.css'
import { Suspense } from "react";
import Loading from "./components/loading.jsx";
import WaitingAdmin from "./components/waitingAdmin.jsx";
import Toast from "./components/Toast.jsx";
import { getUser } from "./features/authSlice.js";
import SoundPlayer from "./components/SoundPlayer.jsx";
import Popup from "./components/Popup.jsx";
import { show } from "./features/soundNotificationSlice";
import { setNotification } from "./features/notificationSlice";
import { socket } from "./services/socket";
import { getAdminOrders, updateTracking } from "./features/orderSlice.js";
import status from "./assets/status.mp3";
export default function App() {
  const dispatch = useDispatch();

  const { userData: user } = useSelector((state) => state.authSlice);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

useEffect(() => {
  if ("Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }
}, []);
  useEffect(() => {
    const tableNumber = localStorage.getItem("tableNumber");

    if (tableNumber) {
      socket.emit("join-table", tableNumber);
    }
  }, []);
  useEffect(() => {
    socket.on("order-status-updated", (data) => {
      dispatch(
        updateTracking({
          orderId: data.orderId,
          status: data.status,
        })
      );
      const tracking =
        JSON.parse(localStorage.getItem("orderTracking")) || [];

      const updatedTracking = tracking.map((order) =>
        order.orderId === data.orderId
          ? { ...order, status: data.status }
          : order
      );

      localStorage.setItem(
        "orderTracking",
        JSON.stringify(updatedTracking)
      );
      new Notification("🛒 Order Update", {
        body: `Your order is now ${data.status}`,
        icon: "/logo.png",
      });

      dispatch(
        setNotification({
          message: `Your order is now ${data.status}`,
          type: "success",
        })
      );

      const audio = new Audio(status);
      audio.play().catch(() => { });

      if (data.status === "completed" || data.status === "cancelled") {
        localStorage.removeItem("tableNumber");
      }
    });

    return () => {
      socket.off("order-status-updated");
    };
  }, [dispatch]);
  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      socket.emit("joinAdminRoom");

      const handler = async (order) => {
        await dispatch(getAdminOrders())
        if (Notification.permission === "granted") {
          dispatch(
            show({
              message: `New Order Table ${order.tableNumber}`,
            })
          );

          new Notification("🛒 New Order", {
            body: `Table ${order.tableNumber}`,
            icon: "/logo.png",
          });

          dispatch(
            setNotification({
              message: `New Order Table ${order.tableNumber}`,
              type: "order",
            })
          );
        }
      };

      socket.on("newOrder", handler);

      return () => {
        socket.off("newOrder", handler);
      };
    }
  }, [dispatch]);

  // ✅ SAFE: after hooks
  if (user && user.status === false) {
    return <WaitingAdmin />;
  }

  return (
    <>
      <Toast />
      <SoundPlayer />
      <Popup />
      <Suspense fallback={<Loading />}>
        <RouterProvider router={AppRoutes} />
      </Suspense>
    </>
  );
}