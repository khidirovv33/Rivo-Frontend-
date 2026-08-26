import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, PageHeader } from '@/components';
import { PrinterIcon } from '@/components/icons';
import * as barcodesApi from '@/api/endpoints/barcodes';
import { extractErrorMessage } from '@/api/client';
import { formatMoney } from '@/lib/format';
import { ProductPicker } from '../_shared/ProductPicker';
import type { ProductDto } from '@/types/domain';
import styles from './BarcodesPage.module.css';
import formStyles from '../_shared/CrudForm.module.css';

export function BarcodesPage() {
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);

  const generateMutation = useMutation({
    mutationFn: () => barcodesApi.generateBarcode({ productId: product!.id }),
    onSuccess: (result) => setBarcode(result.barcode),
  });

  function pickProduct(p: ProductDto) {
    setProduct(p);
    setBarcode(p.barcode);
  }

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

                {!barcode && (
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
                  <img className={styles.barcodeImage} src={barcodesApi.barcodeImageUrl(barcode)} alt={barcode} />
                  <span className={styles.barcodeValue}>{barcode}</span>
                </div>
                <div className={styles.actions}>
                  <Button variant="secondary" onClick={() => setPrinting(true)}>
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
        createPortal(
          <div className={styles.printOverlay}>
            <div className={styles.label}>
              <span className={styles.labelProductName}>{product?.name}</span>
              <span className={styles.labelPrice}>{formatMoney(product?.sellingPrice ?? 0)}</span>
              {barcode && <img className={styles.barcodeImage} src={barcodesApi.barcodeImageUrl(barcode)} alt={barcode} />}
              <span className={styles.barcodeValue}>{barcode}</span>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
