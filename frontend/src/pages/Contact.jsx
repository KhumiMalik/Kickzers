import PageBanner from '../components/layout/PageBanner'
import { ContactForm, ContactInfo, StoreMap } from '../features/contact'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Contact() {
  useDocumentTitle('Contact Us')
  return (
    <>
      <PageBanner title="Contact Us" crumbs={[{ label: 'Contact', to: '/contact' }]} />
      <section className="contact_area section_gap_bottom">
        <div className="container">
          <StoreMap />
          <div className="row">
            <div className="col-lg-3">
              <ContactInfo />
            </div>
            <div className="col-lg-9">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
