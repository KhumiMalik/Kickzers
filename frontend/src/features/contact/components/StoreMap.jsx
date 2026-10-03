import { contactInfo } from '../../../config/site'

const { lat, lng, zoom } = contactInfo.map
// Keyless embed instead of the template's gmaps.js + hard-coded API key.
const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`

export default function StoreMap() {
  return (
    <div className="mapBox">
      <iframe title="Store location" src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
    </div>
  )
}
