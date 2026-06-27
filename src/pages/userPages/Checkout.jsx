import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { checkOut } from "../../features/orderSlice";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { socket } from "../../services/socket";


export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const paymentMethod = watch("paymentMethod");

  const onSubmit = (data) => {
    const formData = new FormData();

    formData.append("paymentMethod", data.paymentMethod);
    formData.append("tableNumber", data.tableNumber);


    if (data.paymentMethod === "wallet") {
      formData.append("walletType", data.walletType);
      formData.append("walletName", data.walletName);
      formData.append("walletNumber", data.walletNumber);
      formData.append("image", data.image[0]);
    }

    dispatch(checkOut(formData));
    
    localStorage.setItem("tableNumber", data.tableNumber);
    socket.emit("join-table", data.tableNumber);
    navigate("/")


  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto bg-card border mt-10 border-border rounded-3xl p-8 shadow-lg"
    >
      <h2 className="text-3xl font-bold text-text mb-8">
        Payment Method
      </h2>

      <div className="space-y-4">
        <label className="flex items-center gap-3 p-4 border border-border rounded-xl cursor-pointer">
          <input
            type="radio"
            value="cash"
            {...register("paymentMethod", {
              required: "Choose payment method",
            })}
          />
          Cash On Delivery
        </label>

        <label className="flex items-center gap-3 p-4 border border-border rounded-xl cursor-pointer">
          <input
            type="radio"
            value="wallet"
            {...register("paymentMethod", {
              required: "Choose payment method",
            })}
          />
          Cash Wallet
        </label>
      </div>

      {errors.paymentMethod && (
        <p className="text-red-500 mt-2">
          {errors.paymentMethod.message}
        </p>
      )}

      {paymentMethod === "wallet" && (
        <div className="mt-8 space-y-5">
          <select
            {...register("walletType", {
              required: "Choose wallet type",
            })}
            className="w-full border border-border rounded-xl p-3 bg-bg"
          >
            <option value="">Choose Wallet</option>
            <option value="vodafone">Vodafone Cash</option>
            <option value="orange">Orange Cash</option>
            <option value="etisalat">Etisalat Cash</option>
            <option value="we">WE Pay</option>
            <option value="else">Else</option>
          </select>

          {errors.walletType && (
            <p className="text-red-500">
              {errors.walletType.message}
            </p>
          )}

          <input
            type="text"
            placeholder="Wallet Owner Name"
            {...register("walletName", {
              required: "Wallet owner name is required",
            })}
            className="w-full border border-border rounded-xl p-3"
          />

          {errors.walletName && (
            <p className="text-red-500">
              {errors.walletName.message}
            </p>
          )}

          <input
            type="tel"
            placeholder="Wallet Number"
            {...register("walletNumber", {
              required: "Wallet number is required",
              pattern: {
                value: /^01[0-2,5]{1}[0-9]{8}$/,   /////////  للللللللللا رقام المصريه 
                message: "Invalid wallet number",
              },
            })}
            className="w-full border border-border rounded-xl p-3"
          />

          {errors.walletNumber && (
            <p className="text-red-500">
              {errors.walletNumber.message}
            </p>
          )}


          <input
            type="file"
            accept="image/*"
            {...register("image", {
              required: "Transfer screenshot is required",
            })}
            onChange={(e) => {
              if (e.target.files[0]) {
                setPreview(e.target.files[0])
              }
            }}
            className="w-full border border-border rounded-xl p-3"
          />




          {errors.transferImage && (
            <p className="text-red-500">
              {errors.transferImage.message}
            </p>
          )}

          {preview && (
            <img
              src={URL.createObjectURL(preview)}
              alt="preview"
              className="w-full h-56 object-cover rounded-xl border border-border"
            />
          )}
        </div>
      )}
      <input
        type="number"
        placeholder="Table Number"
        {...register("tableNumber")}
        className="w-full border border-border mt-4 rounded-xl p-3"
      />


      <button
        type="submit"
        className="w-full mt-8 bg-accent text-white font-semibold py-4 rounded-xl"
      >
        Confirm Order
      </button>
    </form>
  );
}