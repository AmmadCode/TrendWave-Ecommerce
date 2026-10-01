import { useCallback, useEffect, useState } from "react";
import type { Category, Product } from "./types";
import { getAdminCategories, getAdminProducts } from "./api";

export function useAdminProducts() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadCategories = useCallback(async () => {
    const data = await getAdminCategories();
    setCategories(data ?? []);
  }, []);

  const loadProducts = useCallback(async (searchVal = "") => {
    setLoading(true);

    try {
      const data = await getAdminProducts(searchVal);
      setProducts(data ?? []);
    } catch {
      console.log("fetching failed");
    } finally {
      setLoading(false);
    }
  }, []);

  function openCreateDialog() {
    setEditingProduct(null);
    setProductDialogOpen(true);
  }
  function closeProductDialog() {
    setProductDialogOpen(false);
    setEditingProduct(null);
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product);
    setProductDialogOpen(true);
  }

  const refreshAll = useCallback(async () => {
    await Promise.all([loadCategories(), loadProducts(search)]);
  }, [loadCategories, loadProducts, search]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProducts(search);
    }, 250);

    return () => clearTimeout(timer);
  }, [search, loadProducts]);

  return {
    search,
    setSearch,
    products,
    categories,
    categoryDialogOpen,
    setCategoryDialogOpen,
    loading,
    productDialogOpen,
    setProductDialogOpen,
    editingProduct,
    openCreateDialog,
    closeProductDialog,
    refreshAll,
    openEditDialog,
  };
}
