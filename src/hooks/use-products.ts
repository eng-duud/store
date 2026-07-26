"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { PaginatedResponse, Product, ProductFilters } from "@/types";

export function useProducts(filters: ProductFilters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.categorySlug) params.set("category", filters.categorySlug);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.minPrice) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const { data } = await axios.get<{ success: boolean; data: PaginatedResponse<Product> }>(
        `/api/products?${params.toString()}`
      );
      return data.data;
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await axios.get<{ success: boolean; data: Product }>(
        `/api/products/${slug}`
      );
      return data.data;
    },
    enabled: !!slug,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data } = await axios.get<{ success: boolean; data: PaginatedResponse<Product> }>(
        "/api/products?limit=8&sort=newest"
      );
      return data.data.items;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axios.get("/api/categories");
      return data.data;
    },
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data } = await axios.get(`/api/categories/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });
}
