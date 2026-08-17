import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Loader,
  Modal,
  PageHeader,
  Pagination,
  Table,
  Td,
  TextField,
  Th,
} from '@/components';
import { EditIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { usePermissions } from '@/auth/usePermissions';
import * as productsApi from '@/api/endpoints/products';
import { extractErrorMessage } from '@/api/client';
import { formatMoney } from '@/lib/format';
import type { ProductFormValues } from '@/lib/validation/catalog';
import type { ProductDto, ProductStatus } from '@/types/domain';
import { CatalogTabs } from './CatalogTabs';
import { ProductForm } from './ProductForm';
import { VariationsPanel } from './VariationsPanel';
import { PRODUCT_STATUS_LABEL, PRODUCT_STATUS_TONE } from './labels';
import styles from './ProductsPage.module.css';
import formStyles from '../_shared/CrudForm.module.css';

const PAGE_SIZE = 20;

export function ProductsPage() {
  const { has } = usePermissions();
  const queryClient = useQueryClient();

  const [pageNumber, setPageNumber] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setPageNumber(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    data: page,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['products', pageNumber, searchTerm],
    queryFn: () => productsApi.listProducts({ pageNumber, pageSize: PAGE_SIZE, searchTerm: searchTerm || undefined }),
  });

  const { data: editingProduct, isLoading: isEditingLoading } = useQuery({
    queryKey: ['product', editingId],
    queryFn: () => productsApi.getProduct(editingId!),
    enabled: editingId !== null,
  });

  const isModalOpen = creating || editingId !== null;

  function closeModal() {
    setCreating(false);
    setEditingId(null);
  }

  const saveMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const payload = {
        name: values.name,
        sku: values.sku,
        barcode: values.barcode || undefined,
        categoryId: values.categoryId || undefined,
        brandId: values.brandId || undefined,
        description: values.description || undefined,
        imageUrl: values.imageUrl || undefined,
        purchasePrice: values.purchasePrice,
        sellingPrice: values.sellingPrice,
        wholesalePrice: values.wholesalePrice,
        minimumPrice: values.minimumPrice,
        unit: values.unit,
        minimumStock: values.minimumStock,
        maximumStock: values.maximumStock,
        taxRate: values.taxRate,
      };
      if (editingId) {
        return productsApi.updateProduct(editingId, { ...payload, status: values.status as ProductStatus });
      }
      return productsApi.createProduct(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  function handleDelete(product: ProductDto) {
    if (window.confirm(`Удалить товар «${product.name}»?`)) {
      deleteMutation.mutate(product.id);
    }
  }

  const canCreate = has('Products.Create');
  const canUpdate = has('Products.Update');
  const canDelete = has('Products.Delete');

  return (
    <div>
      <CatalogTabs />
      <PageHeader
        title="Товары"
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setCreating(true)}>
              <PlusIcon width={16} height={16} />
              Добавить
            </Button>
          )
        }
      />

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <TextField
            label="Поиск"
            placeholder="Название, SKU или штрихкод…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <Loader />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && page && page.items.length === 0 && (
        <EmptyState message="Товары не найдены." />
      )}
      {!isLoading && !isError && page && page.items.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>SKU</Th>
                <Th>Название</Th>
                <Th>Категория</Th>
                <Th>Бренд</Th>
                <Th>Цена продажи</Th>
                <Th>Статус</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {page.items.map((product) => (
                <tr key={product.id}>
                  <Td className="font-data">{product.sku}</Td>
                  <Td>{product.name}</Td>
                  <Td>{product.categoryName ?? '—'}</Td>
                  <Td>{product.brandName ?? '—'}</Td>
                  <Td numeric>{formatMoney(product.sellingPrice)}</Td>
                  <Td>
                    <Badge tone={PRODUCT_STATUS_TONE[product.status]}>
                      {PRODUCT_STATUS_LABEL[product.status]}
                    </Badge>
                  </Td>
                  <Td>
                    <div className={formStyles.rowActions}>
                      {canUpdate && (
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(product.id)} aria-label="Изменить">
                          <EditIcon width={15} height={15} />
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(product)} aria-label="Удалить">
                          <TrashIcon width={15} height={15} />
                        </Button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination
            pageNumber={page.pageNumber}
            totalPages={page.totalPages}
            hasPreviousPage={page.hasPreviousPage}
            hasNextPage={page.hasNextPage}
            onChange={setPageNumber}
          />
        </>
      )}

      <Modal open={isModalOpen} onClose={closeModal} title={editingId ? 'Изменить товар' : 'Новый товар'}>
        {editingId && isEditingLoading ? (
          <Loader />
        ) : (
          <>
            <ProductForm
              product={editingProduct ?? null}
              onSubmit={(values) => saveMutation.mutate(values)}
              onCancel={closeModal}
              isSaving={saveMutation.isPending}
              serverError={saveMutation.error ? extractErrorMessage(saveMutation.error) : null}
            />
            {editingId && editingProduct && (
              <VariationsPanel
                productId={editingId}
                variations={editingProduct.variations}
                onRefresh={() => queryClient.invalidateQueries({ queryKey: ['product', editingId] })}
              />
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
