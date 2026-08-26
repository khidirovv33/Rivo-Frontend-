import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Select, TextField } from '@/components';
import { financeEntrySchema, type FinanceEntryFormInput, type FinanceEntryFormValues } from '@/lib/validation/finance';
import { FinanceEntryKind, type AccountDto } from '@/types/mocks';
import { EXPENSE_CATEGORIES, FINANCE_ENTRY_KIND_LABEL, INCOME_CATEGORIES } from './labels';
import styles from '../_shared/CrudForm.module.css';

interface FinanceEntryFormProps {
  accounts: AccountDto[];
  defaultKind: FinanceEntryKind;
  onSubmit: (values: FinanceEntryFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function FinanceEntryForm({ accounts, defaultKind, onSubmit, onCancel, isSaving }: FinanceEntryFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FinanceEntryFormInput, unknown, FinanceEntryFormValues>({
    resolver: zodResolver(financeEntrySchema),
    defaultValues: {
      kind: defaultKind,
      date: new Date().toISOString().slice(0, 10),
      amount: 0,
      category: '',
      accountId: accounts[0]?.id ?? '',
      description: '',
    },
  });

  const kind = Number(watch('kind'));
  const categories = kind === FinanceEntryKind.Income ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Select label="Тип операции" {...register('kind')}>
        {Object.entries(FINANCE_ENTRY_KIND_LABEL).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <TextField label="Дата" type="date" error={errors.date?.message} {...register('date')} />
      <TextField label="Сумма" type="number" step="0.01" error={errors.amount?.message} {...register('amount')} />
      <Select label="Категория" error={errors.category?.message} {...register('category')}>
        <option value="">Выберите категорию</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>
      <Select label="Счёт" error={errors.accountId?.message} {...register('accountId')}>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </Select>
      <TextField label="Описание (необязательно)" error={errors.description?.message} {...register('description')} />
      <div className={styles.formActions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Сохраняем…' : 'Добавить'}
        </Button>
      </div>
    </form>
  );
}
