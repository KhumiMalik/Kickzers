// Seed data for the mock server (Phase 3–10 only; replaced by the Laravel seeders).
// Shapes follow the planned database tables; amounts are integers in cents.

export const categories = [
  { slug: 'men-shoes', name: "Men's Shoes", parent: null },
  { slug: 'running', name: 'Running', parent: 'men-shoes' },
  { slug: 'sneakers', name: 'Sneakers', parent: 'men-shoes' },
  { slug: 'casual', name: 'Casual', parent: 'men-shoes' },
  { slug: 'basketball', name: 'Basketball', parent: 'men-shoes' },
  { slug: 'women-shoes', name: "Women's Shoes", parent: null },
  { slug: 'women-sneakers', name: 'Sneakers', parent: 'women-shoes' },
  { slug: 'canvas', name: 'Canvas', parent: 'women-shoes' },
  { slug: 'men-clothing', name: "Men's Clothing", parent: null },
  { slug: 'sweatshirts', name: 'Sweatshirts', parent: 'men-clothing' },
  { slug: 'jerseys', name: 'Jerseys', parent: 'men-clothing' },
  { slug: 'training-tops', name: 'Training Tops', parent: 'men-clothing' },
  { slug: 'women-clothing', name: "Women's Clothing", parent: null },
  { slug: 'dresses', name: 'Dresses', parent: 'women-clothing' },
  { slug: 'shirts', name: 'Shirts', parent: 'women-clothing' },
  { slug: 'accessories', name: 'Accessories', parent: null },
]

export const brands = [
  { slug: 'adidas', name: 'Adidas' },
  { slug: 'nike', name: 'Nike' },
  { slug: 'puma', name: 'Puma' },
  { slug: 'new-balance', name: 'New Balance' },
  { slug: 'asics', name: 'Asics' },
  { slug: 'converse', name: 'Converse' },
  { slug: 'karma', name: 'Karma Basics' },
]

export const colors = [
  { slug: 'black', name: 'Black' },
  { slug: 'grey', name: 'Grey' },
  { slug: 'spacegrey', name: 'Spacegrey' },
  { slug: 'gold', name: 'Gold' },
  { slug: 'red', name: 'Red' },
  { slug: 'orange', name: 'Orange' },
  { slug: 'blue', name: 'Blue' },
  { slug: 'pink', name: 'Pink' },
]

const shoeSpecs = [
  ['Upper', 'Engineered mesh'],
  ['Outsole', 'Rubber'],
  ['Closure', 'Lace-up'],
  ['Weight', '290gm'],
  ['Quality checking', 'yes'],
  ['Each Box contains', '1 pair'],
]

const apparelSpecs = [
  ['Material', '100% Cotton'],
  ['Fit', 'Regular'],
  ['Care', 'Machine wash cold'],
  ['Weight', '220gm'],
  ['Quality checking', 'yes'],
  ['Each Box contains', '1pc'],
]

const description = [
  'Beryl Cook is one of Britain’s most talented and amusing artists. Beryl’s pictures feature women of all shapes and sizes enjoying themselves. Born between the two world wars, Beryl Cook eventually left Kendrick School in Reading at the age of 15, where she went to secretarial school and then into an insurance office.',
  'It is often frustrating to attempt to plan meals that are designed for one. Despite this fact, we are seeing more and more recipe books and Internet websites that are dedicated to the act of cooking for one. Divorce and the death of spouses or grown children leaving for college are all reasons that someone accustomed to cooking for more than one would suddenly need to learn how to adjust.',
]

const shortDescription =
  'Built for everyday comfort with modern materials and a clean silhouette. If you are looking for something that makes your outfit look awesome and feels great all day long, this is it.'

const apparel = new Set(['sweatshirts', 'jerseys', 'training-tops', 'dresses', 'shirts'])

function product(id, fields) {
  return {
    id,
    sku: `KS-${String(id).padStart(4, '0')}`,
    compare_at_price: null,
    stock_quantity: 25,
    status: 'active',
    position: id,
    short_description: shortDescription,
    description,
    specifications: (apparel.has(fields.category) ? apparelSpecs : shoeSpecs).map(([label, value]) => ({
      label,
      value,
    })),
    images: [fields.image, fields.image, fields.image],
    ...fields,
  }
}

const comingSoon = { status: 'coming_soon', stock_quantity: 0 }

