import { useParams } from 'react-router-dom'
import PageBanner from '../components/layout/PageBanner'
import ErrorState from '../components/ui/ErrorState'
import Loader from '../components/ui/Loader'
import { ProductComments } from '../features/comments'
import {
  DealsOfTheWeek,
  ProductGallery,
  ProductOverview,
  ProductTabs,
  useProduct,
  useRelatedProducts,
} from '../features/products'
import { ReviewsPanel } from '../features/reviews'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import NotFound from './NotFound'

export default function ProductDetail() {
  const { slug } = useParams()
  const { data: product, isPending, isError, error, refetch } = useProduct(slug)
  const related = useRelatedProducts(slug)
  useDocumentTitle(product?.name ?? 'Product Details')

  if (error?.isNotFound) return <NotFound />

  return (
    <>
      <PageBanner
        title="Product Details Page"
        crumbs={[{ label: 'Shop', to: '/shop' }, { label: product?.name ?? 'product-details' }]}
      />
      {isPending && <Loader />}
      {isError && (
        <section className="section_gap">
          <ErrorState message="This product could not be loaded." onRetry={refetch} />
        </section>
      )}
      {product && (
        <>
          <div className="product_image_area">
            <div className="container">
              <div className="row s_product_inner">
                <div className="col-lg-6">
                  <ProductGallery key={product.id} images={product.gallery} />
                </div>
                <div className="col-lg-5 offset-lg-1">
                  <ProductOverview key={product.id} product={product} />
                </div>
              </div>
            </div>
          </div>
          <ProductTabs
            key={product.id}
            product={product}
            commentsPanel={<ProductComments productSlug={product.slug} />}
            reviewsPanel={<ReviewsPanel product={product} />}
          />
        </>
      )}
      <DealsOfTheWeek products={related.data} className="section_gap_bottom" />
    </>
  )
}
