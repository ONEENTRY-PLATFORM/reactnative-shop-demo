import type {IFilterParams} from 'oneentry/dist/products/productsInterfaces';

const getSearchParams = (searchParams?: {
  search?: string;
  filters?: IFilterParams[];
  available?: boolean;
}) => {
  const expandedFilters:
    (IFilterParams & {statusMarker?: string})[] | undefined = [];

  // Keep only products that have a SKU: service products (e.g. Delivery) have none.
  // `sku nin null` stopped matching anything on the platform (every catalog came
  // back empty); `exs` (exists) expresses the same intent and is checked live.
  const servicesFilter: IFilterParams = {
    attributeMarker: 'sku',
    conditionMarker: 'exs',
    title: searchParams?.search || '',
    isNested: true,
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
