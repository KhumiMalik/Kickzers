import { features } from '../../../config/site'

export default function FeaturesArea() {
  return (
    <section className="features-area section_gap">
      <div className="container">
        <div className="row features-inner">
          {features.map((f) => (
            <div key={f.title} className="col-lg-3 col-md-6 col-sm-6">
              <div className="single-features">
                <div className="f-icon">
                  <img src={f.icon} alt="" />
                </div>
                <h6>{f.title}</h6>
                <p>{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
