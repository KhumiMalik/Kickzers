import { instagramFeed, socialLinks } from '../../config/site'
import { FooterNewsletter } from '../../features/newsletter'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="footer-area section_gap">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="single-footer-widget">
              <h6>About Us</h6>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore
                dolore magna aliqua.
              </p>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 col-sm-6">
            <div className="single-footer-widget">
              <h6>Newsletter</h6>
              <p>Stay update with our latest</p>
              <FooterNewsletter />
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
