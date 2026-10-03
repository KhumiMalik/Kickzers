// Seed data for the mock server (see catalog.js).

export const author = {
  name: 'Charlie Barber',
  role: 'Senior blog writer',
  avatar: '/img/blog/author.png',
  bio: 'Boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get. Boot camps have its supporters and its detractors.',
}

export const blogCategories = [
  { slug: 'technology', name: 'Technology' },
  { slug: 'lifestyle', name: 'Lifestyle' },
  { slug: 'fashion', name: 'Fashion' },
  { slug: 'art', name: 'Art' },
  { slug: 'food', name: 'Food' },
  { slug: 'architecture', name: 'Architecture' },
  { slug: 'adventure', name: 'Adventure' },
]

/** The three cards above the blog list. */
export const featuredCategories = [
  {
    slug: 'lifestyle',
    name: 'Social Life',
    tagline: 'Enjoy your social life together',
    image: '/img/blog/cat-post/cat-post-3.jpg',
  },
  {
    slug: 'technology',
    name: 'Politics',
    tagline: 'Be a part of politics',
    image: '/img/blog/cat-post/cat-post-2.jpg',
  },
  { slug: 'food', name: 'Food', tagline: 'Let the food be finished', image: '/img/blog/cat-post/cat-post-1.jpg' },
]

export const tags = [
  { slug: 'technology', name: 'Technology' },
  { slug: 'lifestyle', name: 'Lifestyle' },
  { slug: 'adventure', name: 'Adventure' },
  { slug: 'art', name: 'Art' },
  { slug: 'architecture', name: 'Architecture' },
  { slug: 'fashion', name: 'Fashion' },
  { slug: 'food', name: 'Food' },
]

const excerpt =
  'MCSE boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get the MCSE study materials yourself at a fraction.'

const body = [
  'Boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get the MCSE study materials yourself at a fraction of the camp price. However, who has the willpower to actually sit through a self-imposed MCSE training.',
  'Boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get the MCSE study materials yourself at a fraction of the camp price. However, who has the willpower to actually sit through a self-imposed MCSE training.',
]

const closing = [
  'MCSE boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get the MCSE study materials yourself at a fraction of the camp price. However, who has the willpower.',
  'MCSE boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get the MCSE study materials yourself at a fraction of the camp price. However, who has the willpower.',
]

function post(id, fields) {
  return {
    id,
    excerpt,
    body,
    quote:
      'MCSE boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get the MCSE study materials yourself at a fraction of the camp price. However, who has the willpower to actually sit through a self-imposed MCSE training.',
    closing,
    cover: '/img/blog/feature-img1.jpg',
    gallery: ['/img/blog/post-img1.jpg', '/img/blog/post-img2.jpg'],
    author: 'Mark Wiens',
    ...fields,
  }
}

