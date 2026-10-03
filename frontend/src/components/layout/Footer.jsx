import { useState } from 'react'
import { subscribeNewsletter } from '../../api/site'
import { instagramFeed, socialLinks } from '../../data/site'
import { useForm } from '../../hooks/useForm'
import { email, required } from '../../utils/validation'

const year = new Date().getFullYear()

export default function Footer() {
  const [message, setMessage] = useState(null)
  const form = useForm({ email: '' }, { email: [required('Email'), email()] })

  const onSubscribe = form.submit(async ({ email: address }) => {
    const res = await subscribeNewsletter(address)
    setMessage(res.message)
    form.reset()
  })

  return (
    <footer className="footer-area section_gap">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="single-footer-widget">
              <h6>About Us</h6>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore dolore magna
                aliqua.
              </p>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 col-sm-6">
            <div className="single-footer-widget">
              <h6>Newsletter</h6>
              <p>Stay update with our latest</p>
              <div id="mc_embed_signup">
                <form noValidate className="form-inline" onSubmit={onSubscribe}>
                  <div className="d-flex flex-row">
                    <input
                      className="form-control"
                      type="email"
                      placeholder="Enter Email"
                      aria-label="Email address"
                      {...form.field('email')}
                    />
                    <button className="click-btn btn btn-default" disabled={form.submitting} aria-label="Subscribe">
                      <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
                    </button>
                  </div>
                  <div className="info">{form.errors.email ?? form.errors.form ?? message}</div>
                </form>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="single-footer-widget mail-chimp">
              <h6 className="mb-20">Instragram Feed</h6>
              <ul className="instafeed d-flex flex-wrap">
                {instagramFeed.map((src) => (
                  <li key={src}>
                    <img src={src} alt="" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 col-sm-6">
            <div className="single-footer-widget">
              <h6>Follow Us</h6>
              <p>Let us be social</p>
              <div className="footer-social d-flex align-items-center">
                {socialLinks.map((s) => (
                  <a key={s.icon} href={s.href} aria-label={s.label}>
                    <i className={`fa ${s.icon}`}></i>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom d-flex justify-content-center align-items-center flex-wrap">
          {/* Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. */}
          <p className="footer-text m-0">
            Copyright &copy;{year} All rights reserved | This template is made with{' '}
            <i className="fa fa-heart-o" aria-hidden="true"></i> by{' '}
            <a href="https://colorlib.com" target="_blank" rel="noreferrer">
              Colorlib
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
