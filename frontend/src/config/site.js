// Static site configuration: navigation and marketing copy that does not come from the API.

export const navigation = [
  { label: 'Home', to: '/' },
  {
    label: 'Shop',
    children: [
      { label: 'Shop Category', to: '/shop' },
      { label: 'Product Details', to: '/product/zoom-flight-basketball-shoe' },
      { label: 'Product Checkout', to: '/checkout' },
      { label: 'Shopping Cart', to: '/cart' },
      { label: 'Confirmation', to: '/confirmation' },
    ],
  },
  {
    label: 'Blog',
    children: [
      { label: 'Blog', to: '/blog' },
      { label: 'Blog Details', to: '/blog/astronomy-binoculars-a-great-alternative' },
    ],
  },
  {
    label: 'Pages',
    children: [
      { label: 'Login', to: '/login' },
      { label: 'Tracking', to: '/tracking' },
      { label: 'Elements', to: '/elements' },
    ],
  },
  { label: 'Contact', to: '/contact' },
]

export const features = [
  { icon: '/img/features/f-icon1.png', title: 'Free Delivery', text: 'Free Shipping on all order' },
  { icon: '/img/features/f-icon2.png', title: 'Return Policy', text: 'Free Shipping on all order' },
  { icon: '/img/features/f-icon3.png', title: '24/7 Support', text: 'Free Shipping on all order' },
  { icon: '/img/features/f-icon4.png', title: 'Secure Payment', text: 'Free Shipping on all order' },
]

// Home "category" mosaic; each tile opens in the lightbox like the template.
export const categoryTiles = [
  { image: '/img/category/c1.jpg', title: 'Sneaker for Sports' },
  { image: '/img/category/c2.jpg', title: 'Sneaker for Sports' },
  { image: '/img/category/c3.jpg', title: 'Product for Couple' },
  { image: '/img/category/c4.jpg', title: 'Sneaker for Sports' },
  { image: '/img/category/c5.jpg', title: 'Sneaker for Sports' },
]

export const brandLogos = [
  '/img/brand/1.png',
  '/img/brand/2.png',
  '/img/brand/3.png',
  '/img/brand/4.png',
  '/img/brand/5.png',
]

export const sectionIntro =
  'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

export const instagramFeed = [
  '/img/i1.jpg',
  '/img/i2.jpg',
  '/img/i3.jpg',
  '/img/i4.jpg',
  '/img/i5.jpg',
  '/img/i6.jpg',
  '/img/i7.jpg',
  '/img/i8.jpg',
]

export const socialLinks = [
  { icon: 'fa-facebook', href: '#', label: 'Facebook' },
  { icon: 'fa-twitter', href: '#', label: 'Twitter' },
  { icon: 'fa-dribbble', href: '#', label: 'Dribbble' },
  { icon: 'fa-behance', href: '#', label: 'Behance' },
]

export const contactInfo = {
  address: { title: 'California, United States', text: 'Santa monica bullevard' },
  phone: { title: '00 (440) 9865 562', text: 'Mon to Fri 9am to 6 pm' },
  email: { title: 'support@colorlib.com', text: 'Send us your query anytime!' },
  map: { lat: 40.701083, lng: -74.1522848, zoom: 13 },
}
