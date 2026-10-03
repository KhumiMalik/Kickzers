import { Link } from 'react-router-dom'
import ErrorState from '../../../components/ui/ErrorState'
import Loader from '../../../components/ui/Loader'
import { cx } from '../../../lib/format'
import { ProductCard } from '../../products'

/**
 * Shop product grid. `query` is the useProducts() result; while a new page or
 * filter loads, the previous results stay visible but dimmed.
 */
export default function ProductGrid({ query }) {
  const { data, isPending, isError, isPlaceholderData, refetch } = query

  return (
    <section className={cx('lattest-product-area pb-40 category-list', isPlaceholderData && 'is-loading')}>
      {isPending && <Loader />}
      {isError && <ErrorState message="Products could not be loaded." onRetry={refetch} />}
      {data?.data.length === 0 && (
        <div className="empty-state">
          <p>No products match your filters.</p>
          <Link to="/shop" className="primary-btn">
            View all products
          </Link>
        </div>
      )}
      <div className="row">
        {data?.data.map((product) => (
          <div key={product.id} className="col-lg-4 col-md-6">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
