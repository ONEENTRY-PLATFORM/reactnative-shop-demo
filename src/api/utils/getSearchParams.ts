import type {IFilterParams} from 'oneentry/dist/products/productsInterfaces';

const getSearchParams = (searchParams?: {
  search?: string;
  filters?: IFilterParams[];
  available?: boolean;
}) => {
  const expandedFilters:
    | (IFilterParams & {statusMarker?: string})[]
    | undefined = [];

  // Keep real products (they have no sku) and exclude service products (which do have sku).
  // Reference: nextjs-shop/app/api/utils/getSearchParams.ts
  const servicesFilter = {
    attributeMarker: 'sku',
    conditionMarker: 'in',
    conditionValue: null,
    title: searchParams?.search || '',
    isNested: false,
  };
  expandedFilters.push(servicesFilter as any);

  // In-stock filter matches Next.js: units_product > 0 AND statusMarker 'in_stock'.
  if (searchParams?.available) {
    expandedFilters.push({
      statusMarker: 'in_stock',
      attributeMarker: 'units_product',
      conditionMarker: 'mth',
      conditionValue: 0,
      title: searchParams?.search || '',
      isNested: false,
    } as any);
  }

  if (searchParams?.filters?.length) {
    return expandedFilters?.concat(searchParams?.filters);
  } else {
    return expandedFilters;
  }
};

export default getSearchParams;
