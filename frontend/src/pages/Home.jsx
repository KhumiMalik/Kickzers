import { getHomeData } from '../api/products'
import Loader from '../components/common/Loader'
import BrandArea from '../components/home/BrandArea'
import CategoryArea from '../components/home/CategoryArea'
import ExclusiveDeal from '../components/home/ExclusiveDeal'
import FeaturesArea from '../components/home/FeaturesArea'
import HeroBanner from '../components/home/HeroBanner'
import ProductCarousel from '../components/home/ProductCarousel'
import DealsOfTheWeek from '../components/product/DealsOfTheWeek'
import { useAsync } from '../hooks/useAsync'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Home() {
  useDocumentTitle()
  const { data } = useAsync(getHomeData, [])

  if (!data) return <Loader />

  return (
    <>
      <HeroBanner slides={data.heroSlides} />
      <FeaturesArea />
      <CategoryArea />
      <ProductCarousel
        slides={[
          { title: 'Latest Products', products: data.latest },
          { title: 'Coming Products', products: data.coming },
        ]}
      />
      <ExclusiveDeal products={data.exclusive} />
      <BrandArea />
      <DealsOfTheWeek products={data.deals} className="section_gap_bottom" />
    </>
  )
}
