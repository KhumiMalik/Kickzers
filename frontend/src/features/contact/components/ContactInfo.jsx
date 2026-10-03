import { contactInfo } from '../../../config/site'

export default function ContactInfo() {
  return (
    <div className="contact_info">
      <div className="info_item">
        <i className="lnr lnr-home" aria-hidden="true"></i>
        <h6>{contactInfo.address.title}</h6>
        <p>{contactInfo.address.text}</p>
      </div>
      <div className="info_item">
        <i className="lnr lnr-phone-handset" aria-hidden="true"></i>
        <h6>
          <a href={`tel:${contactInfo.phone.title.replace(/[^\d+]/g, '')}`}>{contactInfo.phone.title}</a>
        </h6>
        <p>{contactInfo.phone.text}</p>
      </div>
      <div className="info_item">
        <i className="lnr lnr-envelope" aria-hidden="true"></i>
        <h6>
          <a href={`mailto:${contactInfo.email.title}`}>{contactInfo.email.title}</a>
        </h6>
        <p>{contactInfo.email.text}</p>
      </div>
    </div>
  )
}
