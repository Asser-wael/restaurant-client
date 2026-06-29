import { Suspense, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "./App.css";

import { AppRoutes } from "./routes/AppRoutes";

import Loading from "./components/loading";
import Popup from "./components/Popup";
import SoundPlayer from "./components/SoundPlayer";
import Toast from "./components/Toast";
import WaitingAdmin from "./components/waitingAdmin";

import status from "./assets/status.mp3";

import { socket } from "./services/socket";

import { getUser } from "./features/authSlice";
import { setNotification } from "./features/notificationSlice";
import { getAdminOrders, updateTracking } from "./features/orderSlice";
import { show } from "./features/soundNotificationSlice";

const playStatusSound = () => {
  new Audio(status).play().catch(() => { });
};

const sendBrowserNotification = (title, options) => {
  if (!("Notification" in window)) return;

  try {
    if (Notification.permission === "granted") {
      new Notification(title, options);
    }
  } catch (err) {
    console.warn("Notification not supported:", err);
  }
};

// ✅ [FIX 1] دالة مشتركة بدل تكرار كود الـ Push Notification مرتين
const setupPushNotification = async (endpoint, body) => {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }

  if (Notification.permission !== "granted") return;

  const registration = await navigator.serviceWorker.register("/sw.js");

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
    });
  }

  await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body(subscription)),
  });
};

export default function App() {
  const dispatch = useDispatch();

  const { userData: user } = useSelector((state) => state.authSlice);

  /* =========================
        Get Current User
  ========================== */

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  /* =========================
      Admin Push Notification
  ========================== */

  useEffect(() => {
    if (user?.role !== "admin") return;

    // ✅ [FIX 1] استخدام الدالة المشتركة بدل تكرار الكود
    setupPushNotification(
      "/save-admin-subscription",
      (subscription) => subscription
    ).catch(console.error);
  }, [user]);

  /* =========================
      Customer Push Notification
  ========================== */

  useEffect(() => {
    if (user?.role === "admin") return;

    const tableNumber = localStorage.getItem("tableNumber");
    if (!tableNumber) return;

    // ✅ [FIX 1] استخدام الدالة المشتركة بدل تكرار الكود
    setupPushNotification(
      "/save-customer-subscription",
      (subscription) => ({ tableNumber, subscription })
    ).catch(console.error);
  }, [user]);

  /* =========================
      Join Customer Room
  ========================== */

  useEffect(() => {
    const tableNumber = localStorage.getItem("tableNumber");

    if (tableNumber) {
      socket.emit("join-table", tableNumber);
    }
  }, []);

  /* =========================
      Customer Order Updates
  ========================== */

  useEffect(() => {
    const handleOrderStatus = async (data) => {
      console.log("1", data);

      dispatch(
        updateTracking({
          orderId: data.orderId,
          status: data.status,
        })
      );

      console.log("2");

      const tracking =
        JSON.parse(localStorage.getItem("orderTracking")) || [];

      const updatedTracking = tracking.map((order) =>
        order.orderId === data.orderId
          ? { ...order, status: data.status }
          : order
      );

      localStorage.setItem("orderTracking", JSON.stringify(updatedTracking));

      console.log("3");

      sendBrowserNotification("🛒 Order Update", {
        body: `Your order is now ${data.status}`,
        icon: "/logo.png",
      });

      console.log("4");

      dispatch(
        setNotification({
          message: `Your order is now ${data.status}`,
          type: "success",
        })
      );

      console.log("5");

      playStatusSound();

      console.log("6");

      if (data.status === "completed" || data.status === "cancelled") {
        console.log("7");

        const registration = await navigator.serviceWorker.getRegistration();

        if (!registration) {
          console.log("No Service Worker");
        } else {
          const subscription = await registration.pushManager.getSubscription();

          if (subscription) {
            await fetch(
              `${import.meta.env.VITE_API_URL}/delete-customer-subscription`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  endpoint: subscription.endpoint,
                }),
              }
            );
          }
        }

        localStorage.removeItem("tableNumber");
        localStorage.removeItem("orderTracking");
      }
    };


    socket.on("order-status-updated", handleOrderStatus);

    return () => {
      socket.off("order-status-updated", handleOrderStatus);
    };
  }, [dispatch]);

  /* =========================
        Admin New Orders
  ========================== */

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) return;

    socket.emit("joinAdminRoom");

    const handleNewOrder = async (order) => {
      await dispatch(getAdminOrders());

      sendBrowserNotification("🛒 New Order", {
        body: `New Order Table ${order.tableNumber}`,
        icon: "/logo.png",
      });

      dispatch(
        show({
          message: `New Order Table ${order.tableNumber}`,
        })
      );
    };

    socket.on("newOrder", handleNewOrder);

    return () => {
      socket.off("newOrder", handleNewOrder);
    };
  }, [dispatch]);

  /* ========================= */

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
