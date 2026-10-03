import { useSearchParams } from 'react-router-dom'
import PageBanner from '../components/layout/PageBanner'
import { OrderConfirmation } from '../features/orders'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Confirmation() {
  useDocumentTitle('Confirmation')
  const [params] = useSearchParams()

  return (
    <>
      <PageBanner title="Confirmation" crumbs={[{ label: 'Confirmation', to: '/confirmation' }]} />
      <section className="order_details section_gap">
        <div className="container">
          <OrderConfirmation number={params.get('order')} />
        </div>
      </section>
    </>
  )
}
