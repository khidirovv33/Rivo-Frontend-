import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TextField } from '@/components';
import { SearchIcon } from '@/components/icons';
import * as productsApi from '@/api/endpoints/products';
import { formatMoney } from '@/lib/format';
import type { ProductDto, ProductVariationDto } from '@/types/domain';
import styles from './ProductSearch.module.css';

interface ProductSearchProps {
  onAdd: (product: ProductDto, variation?: ProductVariationDto) => void;
}

export function ProductSearch({ onAdd }: ProductSearchProps) {
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), 300);
    return () => clearTimeout(timer);
  }, [term]);

  const { data: results } = useQuery({
    queryKey: ['pos-product-search', debounced],
    queryFn: () => productsApi.listProducts({ searchTerm: debounced, pageSize: 8 }),
    enabled: debounced.length > 0,
  });

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function pick(product: ProductDto, variation?: ProductVariationDto) {
    onAdd(product, variation);
    setTerm('');
    setDebounced('');
    setOpen(false);
    setExpandedProductId(null);
  }

  async function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' || !term.trim()) return;
    event.preventDefault();
    try {
      const product = await productsApi.getProductByBarcode(term.trim());
      pick(product);
    } catch {
      // не нашли по штрихкоду — оставляем открытым обычный список результатов
    }
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <TextField
        label="Поиск товара"
        placeholder="Название, SKU или штрихкод — затем Enter для точного поиска по штрихкоду"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {open && debounced && (
        <div className={styles.results}>
          {!results && <div className={styles.empty}>Ищем…</div>}
          {results && results.items.length === 0 && (
            <div className={styles.empty}>
              <SearchIcon width={14} height={14} /> Ничего не найдено
            </div>
          )}
          {results?.items.map((product) => (
            <div key={product.id} className={styles.resultRow}>
              <div
                className={styles.resultMain}
                onClick={() =>
                  product.variations.length > 0
                    ? setExpandedProductId((id) => (id === product.id ? null : product.id))
                    : pick(product)
                }
              >
                <span>
                  <span className={styles.resultName}>{product.name}</span>
                  <br />
                  <span className={[styles.resultMeta, 'font-data'].join(' ')}>{product.sku}</span>
                </span>
                <span className={[styles.resultPrice, 'font-data'].join(' ')}>{formatMoney(product.sellingPrice)}</span>
              </div>
              {expandedProductId === product.id && product.variations.length > 0 && (
                <div className={styles.variations}>
                  {product.variations.map((variation) => (
                    <button
                      key={variation.id}
                      type="button"
                      className={styles.variationChip}
                      onClick={() => pick(product, variation)}
                    >
                      {[variation.size, variation.color].filter(Boolean).join(' / ') || variation.sku}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
