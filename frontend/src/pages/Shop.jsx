import { Link, useSearchParams } from 'react-router-dom'
import { getProducts, getShopFilters } from '../api/products'
import Loader from '../components/common/Loader'
import PageBanner from '../components/layout/PageBanner'
import CategorySidebar from '../components/product/CategorySidebar'
import DealsOfTheWeek from '../components/product/DealsOfTheWeek'
import FilterBar from '../components/product/FilterBar'
import ProductCard from '../components/product/ProductCard'
import ProductFilters from '../components/product/ProductFilters'
import { useAsync } from '../hooks/useAsync'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { cx } from '../utils/format'

const toNumber = (v) => (v == null || v === '' ? null : Number(v))

/** Shop / category page. All filter state lives in the URL query string. */
export default function Shop() {
  useDocumentTitle('Shop')
  const [params, setParams] = useSearchParams()

  const query = {
    category: params.get('category'),
    brand: params.get('brand'),
    color: params.get('color'),
    q: params.get('q'),
    min: toNumber(params.get('min')),
    max: toNumber(params.get('max')),
    sort: params.get('sort') ?? 'default',
    perPage: toNumber(params.get('perPage')) ?? 12,
    page: toNumber(params.get('page')) ?? 1,
  }

  const filters = useAsync(getShopFilters, [])
  const deals = useAsync(() => getProducts({ flag: 'deal', perPage: 9 }), [])
  const result = useAsync(
    () => getProducts({ ...query, minPrice: query.min, maxPrice: query.max }),
    [params.toString()],
  )

  // Any filter change resets to page 1.
  const update = (patch) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([key, value]) => (value == null || value === '' ? next.delete(key) : next.set(key, value)))
    if (!('page' in patch)) next.delete('page')
    setParams(next)
  }

  const hrefFor = (page) => {
    const next = new URLSearchParams(params)
    if (page > 1) next.set('page', page)
    else next.delete('page')
    return `?${next}`
  }

  const resetFilters = () => update({ brand: null, color: null, min: null, max: null })

  const categoryName = filters.data?.categories
    .flatMap((c) => [c, ...c.children])
    .find((c) => c.slug === query.category)?.name

  return (
    // The template sets <body id="category">; the theme uses it for the banner spacing.
    <div id="category">
      <PageBanner title="Shop Category page" crumbs={[{ label: 'Shop', to: '/shop' }, { label: categoryName ?? 'All Products' }]} />
      <div className="container">
        <div className="row">
          <div className="col-xl-3 col-lg-4 col-md-5">
            {filters.data && (
              <>
                <CategorySidebar categories={filters.data.categories} active={query.category} onSelect={(category) => update({ category })} />
                <ProductFilters filters={filters.data} values={query} onChange={update} onReset={resetFilters} />
              </>
            )}
          </div>
          <div className="col-xl-9 col-lg-8 col-md-7">
            <FilterBar sort={query.sort} perPage={query.perPage} onChange={update} meta={result.data?.meta} hrefFor={hrefFor} />

            {query.q && (
              <div className="search-summary">
                Showing results for “<strong>{query.q}</strong>”
                <button type="button" onClick={() => update({ q: null })}>
                  Clear search
                </button>
              </div>
            )}

            <section className={cx('lattest-product-area pb-40 category-list', result.loading && 'is-loading')}>
              {!result.data && <Loader />}
              {result.data?.data.length === 0 && (
                <div className="empty-state">
                  <p>No products match your filters.</p>
                  <Link to="/shop" className="primary-btn">
                    View all products
                  </Link>
                </div>
              )}
              <div className="row">
                {result.data?.data.map((product) => (
                  <div key={product.id} className="col-lg-4 col-md-6">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </section>

            <FilterBar withSort={false} sort={query.sort} perPage={query.perPage} onChange={update} meta={result.data?.meta} hrefFor={hrefFor} />
          </div>
        </div>
      </div>
      <DealsOfTheWeek products={deals.data?.data} />
    </div>
  )
}
