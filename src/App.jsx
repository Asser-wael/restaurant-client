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
  try {
    new Audio(status).play().catch((err) => {
      console.warn("Audio play failed:", err);
    });
  } catch (err) {
    console.error("playStatusSound error:", err);
  }
};

const sendBrowserNotification = (title, options) => {
  try {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      new Notification(title, options);
    }
  } catch (err) {
    console.warn("Notification not supported:", err);
  }
};

const setupPushNotification = async (endpoint, body) => {
  try {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (err) {
        console.error("requestPermission error:", err);
        return;
      }
    }

    if (Notification.permission !== "granted") return;

    let registration;
    try {
      registration = await navigator.serviceWorker.register("/sw.js");
    } catch (err) {
      console.error("Service worker registration failed:", err);
      return;
    }

    let subscription;
    try {
      subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
        });
      }
    } catch (err) {
      console.error("Push subscription failed:", err);
      return;
    }

    try {
      await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body(subscription)),
      });
    } catch (err) {
      console.error("Failed to send subscription to server:", err);
    }
  } catch (err) {
    console.error("setupPushNotification error:", err);
  }
};

const registerCustomerPush = () => {
  try {
    const tableNumber = localStorage.getItem("tableNumber");
    if (!tableNumber) return;

    setupPushNotification(
      "/save-customer-subscription",
      (subscription) => ({ tableNumber, subscription })
    ).catch((err) => console.error("Customer push setup failed:", err));
  } catch (err) {
    console.error("Customer push effect error:", err);
  }
};

export default function App() {
  const dispatch = useDispatch();
  const { userData: user } = useSelector((state) => state.authSlice);

  useEffect(() => {
    try {
      dispatch(getUser());
    } catch (err) {
      console.error("getUser dispatch error:", err);
    }
  }, [dispatch]);

  useEffect(() => {
    try {
      if (user?.role !== "admin") return;

      setupPushNotification(
        "/save-admin-subscription",
        (subscription) => subscription
      ).catch((err) => console.error("Admin push setup failed:", err));
    } catch (err) {
      console.error("Admin push effect error:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "admin") return;

    registerCustomerPush();

    window.addEventListener("tableNumberSet", registerCustomerPush);

    return () => {
      window.removeEventListener("tableNumberSet", registerCustomerPush);
    };
  }, [user]);

  useEffect(() => {
    try {
      const tableNumber = localStorage.getItem("tableNumber");
      if (tableNumber) {
        socket.emit("join-table", tableNumber);
      }
    } catch (err) {
      console.error("join-table emit error:", err);
    }
  }, []);

  useEffect(() => {
    const handleOrderStatus = async (data) => {
      try {
        console.log("order-status-updated", data);

        let tracking = [];
        try {
          tracking = JSON.parse(localStorage.getItem("orderTracking")) || [];
        } catch (err) {
          console.error("Failed to parse orderTracking from localStorage:", err);
          tracking = [];
        }

        const orderExists = tracking.find((o) => o.orderId === data.orderId);
        if (!orderExists) {
          console.log("Order not found in tracking, ignoring event");
          return;
        }

        try {
          dispatch(updateTracking({ orderId: data.orderId, status: data.status }));
        } catch (err) {
          console.error("updateTracking dispatch error:", err);
        }

        try {
          const updatedTracking = tracking.map((order) =>
            order.orderId === data.orderId
              ? { ...order, status: data.status }
              : order
          );
          localStorage.setItem("orderTracking", JSON.stringify(updatedTracking));
        } catch (err) {
          console.error("Failed to update orderTracking in localStorage:", err);
        }

        try {
          sendBrowserNotification("🛒 Order Update", {
            body: `Your order is now ${data.status}`,
            icon: "/logo.png",
          });
        } catch (err) {
          console.error("sendBrowserNotification error:", err);
        }

        try {
          dispatch(setNotification({
            message: `Your order is now ${data.status}`,
            type: "success",
          }));
        } catch (err) {
          console.error("setNotification dispatch error:", err);
        }

        try {
          playStatusSound();
        } catch (err) {
          console.error("playStatusSound error:", err);
        }

        if (data.status === "completed" || data.status === "cancelled") {
          try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
              const subscription = await registration.pushManager.getSubscription();
              if (subscription) {
                try {
                  await fetch(
                    `${import.meta.env.VITE_API_URL}/delete-customer-subscription`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ endpoint: subscription.endpoint }),
                    }
                  );
                } catch (err) {
                  console.error("Failed to delete subscription on server:", err);
                }

                try {
                  await subscription.unsubscribe();
                } catch (err) {
                  console.error("Failed to unsubscribe:", err);
                }
              }
            }
          } catch (err) {
            console.error(err);
          } finally {
            try {
              localStorage.removeItem("tableNumber");
              localStorage.removeItem("orderTracking");
            } catch (err) {
              console.error("Failed to clear localStorage:", err);
            }
          }
        }
      } catch (err) {
        console.error("handleOrderStatus error:", err);
      }
    };

    try {
      socket.off("order-status-updated");
      socket.on("order-status-updated", handleOrderStatus);
    } catch (err) {
      console.error("Failed to attach order-status-updated listener:", err);
    }

    return () => {
      try {
        socket.off("order-status-updated", handleOrderStatus);
      } catch (err) {
        console.error("Failed to detach order-status-updated listener:", err);
      }
    };
  }, [dispatch]);

  useEffect(() => {
    try {
      if (!localStorage.getItem("accessToken")) return;

      socket.emit("joinAdminRoom");

      const handleNewOrder = async (order) => {
        try {
          await dispatch(getAdminOrders());

          try {
            sendBrowserNotification("🛒 New Order", {
              body: `New Order Table ${order.tableNumber}`,
              icon: "/logo.png",
            });
          } catch (err) {
            console.error("sendBrowserNotification error:", err);
          }

          try {
            dispatch(
              show({
                message: `New Order Table ${order.tableNumber}`,
              })
            );
          } catch (err) {
            console.error("show dispatch error:", err);
          }
        } catch (err) {
          console.error("handleNewOrder error:", err);
        }
      };

      // ✅ امسح القديم الأول
      socket.off("newOrder");
      socket.on("newOrder", handleNewOrder);

      return () => {
        try {
          socket.off("newOrder", handleNewOrder);
        } catch (err) {
          console.error("Failed to detach newOrder listener:", err);
        }
      };
    } catch (err) {
      console.error("newOrder effect setup error:", err);
    }
  }, [dispatch]);

  useEffect(() => {
    try {
      Notification.requestPermission();
    } catch (err) {
      console.error("requestPermission error:", err);
    }
  }, []);

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