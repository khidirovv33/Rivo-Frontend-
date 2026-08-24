import { useQueries } from '@tanstack/react-query';
import * as productsApi from '@/api/endpoints/products';

// Ни один DTO зоны Dev2 (Stock/StockMovement/PurchaseOrderItem/TransferItem/InventoryItem/...) не
// денормализует имя/SKU товара — бэкенд отдаёт только productId. Резолвим отдельными запросами
// по уникальным id (React Query кэширует каждый товар один раз на сессию).
export function useProductLookup(productIds: string[]): {
  getName: (productId: string) => string;
  getSku: (productId: string) => string;
  isLoading: boolean;
} {
  const uniqueIds = Array.from(new Set(productIds));

  const results = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ['product', id],
      queryFn: () => productsApi.getProduct(id),
      staleTime: 60_000,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);

  function getName(productId: string): string {
    const index = uniqueIds.indexOf(productId);
    return results[index]?.data?.name ?? '…';
  }

  function getSku(productId: string): string {
    const index = uniqueIds.indexOf(productId);
    return results[index]?.data?.sku ?? '';
  }

  return { getName, getSku, isLoading };
}