export const posts = [
  post(1, {
    slug: 'astronomy-binoculars-a-great-alternative',
    title: 'Astronomy Binoculars A Great Alternative',
    image: '/img/blog/main-blog/m-blog-1.jpg',
    thumbnail: '/img/blog/popular-post/post1.jpg',
    published_at: '2026-09-28T09:00:00Z',
    views: 1200000,
    categories: ['technology', 'lifestyle'],
    tags: ['technology', 'lifestyle'],
  }),
  post(2, {
    slug: 'the-basics-of-buying-a-telescope',
    title: 'The Basics Of Buying A Telescope',
    image: '/img/blog/main-blog/m-blog-2.jpg',
    thumbnail: '/img/blog/popular-post/post2.jpg',
    published_at: '2026-09-21T09:00:00Z',
    views: 870000,
    categories: ['technology'],
    tags: ['technology', 'adventure'],
  }),
  post(3, {
    slug: 'the-glossary-of-telescopes',
    title: 'The Glossary Of Telescopes',
    image: '/img/blog/main-blog/m-blog-3.jpg',
    thumbnail: '/img/blog/popular-post/post3.jpg',
    published_at: '2026-09-14T09:00:00Z',
    views: 540000,
    categories: ['technology', 'art'],
    tags: ['art', 'technology'],
  }),
  post(4, {
    slug: 'the-night-sky',
    title: 'The Night Sky',
    image: '/img/blog/main-blog/m-blog-4.jpg',
    thumbnail: '/img/blog/popular-post/post4.jpg',
    published_at: '2026-09-07T09:00:00Z',
    views: 1500000,
    categories: ['adventure', 'lifestyle'],
    tags: ['adventure', 'lifestyle'],
  }),
  post(5, {
    slug: 'telescopes-101',
    title: 'Telescopes 101',
    image: '/img/blog/main-blog/m-blog-5.jpg',
    thumbnail: '/img/blog/popular-post/post1.jpg',
    published_at: '2026-08-31T09:00:00Z',
    views: 320000,
    categories: ['technology'],
    tags: ['technology'],
  }),
  post(6, {
    slug: 'space-the-final-frontier',
    title: 'Space The Final Frontier',
    image: '/img/blog/main-blog/m-blog-2.jpg',
    thumbnail: '/img/blog/popular-post/post2.jpg',
    published_at: '2026-08-24T09:00:00Z',
    views: 990000,
    categories: ['adventure'],
    tags: ['adventure', 'architecture'],
  }),
  post(7, {
    slug: 'the-amazing-hubble',
    title: 'The Amazing Hubble',
    image: '/img/blog/main-blog/m-blog-3.jpg',
    thumbnail: '/img/blog/popular-post/post3.jpg',
    published_at: '2026-08-17T09:00:00Z',
    views: 410000,
    categories: ['architecture', 'art'],
    tags: ['architecture', 'art'],
  }),
  post(8, {
    slug: 'street-style-for-the-new-season',
    title: 'Street Style For The New Season',
    image: '/img/blog/main-blog/m-blog-4.jpg',
    thumbnail: '/img/blog/popular-post/post4.jpg',
    published_at: '2026-08-10T09:00:00Z',
    views: 760000,
    categories: ['fashion', 'lifestyle'],
    tags: ['fashion', 'lifestyle'],
  }),
  post(9, {
    slug: 'eating-well-on-the-road',
    title: 'Eating Well On The Road',
    image: '/img/blog/main-blog/m-blog-1.jpg',
    thumbnail: '/img/blog/popular-post/post1.jpg',
    published_at: '2026-08-03T09:00:00Z',
    views: 280000,
    categories: ['food', 'adventure'],
    tags: ['food', 'adventure'],
  }),
]

/** Five comments per post: Emilly's thread has two replies. */
export const postComments = posts.flatMap((p) => [
  {
    key: `b${p.id}-1`,
    commentable: 'post',
    commentable_id: p.id,
    parent: null,
    author_name: 'Emilly Blunt',
    avatar: '/img/blog/c1.jpg',
    body: 'Never say goodbye till the end comes!',
    created_at: '2026-09-04T15:12:00Z',
  },
  {
    key: `b${p.id}-2`,
    commentable: 'post',
    commentable_id: p.id,
    parent: `b${p.id}-1`,
    author_name: 'Elsie Cunningham',
    avatar: '/img/blog/c2.jpg',
    body: 'Never say goodbye till the end comes!',
    created_at: '2026-09-04T15:40:00Z',
  },
  {
    key: `b${p.id}-3`,
    commentable: 'post',
    commentable_id: p.id,
    parent: `b${p.id}-1`,
    author_name: 'Annie Stephens',
    avatar: '/img/blog/c3.jpg',
    body: 'Never say goodbye till the end comes!',
    created_at: '2026-09-04T16:02:00Z',
  },
  {
    key: `b${p.id}-4`,
    commentable: 'post',
    commentable_id: p.id,
    parent: null,
    author_name: 'Maria Luna',
    avatar: '/img/blog/c4.jpg',
    body: 'Never say goodbye till the end comes!',
    created_at: '2026-09-05T09:30:00Z',
  },
  {
    key: `b${p.id}-5`,
    commentable: 'post',
    commentable_id: p.id,
    parent: null,
    author_name: 'Ina Hayes',
    avatar: '/img/blog/c5.jpg',
    body: 'Never say goodbye till the end comes!',
    created_at: '2026-09-06T11:45:00Z',
  },
])
