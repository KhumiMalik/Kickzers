// Mock catalog. Shapes mirror what the Laravel API is expected to return,
// so the services in src/api can later swap these imports for HTTP calls.

export const categories = [
  {
    slug: 'men-shoes',
    name: "Men's Shoes",
    children: [
      { slug: 'running', name: 'Running' },
      { slug: 'sneakers', name: 'Sneakers' },
      { slug: 'casual', name: 'Casual' },
      { slug: 'basketball', name: 'Basketball' },
    ],
  },
  {
    slug: 'women-shoes',
    name: "Women's Shoes",
    children: [
      { slug: 'women-sneakers', name: 'Sneakers' },
      { slug: 'canvas', name: 'Canvas' },
    ],
  },
  {
    slug: 'men-clothing',
    name: "Men's Clothing",
    children: [
      { slug: 'sweatshirts', name: 'Sweatshirts' },
      { slug: 'jerseys', name: 'Jerseys' },
      { slug: 'training-tops', name: 'Training Tops' },
    ],
  },
  {
    slug: 'women-clothing',
    name: "Women's Clothing",
    children: [
      { slug: 'dresses', name: 'Dresses' },
      { slug: 'shirts', name: 'Shirts' },
    ],
  },
  { slug: 'accessories', name: 'Accessories', children: [] },
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

const longDescription = [
  'Beryl Cook is one of Britain’s most talented and amusing artists. Beryl’s pictures feature women of all shapes and sizes enjoying themselves. Born between the two world wars, Beryl Cook eventually left Kendrick School in Reading at the age of 15, where she went to secretarial school and then into an insurance office.',
  'It is often frustrating to attempt to plan meals that are designed for one. Despite this fact, we are seeing more and more recipe books and Internet websites that are dedicated to the act of cooking for one. Divorce and the death of spouses or grown children leaving for college are all reasons that someone accustomed to cooking for more than one would suddenly need to learn how to adjust.',
]

const reviewText =
  'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo'

const sampleReviews = [
  { id: 1, name: 'Blake Ruiz', avatar: '/img/product/review-1.png', rating: 5, text: reviewText, date: '2026-02-12T17:56:00' },
  { id: 2, name: 'Ana Torres', avatar: '/img/product/review-2.png', rating: 4, text: reviewText, date: '2026-03-02T10:20:00' },
  { id: 3, name: 'Sam Patel', avatar: '/img/product/review-3.png', rating: 3, text: reviewText, date: '2026-04-18T09:05:00' },
]

const sampleComments = [
  { id: 1, name: 'Blake Ruiz', avatar: '/img/product/review-1.png', text: reviewText, date: '2026-02-12T17:56:00', replies: [
    { id: 2, name: 'Karma Support', avatar: '/img/product/review-2.png', text: reviewText, date: '2026-02-12T18:30:00' },
  ] },
  { id: 3, name: 'Sam Patel', avatar: '/img/product/review-3.png', text: reviewText, date: '2026-03-21T11:15:00', replies: [] },
]

const shortDescription =
  'Built for everyday comfort with modern materials and a clean silhouette. If you are looking for something that makes your outfit look awesome and feels great all day long, this is it.'

const apparelCategories = new Set(['sweatshirts', 'jerseys', 'training-tops', 'dresses', 'shirts'])

function product(id, fields) {
  const isShoe = !apparelCategories.has(fields.category)
  return {
    id,
    oldPrice: null,
    gallery: [fields.image, fields.image, fields.image],
    shortDescription,
    description: longDescription,
    specs: (isShoe ? shoeSpecs : apparelSpecs).map(([label, value]) => ({ label, value })),
    inStock: true,
    comingSoon: false,
    flags: [],
    reviews: [...sampleReviews],
    comments: sampleComments.map((c) => ({ ...c, replies: [...c.replies] })),
    ...fields,
  }
}

export const products = [
  product(1, { slug: 'aero-knit-running-shoe', name: 'Aero Knit Running Shoe', price: 150, oldPrice: 210, image: '/img/product/p1.jpg', category: 'running', brand: 'adidas', color: 'grey', createdAt: '2026-09-20', flags: ['deal'] }),
  product(2, { slug: 'volt-free-trainer', name: 'Volt Free Trainer', price: 129, oldPrice: 160, image: '/img/product/p2.jpg', category: 'running', brand: 'nike', color: 'spacegrey', createdAt: '2026-09-18', flags: ['deal'] }),
  product(3, { slug: 'perforated-leather-slip-on', name: 'Perforated Leather Slip-On', price: 89, oldPrice: null, image: '/img/product/p3.jpg', category: 'casual', brand: 'karma', color: 'black', createdAt: '2026-09-15' }),
  product(4, { slug: 'retro-574-suede-runner', name: 'Retro 574 Suede Runner', price: 110, oldPrice: 135, image: '/img/product/p4.jpg', category: 'sneakers', brand: 'new-balance', color: 'gold', createdAt: '2026-09-12', flags: ['deal'] }),
  product(5, { slug: 'suede-classic-low', name: 'Suede Classic Low', price: 75, oldPrice: 95, image: '/img/product/p5.jpg', category: 'women-sneakers', brand: 'puma', color: 'grey', createdAt: '2026-09-10', flags: ['deal'] }),
  product(6, { slug: 'gel-blaze-running-shoe', name: 'Gel Blaze Running Shoe', price: 140, oldPrice: 180, image: '/img/product/p6.jpg', category: 'running', brand: 'asics', color: 'orange', createdAt: '2026-09-08', flags: ['deal'] }),
  product(7, { slug: 'suede-heritage-sneaker', name: 'Suede Heritage Sneaker', price: 80, oldPrice: null, image: '/img/product/p7.jpg', category: 'sneakers', brand: 'puma', color: 'spacegrey', createdAt: '2026-09-05' }),
  product(8, { slug: 'suede-pastel-low', name: 'Suede Pastel Low', price: 85, oldPrice: 100, image: '/img/product/p8.jpg', category: 'women-sneakers', brand: 'puma', color: 'pink', createdAt: '2026-09-02', flags: ['deal'] }),
  product(9, { slug: 'classic-crew-sweatshirt', name: 'Classic Crew Sweatshirt', price: 55, oldPrice: 70, image: '/img/l1.jpg', category: 'sweatshirts', brand: 'adidas', color: 'grey', createdAt: '2026-08-28', flags: ['deal'] }),
  product(10, { slug: 'camo-compression-tee', name: 'Camo Compression Tee', price: 45, oldPrice: null, image: '/img/l2.jpg', category: 'training-tops', brand: 'adidas', color: 'grey', createdAt: '2026-08-25' }),
  product(11, { slug: 'away-football-jersey', name: 'Away Football Jersey', price: 90, oldPrice: 110, image: '/img/l3.jpg', category: 'jerseys', brand: 'adidas', color: 'black', createdAt: '2026-08-20', flags: ['deal'] }),
  product(12, { slug: 'red-training-jersey', name: 'Red Training Jersey', price: 65, oldPrice: null, image: '/img/l4.jpg', category: 'jerseys', brand: 'adidas', color: 'red', createdAt: '2026-08-18' }),
  product(13, { slug: 'teal-wrap-jumpsuit', name: 'Teal Wrap Jumpsuit', price: 70, oldPrice: null, image: '/img/l5.jpg', category: 'dresses', brand: 'karma', color: 'blue', createdAt: '2026-10-01', comingSoon: true, inStock: false }),
  product(14, { slug: 'cami-midi-dress', name: 'Cami Midi Dress', price: 60, oldPrice: null, image: '/img/l6.jpg', category: 'dresses', brand: 'karma', color: 'spacegrey', createdAt: '2026-10-01', comingSoon: true, inStock: false }),
  product(15, { slug: 'belted-sleeveless-dress', name: 'Belted Sleeveless Dress', price: 75, oldPrice: null, image: '/img/l7.jpg', category: 'dresses', brand: 'karma', color: 'black', createdAt: '2026-10-01', comingSoon: true, inStock: false }),
  product(16, { slug: 'gingham-check-shirt', name: 'Gingham Check Shirt', price: 50, oldPrice: null, image: '/img/l8.jpg', category: 'shirts', brand: 'karma', color: 'red', createdAt: '2026-10-01', comingSoon: true, inStock: false }),
  product(17, { slug: 'zoom-flight-basketball-shoe', name: 'Zoom Flight Basketball Shoe', price: 149.99, oldPrice: 189.99, image: '/img/category/s-p1.jpg', category: 'basketball', brand: 'nike', color: 'blue', createdAt: '2026-09-25', flags: ['exclusive', 'hero'] }),
  product(18, { slug: 'comic-hi-top-canvas', name: 'Comic Hi-Top Canvas', price: 150, oldPrice: 210, image: '/img/product/e-p1.png', category: 'canvas', brand: 'converse', color: 'spacegrey', createdAt: '2026-09-22', flags: ['exclusive'] }),
]

// slug -> display name for parent and child categories
export const categoryNames = Object.fromEntries(
  categories.flatMap((parent) => [[parent.slug, parent.name], ...parent.children.map((child) => [child.slug, child.name])]),
)