export const products = [
  product(1, {
    slug: 'aero-knit-running-shoe',
    name: 'Aero Knit Running Shoe',
    price: 15000,
    compare_at_price: 21000,
    image: '/img/product/p1.jpg',
    category: 'running',
    brand: 'adidas',
    color: 'grey',
    published_at: '2026-09-20T09:00:00Z',
  }),
  product(2, {
    slug: 'volt-free-trainer',
    name: 'Volt Free Trainer',
    price: 12900,
    compare_at_price: 16000,
    image: '/img/product/p2.jpg',
    category: 'running',
    brand: 'nike',
    color: 'spacegrey',
    published_at: '2026-09-18T09:00:00Z',
  }),
  product(3, {
    slug: 'perforated-leather-slip-on',
    name: 'Perforated Leather Slip-On',
    price: 8900,
    image: '/img/product/p3.jpg',
    category: 'casual',
    brand: 'karma',
    color: 'black',
    published_at: '2026-09-15T09:00:00Z',
  }),
  product(4, {
    slug: 'retro-574-suede-runner',
    name: 'Retro 574 Suede Runner',
    price: 11000,
    compare_at_price: 13500,
    image: '/img/product/p4.jpg',
    category: 'sneakers',
    brand: 'new-balance',
    color: 'gold',
    published_at: '2026-09-12T09:00:00Z',
  }),
  product(5, {
    slug: 'suede-classic-low',
    name: 'Suede Classic Low',
    price: 7500,
    compare_at_price: 9500,
    image: '/img/product/p5.jpg',
    category: 'women-sneakers',
    brand: 'puma',
    color: 'grey',
    published_at: '2026-09-10T09:00:00Z',
  }),
  product(6, {
    slug: 'gel-blaze-running-shoe',
    name: 'Gel Blaze Running Shoe',
    price: 14000,
    compare_at_price: 18000,
    image: '/img/product/p6.jpg',
    category: 'running',
    brand: 'asics',
    color: 'orange',
    published_at: '2026-09-08T09:00:00Z',
  }),
  product(7, {
    slug: 'suede-heritage-sneaker',
    name: 'Suede Heritage Sneaker',
    price: 8000,
    image: '/img/product/p7.jpg',
    category: 'sneakers',
    brand: 'puma',
    color: 'spacegrey',
    published_at: '2026-09-05T09:00:00Z',
  }),
  product(8, {
    slug: 'suede-pastel-low',
    name: 'Suede Pastel Low',
    price: 8500,
    compare_at_price: 10000,
    image: '/img/product/p8.jpg',
    category: 'women-sneakers',
    brand: 'puma',
    color: 'pink',
    published_at: '2026-09-02T09:00:00Z',
  }),
  product(9, {
    slug: 'classic-crew-sweatshirt',
    name: 'Classic Crew Sweatshirt',
    price: 5500,
    compare_at_price: 7000,
    image: '/img/l1.jpg',
    category: 'sweatshirts',
    brand: 'adidas',
    color: 'grey',
    published_at: '2026-08-28T09:00:00Z',
  }),
  product(10, {
    slug: 'camo-compression-tee',
    name: 'Camo Compression Tee',
    price: 4500,
    image: '/img/l2.jpg',
    category: 'training-tops',
    brand: 'adidas',
    color: 'grey',
    published_at: '2026-08-25T09:00:00Z',
  }),
  product(11, {
    slug: 'away-football-jersey',
    name: 'Away Football Jersey',
    price: 9000,
    compare_at_price: 11000,
    image: '/img/l3.jpg',
    category: 'jerseys',
    brand: 'adidas',
    color: 'black',
    published_at: '2026-08-20T09:00:00Z',
  }),
  product(12, {
    slug: 'red-training-jersey',
    name: 'Red Training Jersey',
    price: 6500,
    image: '/img/l4.jpg',
    category: 'jerseys',
    brand: 'adidas',
    color: 'red',
    published_at: '2026-08-18T09:00:00Z',
  }),
  product(13, {
    slug: 'teal-wrap-jumpsuit',
    name: 'Teal Wrap Jumpsuit',
    price: 7000,
    image: '/img/l5.jpg',
    category: 'dresses',
    brand: 'karma',
    color: 'blue',
    published_at: '2026-10-01T09:00:00Z',
    ...comingSoon,
  }),
  product(14, {
    slug: 'cami-midi-dress',
    name: 'Cami Midi Dress',
    price: 6000,
    image: '/img/l6.jpg',
    category: 'dresses',
    brand: 'karma',
    color: 'spacegrey',
    published_at: '2026-10-01T09:00:00Z',
    ...comingSoon,
  }),
  product(15, {
    slug: 'belted-sleeveless-dress',
    name: 'Belted Sleeveless Dress',
    price: 7500,
    image: '/img/l7.jpg',
    category: 'dresses',
    brand: 'karma',
    color: 'black',
    published_at: '2026-10-01T09:00:00Z',
    ...comingSoon,
  }),
  product(16, {
    slug: 'gingham-check-shirt',
    name: 'Gingham Check Shirt',
    price: 5000,
    image: '/img/l8.jpg',
    category: 'shirts',
    brand: 'karma',
    color: 'red',
    published_at: '2026-10-01T09:00:00Z',
    ...comingSoon,
  }),
  product(17, {
    slug: 'zoom-flight-basketball-shoe',
    name: 'Zoom Flight Basketball Shoe',
    price: 14999,
    compare_at_price: 18999,
    image: '/img/category/s-p1.jpg',
    category: 'basketball',
    brand: 'nike',
    color: 'blue',
    published_at: '2026-09-25T09:00:00Z',
  }),
  product(18, {
    slug: 'comic-hi-top-canvas',
    name: 'Comic Hi-Top Canvas',
    price: 15000,
    compare_at_price: 21000,
    image: '/img/product/e-p1.png',
    category: 'canvas',
    brand: 'converse',
    color: 'spacegrey',
    published_at: '2026-09-22T09:00:00Z',
  }),
]

