import ErrorState from '../components/ui/ErrorState'
import Loader from '../components/ui/Loader'
import {
  BrandArea,
  CategoryArea,
  ExclusiveDeal,
  FeaturesArea,
  HeroBanner,
  ProductCarousel,
  useHome,
} from '../features/home'
import { DealsOfTheWeek } from '../features/products'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Home() {
  useDocumentTitle()
  const { data, isPending, isError, refetch } = useHome()

  if (isPending) return <Loader />
  if (isError) {
    return (
      <section className="section_gap">
        <ErrorState message="The home page could not be loaded." onRetry={refetch} />
      </section>
    )
  }

  return (
    <>
      <HeroBanner slides={data.heroSlides} />
      <FeaturesArea />
      <CategoryArea />
      <ProductCarousel
        slides={[
          { title: 'Latest Products', products: data.latest },
          { title: 'Coming Products', products: data.comingSoon },
        ]}
      />
      {data.exclusiveDeal && <ExclusiveDeal deal={data.exclusiveDeal} />}
      <BrandArea />
      <DealsOfTheWeek products={data.dealsOfTheWeek?.products} className="section_gap_bottom" />
    </>
  )
}
