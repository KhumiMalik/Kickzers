import { useSearchParams } from 'react-router-dom'
import PageBanner from '../components/layout/PageBanner'
import {
  CategorySidebar,
  FilterBar,
  ProductFilters,
  ProductGrid,
  pageHref,
  parseShopParams,
  toProductQuery,
  useCatalogFilters,
  useProducts,
  withFilters,
} from '../features/catalog'
import { DealsOfTheWeek, useDealsOfTheWeek } from '../features/products'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

/** Shop / category page. All filter state lives in the URL query string. */
export default function Shop() {
  useDocumentTitle('Shop')
  const [params, setParams] = useSearchParams()
  const filters = parseShopParams(params)

  const facets = useCatalogFilters()
  const products = useProducts(toProductQuery(filters))
  const deals = useDealsOfTheWeek()

  const update = (patch) => setParams(withFilters(params, patch))
  const hrefFor = (page) => pageHref(params, page)
  const resetFilters = () => update({ brand: null, color: null, min: null, max: null })

  const categoryName = facets.data?.categories
    .flatMap((category) => [category, ...category.children])
    .find((category) => category.slug === filters.category)?.name

  return (
    // The template sets <body id="category">; the theme uses it for the banner spacing.
    <div id="category">
      <PageBanner
        title="Shop Category page"
        crumbs={[{ label: 'Shop', to: '/shop' }, { label: categoryName ?? 'All Products' }]}
      />
      <div className="container">
        <div className="row">
          <div className="col-xl-3 col-lg-4 col-md-5">
            {facets.data && (
              <>
                <CategorySidebar
                  categories={facets.data.categories}
                  active={filters.category}
                  onSelect={(category) => update({ category })}
                />
                <ProductFilters filters={facets.data} values={filters} onChange={update} onReset={resetFilters} />
              </>
            )}
          </div>
          <div className="col-xl-9 col-lg-8 col-md-7">
            <FilterBar
              sort={filters.sort}
              perPage={filters.perPage}
              onChange={update}
              meta={products.data?.meta}
              hrefFor={hrefFor}
            />
            {filters.q && (
              <div className="search-summary">
                Showing results for “<strong>{filters.q}</strong>”
                <button type="button" onClick={() => update({ q: null })}>
                  Clear search
                </button>
              </div>
            )}
            <ProductGrid query={products} />
            <FilterBar
              withSort={false}
              sort={filters.sort}
              perPage={filters.perPage}
              onChange={update}
              meta={products.data?.meta}
              hrefFor={hrefFor}
            />
          </div>
        </div>
      </div>
      <DealsOfTheWeek products={deals.data?.products} />
    </div>
  )
}
