import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, PageHeader } from '@/components';
import { PrinterIcon } from '@/components/icons';
import * as barcodesApi from '@/api/endpoints/barcodes';
import { extractErrorMessage } from '@/api/client';
import { formatMoney } from '@/lib/format';
import { ProductPicker } from '../_shared/ProductPicker';
import { BarcodeType, type ProductDto } from '@/types/domain';
import styles from './BarcodesPage.module.css';
import formStyles from '../_shared/CrudForm.module.css';

export function BarcodesPage() {
  const queryClient = useQueryClient();
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [printing, setPrinting] = useState(false);
  const [labelUrl, setLabelUrl] = useState<string | null>(null);

  const { data: existing, isLoading: isLoadingExisting } = useQuery({
    queryKey: ['product-barcodes', product?.id],
    queryFn: () => barcodesApi.listProductBarcodes(product!.id, { pageSize: 20 }),
    enabled: Boolean(product),
  });
  const barcode = existing?.items.find((b) => b.isPrimary) ?? existing?.items[0] ?? null;

  const generateMutation = useMutation({
    // Тип штрихкода (BarcodeType) не подписан в Swagger — берём первое значение по умолчанию.
    mutationFn: () => barcodesApi.generateBarcode({ productId: product!.id, type: BarcodeType.Type1, isPrimary: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-barcodes', product?.id] }),
  });

  function pickProduct(p: ProductDto) {
    setProduct(p);
  }

  // GET .../label требует авторизации — обычный <img src> не приложит JWT, поэтому грузим
  // картинку как blob через apiClient и подставляем object URL. Освобождаем предыдущий URL
  // при смене штрихкода/размонтировании, чтобы не текла память.
  useEffect(() => {
    if (!barcode) {
      setLabelUrl(null);
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    barcodesApi.fetchBarcodeLabelUrl(barcode.id).then((url) => {
      if (cancelled) {
        URL.revokeObjectURL(url);
        return;
      }
      objectUrl = url;
      setLabelUrl(url);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [barcode]);

  useEffect(() => {
    if (!printing) return;
    const handler = () => setPrinting(false);
    window.addEventListener('afterprint', handler);
    const frame = requestAnimationFrame(() => window.print());
    return () => {
      window.removeEventListener('afterprint', handler);
      cancelAnimationFrame(frame);
    };
  }, [printing]);

  return (
    <div>
      <PageHeader title="Штрихкоды" subtitle="Генерация штрихкода для товара и печать этикетки" />

      <Card style={{ padding: 20 }}>
        <div className={styles.layout}>
          <div className={styles.pickerColumn}>
            <ProductPicker onPick={pickProduct} placeholder="Найдите товар для этикетки…" />

            {product && (
              <div className={styles.selectedProduct}>
                <div className={styles.productName}>{product.name}</div>
                <div className={[styles.productSku, 'font-data'].join(' ')}>{product.sku}</div>

                {generateMutation.error && (
                  <div className={formStyles.error} style={{ marginTop: 10 }}>
                    {extractErrorMessage(generateMutation.error)}
                  </div>
                )}

                {!isLoadingExisting && !barcode && (
                  <div className={styles.actions}>
                    <Button
                      variant="primary"
                      onClick={() => generateMutation.mutate()}
                      disabled={generateMutation.isPending}
                    >
                      {generateMutation.isPending ? 'Генерируем…' : 'Сгенерировать штрихкод'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.previewColumn}>
            {barcode && (
              <>
                <div className={styles.label}>
                  <span className={styles.labelProductName}>{product?.name}</span>
                  <span className={styles.labelPrice}>{formatMoney(product?.sellingPrice ?? 0)}</span>
                  {labelUrl && <img className={styles.barcodeImage} src={labelUrl} alt={barcode.code} />}
                  <span className={styles.barcodeValue}>{barcode.code}</span>
                </div>
                <div className={styles.actions}>
                  <Button variant="secondary" onClick={() => setPrinting(true)} disabled={!labelUrl}>
                    <PrinterIcon width={16} height={16} />
                    Печать этикетки
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {printing &&
        barcode &&
        createPortal(
          <div className={styles.printOverlay}>
            <div className={styles.label}>
              <span className={styles.labelProductName}>{product?.name}</span>
              <span className={styles.labelPrice}>{formatMoney(product?.sellingPrice ?? 0)}</span>
              {labelUrl && <img className={styles.barcodeImage} src={labelUrl} alt={barcode.code} />}
              <span className={styles.barcodeValue}>{barcode.code}</span>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
