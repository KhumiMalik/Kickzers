import { useState } from 'react'
import { sendContactMessage } from '../api/site'
import { TextField } from '../components/common/FormControls'
import Modal from '../components/common/Modal'
import PageBanner from '../components/layout/PageBanner'
import { contactInfo } from '../data/site'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useForm } from '../hooks/useForm'
import { email, required } from '../utils/validation'

const { lat, lng, zoom } = contactInfo.map
// Keyless embed instead of the template's gmaps.js + hard-coded API key.
const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`

function MessageModal({ status, onClose }) {
  const ok = status === 'success'
  return (
    <Modal className="modal-message" onClose={onClose}>
      <div className="modal-content">
        <div className="modal-header">
          <button type="button" className="close" aria-label="Close" onClick={onClose}>
            <i className="fa fa-close"></i>
          </button>
          <h2>{ok ? 'Thank you' : 'Sorry !'}</h2>
          <p>{ok ? 'Your message is successfully sent...' : 'Something went wrong'}</p>
        </div>
      </div>
    </Modal>
  )
}

export default function Contact() {
  useDocumentTitle('Contact Us')
  const [status, setStatus] = useState(null)
  const form = useForm(
    { name: '', email: '', subject: '', message: '' },
    { name: [required('Name')], email: [required('Email'), email()], subject: [required('Subject')], message: [required('Message')] },
  )

  const onSubmit = form.submit(async (values) => {
    try {
      await sendContactMessage(values)
      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    }
  })

  return (
    <>
      <PageBanner title="Contact Us" crumbs={[{ label: 'Contact', to: '/contact' }]} />
      <section className="contact_area section_gap_bottom">
        <div className="container">
          <div className="mapBox">
            <iframe title="Store location" src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          </div>
          <div className="row">
            <div className="col-lg-3">
              <div className="contact_info">
                <div className="info_item">
                  <i className="lnr lnr-home"></i>
                  <h6>{contactInfo.address.title}</h6>
                  <p>{contactInfo.address.text}</p>
                </div>
                <div className="info_item">
                  <i className="lnr lnr-phone-handset"></i>
                  <h6>
                    <a href={`tel:${contactInfo.phone.title.replace(/[^\d+]/g, '')}`}>{contactInfo.phone.title}</a>
                  </h6>
                  <p>{contactInfo.phone.text}</p>
                </div>
                <div className="info_item">
                  <i className="lnr lnr-envelope"></i>
                  <h6>
                    <a href={`mailto:${contactInfo.email.title}`}>{contactInfo.email.title}</a>
                  </h6>
                  <p>{contactInfo.email.text}</p>
                </div>
              </div>
            </div>
            <div className="col-lg-9">
              <form className="row contact_form" noValidate onSubmit={onSubmit}>
                <div className="col-md-6">
                  <TextField type="text" placeholder="Enter your name" error={form.errors.name} {...form.field('name')} />
                  <TextField type="email" placeholder="Enter email address" error={form.errors.email} {...form.field('email')} />
                  <TextField type="text" placeholder="Enter Subject" error={form.errors.subject} {...form.field('subject')} />
                </div>
                <div className="col-md-6">
                  <TextField as="textarea" rows="1" placeholder="Enter Message" error={form.errors.message} {...form.field('message')} />
                </div>
                <div className="col-md-12 text-right">
                  <button type="submit" className="primary-btn" disabled={form.submitting}>
                    {form.submitting ? 'Sending…' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      {status && <MessageModal status={status} onClose={() => setStatus(null)} />}
    </>
  )
}
