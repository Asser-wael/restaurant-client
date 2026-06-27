import React from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import {
  increase,
  decrease,
  removeFromCart,
  clearCart,
} from "../../features/cartSlice";

import {
  FaPlus,
  FaMinus,
  FaTrash,
  FaCartShopping,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

export default function Cart() {

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { cart } = useSelector((state) => state.cartSlice);

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.count,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center">
        <FaCartShopping
          size={70}
          className="text-[var(--color-muted)]"
        />

        <h2 className="text-3xl font-bold text-[var(--color-text)] mt-5">
          Your Cart Is Empty
        </h2>

        <p className="text-[var(--color-muted)] mt-2">
          Add some delicious meals 🍕
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
  

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-[var(--color-text)]">
            Shopping Cart
          </h1>

          <p className="text-[var(--color-muted)] mt-2">
            {cart.length} Items
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => dispatch(clearCart())}
          className="
            bg-red-500
            text-white
            px-4 py-2
            rounded-xl
          "
        >
          Clear Cart
        </motion.button>
      </div>

      <div className="grid lg:grid-cols-[1fr_350px] gap-6">

        <div className="space-y-4">
          {cart.map((item, index) => (
            <motion.div
              key={`${item._id}-${item.size}`}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.05,
              }}
              whileHover={{
                y: -2,
              }}
              className="
                bg-[var(--color-card)]
                border border-[var(--color-border)]
                rounded-3xl
                p-4
                shadow-lg
              "
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-between" >

                <div className="flex  gap-5 ">

                  <img
                    src={`${import.meta.env.VITE_API_URL}/uploads/${item.image}`}
                    alt={item.name}
                    className="
                  w-36
                  h-36
                  object-cover
                  rounded-2xl
                  "
                  />


                  <div className=" mt-2">
                    <h2 className="text-xl font-bold text-[var(--color-text)]">
                      {item.name}
                    </h2>

                    <p className="text-[var(--color-muted)] mt-2">
                      Size: {item.size}
                    </p>

                    <div className="mt-3 text-2xl font-black text-[var(--color-accent)]">
                      {item.price} L.E
                    </div>
                  </div>
                </div>


                <div className="flex flex-row sm:flex-col justify-between gap-3 ">
                  <div
                    className="
                      flex items-center
                      gap-3
                      bg-[var(--color-bg)]
                      rounded-xl
                      px-3 py-2
                    "
                  >
                    <button
                      onClick={() =>
                        dispatch(decrease(item))
                      }
                    >
                      <FaMinus />
                    </button>

                    <span className="font-bold">
                      {item.count}
                    </span>

                    <button
                      onClick={() =>
                        dispatch(increase(item))
                      }
                    >
                      <FaPlus />
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      dispatch(removeFromCart(index))
                    }
                    className="
                      bg-red-500
                      text-white
                      rounded-xl
                      px-4 py-2
                    "
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>


        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="
            h-fit
            sticky
            top-5
            bg-[var(--color-card)]
            border border-[var(--color-border)]
            rounded-3xl
            p-6
            shadow-xl
          "
        >
          <h2 className="text-2xl font-black text-[var(--color-text)]">
            Order Summary
          </h2>

          <div className="flex justify-between mt-6">
            <span className="text-[var(--color-muted)]">
              Items
            </span>

            <span className="font-bold">
              {cart.reduce(
                (acc, item) => acc + item.count,
                0
              )}
            </span>
          </div>

          <div className="flex justify-between mt-4">
            <span className="text-[var(--color-muted)]">
              Total
            </span>

            <span className="text-3xl font-black text-[var(--color-accent)]">
              {totalPrice} L.E
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/checkout")}
            className="
              mt-6
              w-full
              py-4
              rounded-2xl
              bg-[var(--color-accent)]
              text-white
              font-bold
            "
          >
            Checkout
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}