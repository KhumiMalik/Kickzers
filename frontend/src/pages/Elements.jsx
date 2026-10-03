import { useState } from 'react'
import NiceSelect from '../components/common/NiceSelect'
import PageBanner from '../components/layout/PageBanner'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useLightbox } from '../hooks/useLightbox'

const variants = ['default', 'primary', 'success', 'info', 'warning', 'danger', 'link']
const label = (v) => v[0].toUpperCase() + v.slice(1)

// Rows of the "Sample Buttons" grid; `disable` is the class of the trailing Disable button (null = none).
const buttonRows = [
  { modifier: '', disable: 'disable', spacing: '' },
  { modifier: '-border', disable: 'disable', spacing: 'mt-10' },
  { modifier: ' radius', disable: 'disable radius', spacing: 'mt-40' },
  { modifier: '-border radius', disable: 'disable radius', spacing: 'mt-10' },
  { modifier: ' circle', disable: 'disable circle', spacing: 'mt-40' },
  { modifier: '-border circle', disable: 'disable circle', spacing: 'mt-10' },
  { modifier: ' circle arrow', disable: null, spacing: 'mt-40', arrow: true },
  { modifier: '-border circle arrow', disable: null, spacing: 'mt-10', arrow: true },
]

const progressRows = [80, 30, 55, 60, 40, 70, 30, 60]
const gallery = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `/img/elements/g${n}.jpg`)
const galleryCols = ['col-md-4', 'col-md-4', 'col-md-4', 'col-md-6', 'col-md-6', 'col-md-4', 'col-md-4', 'col-md-4']

const longText =
  'Recently, the US Federal government banned online casinos from operating in America by making it illegal to transfer money to them through any US bank or payment system. As a result of this law, most of the popular online casino networks such as Party Gaming and PlayTech left the United States. Overnight, online casino players found themselves being chased by the Federal government. But, after a fortnight, the online casino industry came up with a solution and new online casinos started taking root.'
const shortText =
  'Recently, the US Federal government banned online casinos from operating in America by making it illegal to transfer money to them through any US bank or payment system. As a result of this law, most of the popular online casino networks'

const toOptions = (list) => list.map((v) => ({ value: v, label: v }))

function Toggle({ wrapper, id, children, ...input }) {
  return (
    <div className="switch-wrap d-flex justify-content-between">
      <p>{children}</p>
      <div className={wrapper}>
        <input type="checkbox" id={id} {...input} />
        <label htmlFor={id}></label>
      </div>
    </div>
  )
}

