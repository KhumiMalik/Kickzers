import PageBanner from '../components/layout/PageBanner'
import { TrackingForm } from '../features/orders'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Tracking() {
  useDocumentTitle('Order Tracking')
  return (
    <>
      <PageBanner title="Order Tracking" crumbs={[{ label: 'Order Tracking', to: '/tracking' }]} />
      <section className="tracking_box_area section_gap">
        <div className="container">
          <div className="tracking_box_inner">
            <p>
              To track your order please enter your Order ID in the box below and press the &quot;Track&quot; button.
              This was given to you on your receipt and in the confirmation email you should have received.
            </p>
            <TrackingForm />
          </div>
        </div>
      </section>
    </>
  )
}