export const banners = [
  { id: 1, title_lines: ['Nike New', 'Collection!'], product_id: 17, image: '/img/banner/banner-img.png' },
  { id: 2, title_lines: ['Nike New', 'Collection!'], product_id: 2, image: '/img/banner/banner-img.png' },
].map((banner) => ({
  ...banner,
  body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
}))

export const promotions = {
  exclusive_deal: { title: 'Exclusive Hot Deal Ends Soon!', ends_at: '2026-12-31T23:59:59Z', product_ids: [17, 18] },
  deals_of_the_week: {
    title: 'Deals of the Week',
    ends_at: '2026-12-31T23:59:59Z',
    product_ids: [1, 2, 4, 5, 6, 8, 9, 11],
  },
}

const loremReview =
  'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo'

/** Three sample reviews per product (ratings 5, 4, 3 → average 4.0, like the template). */
export const reviews = products.flatMap((p) => [
  {
    product_id: p.id,
    author_name: 'Blake Ruiz',
    avatar: '/img/product/review-1.png',
    rating: 5,
    body: loremReview,
    created_at: '2026-02-12T17:56:00Z',
  },
  {
    product_id: p.id,
    author_name: 'Ana Torres',
    avatar: '/img/product/review-2.png',
    rating: 4,
    body: loremReview,
    created_at: '2026-03-02T10:20:00Z',
  },
  {
    product_id: p.id,
    author_name: 'Sam Patel',
    avatar: '/img/product/review-3.png',
    rating: 3,
    body: loremReview,
    created_at: '2026-04-18T09:05:00Z',
  },
])

/** Product "Comments" tab: two threads, the first with a reply. */
export const productComments = products.flatMap((p) => [
  {
    key: `p${p.id}-1`,
    commentable: 'product',
    commentable_id: p.id,
    parent: null,
    author_name: 'Blake Ruiz',
    avatar: '/img/product/review-1.png',
    body: loremReview,
    created_at: '2026-02-12T17:56:00Z',
  },
  {
    key: `p${p.id}-2`,
    commentable: 'product',
    commentable_id: p.id,
    parent: `p${p.id}-1`,
    author_name: 'Karma Support',
    avatar: '/img/product/review-2.png',
    body: loremReview,
    created_at: '2026-02-12T18:30:00Z',
  },
  {
    key: `p${p.id}-3`,
    commentable: 'product',
    commentable_id: p.id,
    parent: null,
    author_name: 'Sam Patel',
    avatar: '/img/product/review-3.png',
    body: loremReview,
    created_at: '2026-03-21T11:15:00Z',
  },
])
