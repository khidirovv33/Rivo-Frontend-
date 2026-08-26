import { useQuery } from '@tanstack/react-query';
import * as warehousesApi from '@/api/endpoints/warehouses';
import * as suppliersApi from '@/api/endpoints/suppliers';
import * as productsApi from '@/api/endpoints/products';

/** Складов и поставщиков у тенанта обычно немного — тянем полный список раз и резолвим имена на клиенте. */

export function useWarehousesLookup() {
  const { data, isLoading } = useQuery({
    queryKey: ['warehouses-lookup'],
    queryFn: () => warehousesApi.listWarehouses({ pageNumber: 1, pageSize: 200 }),
    staleTime: 60_000,
  });
  const warehouses = data?.items ?? [];
  const nameOf = (id: string) => warehouses.find((w) => w.id === id)?.name ?? '—';
  return { warehouses, nameOf, isLoading };
}

export function useSuppliersLookup() {
  const { data, isLoading } = useQuery({
    queryKey: ['suppliers-lookup'],
    queryFn: () => suppliersApi.listSuppliers({ pageNumber: 1, pageSize: 200 }),
    staleTime: 60_000,
  });
  const suppliers = data?.items ?? [];
  const nameOf = (id: string) => suppliers.find((s) => s.id === id)?.name ?? '—';
  return { suppliers, nameOf, isLoading };
}

/** Товаров может быть много — имя тянем по одному id, с кэшем на id. */
export function useProductName(id: string | null | undefined): string | null {
  const { data } = useQuery({
    queryKey: ['product-name', id],
    queryFn: () => productsApi.getProduct(id!),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
  return data?.name ?? null;
}

/** Для таблиц с потенциально многими строками (например, отчёт по остаткам) — один запрос
 * вместо резолва имени на каждую строку через useProductName. */
export function useProductsLookup() {
  const { data, isLoading } = useQuery({
    queryKey: ['products-lookup'],
    queryFn: () => productsApi.listProducts({ pageNumber: 1, pageSize: 200 }),
    staleTime: 60_000,
  });
  const products = data?.items ?? [];
  const nameOf = (id: string) => products.find((p) => p.id === id)?.name ?? '—';
  return { products, nameOf, isLoading };
}
