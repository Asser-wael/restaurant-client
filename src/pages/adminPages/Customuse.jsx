import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { FaTrash } from "react-icons/fa";
import { IoFastFoodOutline } from "react-icons/io5";
import { HiOutlinePlus, HiOutlineFire, HiOutlineViewGrid } from "react-icons/hi";
import { BiFoodMenu } from "react-icons/bi";

import Loading from "../../components/loading";
import { setNotification } from "../../features/notificationSlice";
import { motion } from "framer-motion";

import {
  addNewCategory,
  getAllCategories,
  deleteCategory,
  addPopular,
  deletePopular,
  getPopularDishes,
} from "../../features/customuseSlice";

import { getAllRecipes } from "../../features/menuSlice";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export default function Customuse() {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset } = useForm();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("categories");

  const { categories, PopularDishes } = useSelector((s) => s.customuseSlice);
  const { recipes, loadingRecipes } = useSelector((s) => s.menuSlice);
  const {
    loadingCategories,
    loadingPopular,
    loadingCreateCategory,
    loadingDeleteCategory,
    loadingAddPopular,
    loadingDeletePopular,
  } = useSelector((s) => s.customuseSlice);

  useEffect(() => {
    dispatch(getAllRecipes());
    dispatch(getAllCategories());
    dispatch(getPopularDishes());
  }, [dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    const exist = categories?.some((i) => i.name === data.name);
    if (!image)
      return dispatch(setNotification({ message: "Image is required", type: "error" }));
    if (exist)
      return dispatch(setNotification({ message: "Category already exists", type: "error" }));

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("image", image);

    const res = await dispatch(addNewCategory(formData));
    if (res.payload) {
      reset();
      setImage(null);
      setPreview(null);
      dispatch(getAllCategories());
    }
  };

  const handleDeleteCategory = async (id) => {
    await dispatch(deleteCategory(id));
    dispatch(getAllCategories());
  };

  const popularIds = PopularDishes?.map((p) => p.id?._id);
  const popularList = recipes?.filter((r) => popularIds?.includes(r._id));
  const normalList = recipes?.filter((r) => !popularIds?.includes(r._id));

  const handleAddPopular = (id) =>
    dispatch(addPopular(id)).then(() => dispatch(getPopularDishes()));

  const handleRemovePopular = (id) =>
    dispatch(deletePopular(id)).then(() => dispatch(getPopularDishes()));

  const isLoading =
    loadingCategories ||
    loadingPopular ||
    loadingCreateCategory ||
    loadingDeleteCategory ||
    loadingAddPopular ||
    loadingDeletePopular ||
    loadingRecipes;

  if (isLoading) return <Loading />;

  const tabs = [
    { key: "categories", label: "Categories", icon: <HiOutlineViewGrid className="text-lg" />, count: categories?.length },
    { key: "popular", label: "Popular", icon: <HiOutlineFire className="text-lg" />, count: popularList?.length },
    { key: "meals", label: "All Meals", icon: <BiFoodMenu className="text-lg" />, count: normalList?.length },
  ];

  return (
    <motion.div
      className="min-h-screen bg-[var(--color-bg)] p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Customise</h1>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">Manage categories, popular dishes, and meals.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        <motion.aside
          {...fadeUp}
          className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-6"
        >
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <HiOutlinePlus className="text-orange-500 text-base" />
              </div>
              <h2 className="text-base font-semibold text-[var(--color-text)]">New Category</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--color-muted)] mb-1.5 font-medium">Category name</label>
                <input
                  {...register("name", { required: true })}
                  placeholder="e.g. Burgers"
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-orange-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--color-muted)] mb-1.5 font-medium">Image</label>
                <label className="flex flex-col items-center justify-center gap-2 w-full h-32 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-orange-400 transition-colors cursor-pointer overflow-hidden relative">
                  {preview ? (
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <IoFastFoodOutline className="text-3xl text-[var(--color-muted)]" />
                      <span className="text-xs text-[var(--color-muted)]">Click to upload</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white py-2.5 rounded-xl text-sm font-semibold"
              >
                Create Category
              </button>
            </form>
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 mt-4">
            {[
              { label: "Categories", value: categories?.length ?? 0, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Popular", value: popularList?.length ?? 0, color: "text-orange-500", bg: "bg-orange-500/10" },
              { label: "Meals", value: normalList?.length ?? 0, color: "text-green-500", bg: "bg-green-500/10" },
            ].map((s) => (
              <div key={s.label} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-3 flex lg:flex-row flex-col items-center lg:gap-3 gap-1">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                  <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
                </div>
                <span className="text-xs text-[var(--color-muted)] text-center lg:text-left">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.aside>

        <div className="flex-1 min-w-0">

          {/* Tab bar */}
          <div className="flex gap-1 mb-5 bg-[var(--color-card)] border border-[var(--color-border)] p-1 rounded-xl w-fit">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer
                  ${activeTab === t.key
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                  }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                  ${activeTab === t.key ? "bg-white/20 text-white" : "bg-[var(--color-border)] text-[var(--color-muted)]"}`}>
                  {t.count ?? 0}
                </span>
              </button>
            ))}
          </div>

          {activeTab === "categories" && (
            <motion.div {...fadeUp} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {categories?.map((cat, i) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative group bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col items-center text-center hover:border-orange-300 transition-colors"
                >
                  <button
                    onClick={() => handleDeleteCategory(cat._id)}
                    className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                    aria-label="Delete"
                  >
                    <FaTrash className="text-[10px]" />
                  </button>

                  {cat.image ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/uploads/${cat.image}`}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-[var(--color-border)]"
                      alt={cat.name}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <IoFastFoodOutline className="text-2xl text-orange-500" />
                    </div>
                  )}

                  <p className="mt-3 text-sm font-semibold text-[var(--color-text)] line-clamp-1">
                    {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── POPULAR TAB ── */}
          {activeTab === "popular" && (
            <motion.div {...fadeUp}>
              {popularList?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-[var(--color-muted)] gap-3">
                  <HiOutlineFire className="text-5xl opacity-20" />
                  <p className="text-sm">No popular dishes yet. Add some from All Meals.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {popularList?.map((item, i) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden group"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={`${import.meta.env.VITE_API_URL}/uploads/${item.image}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          alt={item.name}
                        />
                        <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <HiOutlineFire /> Popular
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="font-semibold text-sm text-[var(--color-text)] mb-3 line-clamp-1">{item.name}</p>
                        <button
                          onClick={() => handleRemovePopular(item._id)}
                          className="w-full flex items-center justify-center gap-2 border border-red-400 text-red-500 hover:bg-red-500 hover:text-white transition-colors py-2 rounded-xl text-sm font-medium"
                        >
                          <FaTrash className="text-xs" /> Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "meals" && (
            <motion.div {...fadeUp}>
              {normalList?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-[var(--color-muted)] gap-3">
                  <BiFoodMenu className="text-5xl opacity-20" />
                  <p className="text-sm">All meals are already marked as popular!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {normalList?.map((item, i) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-3 hover:border-orange-300 transition-colors"
                    >
                      <img
                        src={`${import.meta.env.VITE_API_URL}/uploads/${item.image}`}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                        alt={item.name}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[var(--color-text)] line-clamp-1">{item.name}</p>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">{item.Category}</p>
                      </div>
                      <button
                        onClick={() => handleAddPopular(item._id)}
                        className="shrink-0 flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white px-3 py-1.5 rounded-xl text-xs font-semibold"
                      >
                        <HiOutlineFire /> Popular
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </motion.div>
  );
}