export default function Elements() {
  useDocumentTitle('Elements')
  const lightbox = useLightbox(gallery)
  const [city, setCity] = useState('City')
  const [country, setCountry] = useState('Country')
  const [language, setLanguage] = useState('English')

  return (
    <>
      <PageBanner title="Element Page" crumbs={[{ label: 'Element', to: '/elements' }]} />

      <section className="sample-text-area">
        <div className="container">
          <h3 className="text-heading">Text Sample</h3>
          <p className="sample-text">
            Every avid independent filmmaker has <b>Bold</b> about making that <i>Italic</i> interest documentary, or short film to show off
            their creative prowess. Many have great ideas and want to “wow” the<sup>Superscript</sup> scene, or video renters with their big
            project. But once you have the<sub>Subscript</sub> “in the can” (no easy feat), how do you move from a <del>Strike</del> through
            of master DVDs with the <u>“Underline”</u> marked hand-written title inside a secondhand CD case, to a pile of cardboard boxes full
            of shiny new, retail-ready DVDs, with UPC barcodes and polywrap sitting on your doorstep? You need to create eye-popping artwork
            and have your project replicated. Using a reputable full service DVD Replication company like PacificDisc, Inc. to partner with is
            certainly a helpful option to ensure a professional end result, but to help with your DVD replication project, here are 4 easy
            steps to follow for good DVD replication results:
          </p>
        </div>
      </section>

      <section className="button-area">
        <div className="container border-top-generic">
          <h3 className="text-heading">Sample Buttons</h3>
          {buttonRows.map(({ modifier, disable, spacing, arrow }, row) => (
            <div key={row} className={`button-group-area ${spacing}`}>
              {variants
                .filter((v) => !(arrow && v === 'link'))
                .map((v) => (
                  <a key={v} href="#button" className={`genric-btn ${v}${modifier}`} onClick={(e) => e.preventDefault()}>
                    {label(v)}
                    {arrow && <span className="lnr lnr-arrow-right"></span>}
                  </a>
                ))}
              {disable && (
                <a href="#button" className={`genric-btn ${disable}`} onClick={(e) => e.preventDefault()}>
                  Disable
                </a>
              )}
            </div>
          ))}
          <div className="button-group-area mt-40">
            <a href="#button" className="genric-btn primary e-large">Extra Large</a>
            <a href="#button" className="genric-btn success large">Large</a>
            <a href="#button" className="genric-btn primary">Default</a>
            <a href="#button" className="genric-btn success medium">Medium</a>
            <a href="#button" className="genric-btn primary small">Small</a>
          </div>
          <div className="button-group-area mt-10">
            <a href="#button" className="genric-btn primary-border e-large">Extra Large</a>
            <a href="#button" className="genric-btn success-border large">Large</a>
            <a href="#button" className="genric-btn primary-border">Default</a>
            <a href="#button" className="genric-btn success-border medium">Medium</a>
            <a href="#button" className="genric-btn primary-border small">Small</a>
          </div>
        </div>
      </section>

      <div className="whole-wrap pb-100">
        <div className="container">
          <div className="section-top-border">
            <h3 className="mb-30">Left Aligned</h3>
            <div className="row">
              <div className="col-md-3">
                <img src="/img/elements/d.jpg" alt="" className="img-fluid" />
              </div>
              <div className="col-md-9 mt-sm-20">
                <p>{longText}</p>
              </div>
            </div>
          </div>
          <div className="section-top-border text-right">
            <h3 className="mb-30">Right Aligned</h3>
            <div className="row">
              <div className="col-md-9">
                <p className="text-right">
                  Over time, even the most sophisticated, memory packed computer can begin to run slow if we don’t do something to prevent it.
                  The reason why has less to do with how computers are made and how they age and more to do with the way we use them.
                </p>
                <p className="text-right">Before we discuss all of the things that could be affecting your PC’s performance, let’s talk a little about what symptoms</p>
              </div>
              <div className="col-md-3">
                <img src="/img/elements/d.jpg" alt="" className="img-fluid" />
              </div>
            </div>
          </div>
          <div className="section-top-border">
            <h3 className="mb-30">Definition</h3>
            <div className="row">
              {['01', '02', '03'].map((n) => (
                <div key={n} className="col-md-4">
                  <div className="single-defination">
                    <h4 className="mb-20">Definition {n}</h4>
                    <p>{shortText}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="section-top-border">
            <h3 className="mb-30">Block Quotes</h3>
            <div className="row">
              <div className="col-lg-12">
                <blockquote className="generic-blockquote">“{longText}”</blockquote>
              </div>
            </div>
          </div>
          <div className="section-top-border">
            <h3 className="mb-30">Table</h3>
            <div className="progress-table-wrap">
              <div className="progress-table">
                <div className="table-head">
                  <div className="serial">#</div>
                  <div className="country">Countries</div>
                  <div className="visit">Visits</div>
                  <div className="percentage">Percentages</div>
                </div>
                {progressRows.map((pct, i) => (
                  <div key={i} className="table-row">
                    <div className="serial">{String(i + 1).padStart(2, '0')}</div>
                    <div className="country">
                      <img src={`/img/elements/f${i + 1}.jpg`} alt="flag" />
                      Canada
                    </div>
                    <div className="visit">645032</div>
                    <div className="percentage">
                      <div className="progress">
                        <div className={`progress-bar color-${i + 1}`} role="progressbar" style={{ width: `${pct}%` }} aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="section-top-border">
            <h3>Image Gallery</h3>
            <div className="row gallery-item">
              {gallery.map((src, i) => (
                <div key={src} className={galleryCols[i]}>
                  <a href={src} className="img-pop-up" onClick={lightbox.openAt(i)}>
                    <div className="single-gallery-image" style={{ background: `url(${src})` }}></div>
                  </a>
                </div>
              ))}
            </div>
            {lightbox.element}
          </div>
          <div className="section-top-border">
            <div className="row">
              <div className="col-md-4">
                <h3 className="mb-20">Image Gallery</h3>
                <div className="typography">
                  <h1>This is header 01</h1>
                  <h2>This is header 02</h2>
                  <h3>This is header 03</h3>
                  <h4>This is header 04</h4>
                  <h5>This is header 01</h5>
                  <h6>This is header 01</h6>
                </div>
              </div>
              <div className="col-md-4 mt-sm-30">
                <h3 className="mb-20">Unordered List</h3>
                <ul className="unordered-list">
                  <li>Fta Keys</li>
                  <li>For Women Only Your Computer Usage</li>
                  <li>
                    Facts Why Inkjet Printing Is Very Appealing
                    <ul>
                      <li>
                        Addiction When Gambling Becomes
                        <ul>
                          <li>Protective Preventative Maintenance</li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li>Dealing With Technical Support 10 Useful Tips</li>
                  <li>Make Myspace Your Best Designed Space</li>
                  <li>Cleaning And Organizing Your Computer</li>
                </ul>
              </div>
              <div className="col-md-4 mt-sm-30">
                <h3 className="mb-20">Ordered List</h3>
                <ol className="ordered-list">
                  <li><span>Fta Keys</span></li>
                  <li><span>For Women Only Your Computer Usage</span></li>
                  <li>
                    <span>Facts Why Inkjet Printing Is Very Appealing</span>
                    <ol className="ordered-list-alpha">
                      <li>
                        <span>Addiction When Gambling Becomes</span>
                        <ol className="ordered-list-roman">
                          <li><span>Protective Preventative Maintenance</span></li>
                        </ol>
                      </li>
                    </ol>
                  </li>
                  <li><span>Dealing With Technical Support 10 Useful Tips</span></li>
                  <li><span>Make Myspace Your Best Designed Space</span></li>
                  <li><span>Cleaning And Organizing Your Computer</span></li>
                </ol>
              </div>
            </div>
          </div>
          <div className="section-top-border">
            <div className="row">
              <div className="col-lg-8 col-md-8">
                <h3 className="mb-30">Form Element</h3>
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="mt-10">
                    <input type="text" name="first_name" placeholder="First Name" required className="single-input" />
                  </div>
                  <div className="mt-10">
                    <input type="text" name="last_name" placeholder="Last Name" required className="single-input" />
                  </div>
                  <div className="mt-10">
                    <input type="text" name="last_name_2" placeholder="Last Name" required className="single-input" />
                  </div>
                  <div className="mt-10">
                    <input type="email" name="EMAIL" placeholder="Email address" required className="single-input" />
                  </div>
                  <div className="input-group-icon mt-10">
                    <div className="icon"><i className="fa fa-thumb-tack" aria-hidden="true"></i></div>
                    <input type="text" name="address" placeholder="Address" required className="single-input" />
                  </div>
                  <div className="input-group-icon mt-10">
                    <div className="icon"><i className="fa fa-plane" aria-hidden="true"></i></div>
                    <div className="form-select">
                      <NiceSelect value={city} onChange={setCity} options={toOptions(['City', 'Dhaka', 'Dilli', 'Newyork', 'Islamabad'])} />
                    </div>
                  </div>
                  <div className="input-group-icon mt-10">
                    <div className="icon"><i className="fa fa-globe" aria-hidden="true"></i></div>
                    <div className="form-select">
                      <NiceSelect value={country} onChange={setCountry} options={toOptions(['Country', 'Bangladesh', 'India', 'England', 'Srilanka'])} />
                    </div>
                  </div>
                  <div className="mt-10">
                    <textarea className="single-textarea" placeholder="Message" required></textarea>
                  </div>
                  <div className="mt-10">
                    <input type="text" placeholder="Primary color" className="single-input-primary" />
                  </div>
                  <div className="mt-10">
                    <input type="text" placeholder="Accent color" className="single-input-accent" />
                  </div>
                  <div className="mt-10">
                    <input type="text" placeholder="Secondary color" className="single-input-secondary" />
                  </div>
                </form>
              </div>
              <div className="col-lg-3 col-md-4 mt-sm-30">
                <div className="single-element-widget">
                  <h3 className="mb-30">Switches</h3>
                  <Toggle wrapper="primary-switch" id="default-switch">01. Sample Switch</Toggle>
                  <Toggle wrapper="primary-switch" id="primary-switch" defaultChecked>02. Primary Color Switch</Toggle>
                  <Toggle wrapper="confirm-switch" id="confirm-switch" defaultChecked>03. Confirm Color Switch</Toggle>
                </div>
                <div className="single-element-widget mt-30">
                  <h3 className="mb-30">Selectboxes</h3>
                  <div className="default-select">
                    <NiceSelect value={language} onChange={setLanguage} options={toOptions(['English', 'Spanish', 'Arabic', 'Portuguise', 'Bengali'])} />
                  </div>
                </div>
                <div className="single-element-widget mt-30">
                  <h3 className="mb-30">Checkboxes</h3>
                  <Toggle wrapper="primary-checkbox" id="default-checkbox">01. Sample Checkbox</Toggle>
                  <Toggle wrapper="primary-checkbox" id="primary-checkbox" defaultChecked>02. Primary Color Checkbox</Toggle>
                  <Toggle wrapper="confirm-checkbox" id="confirm-checkbox">03. Confirm Color Checkbox</Toggle>
                  <Toggle wrapper="disabled-checkbox" id="disabled-checkbox" disabled>04. Disabled Checkbox</Toggle>
                  <Toggle wrapper="disabled-checkbox" id="disabled-checkbox-active" defaultChecked disabled>05. Disabled Checkbox active</Toggle>
                </div>
                <div className="single-element-widget mt-30">
                  <h3 className="mb-30">Radios</h3>
                  <Toggle wrapper="primary-radio" id="default-radio">01. Sample radio</Toggle>
                  <Toggle wrapper="primary-radio" id="primary-radio" defaultChecked>02. Primary Color radio</Toggle>
                  <Toggle wrapper="confirm-radio" id="confirm-radio" defaultChecked>03. Confirm Color radio</Toggle>
                  <Toggle wrapper="disabled-radio" id="disabled-radio" disabled>04. Disabled radio</Toggle>
                  <Toggle wrapper="disabled-radio" id="disabled-radio-active" defaultChecked disabled>05. Disabled radio active</Toggle>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
