// Mock blog content (see note in catalog.js).

export const blogCategories = [
  { slug: 'technology', name: 'Technology' },
  { slug: 'lifestyle', name: 'Lifestyle' },
  { slug: 'fashion', name: 'Fashion' },
  { slug: 'art', name: 'Art' },
  { slug: 'food', name: 'Food' },
  { slug: 'architecture', name: 'Architecture' },
  { slug: 'adventure', name: 'Adventure' },
]

// The three highlighted cards above the blog list.
export const featuredCategories = [
  { slug: 'lifestyle', title: 'Social Life', text: 'Enjoy your social life together', image: '/img/blog/cat-post/cat-post-3.jpg' },
  { slug: 'technology', title: 'Politics', text: 'Be a part of politics', image: '/img/blog/cat-post/cat-post-2.jpg' },
  { slug: 'food', title: 'Food', text: 'Let the food be finished', image: '/img/blog/cat-post/cat-post-1.jpg' },
]

export const author = {
  name: 'Charlie Barber',
  role: 'Senior blog writer',
  avatar: '/img/blog/author.png',
  bio: 'Boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get. Boot camps have its supporters and its detractors.',
}

const excerpt =
  'MCSE boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get the MCSE study materials yourself at a fraction.'

const body = [
  'Boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get the MCSE study materials yourself at a fraction of the camp price. However, who has the willpower to actually sit through a self-imposed MCSE training.',
  'Boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get the MCSE study materials yourself at a fraction of the camp price. However, who has the willpower to actually sit through a self-imposed MCSE training.',
]

const quote =
  'MCSE boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get the MCSE study materials yourself at a fraction of the camp price. However, who has the willpower to actually sit through a self-imposed MCSE training.'

const closing = [
  'MCSE boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get the MCSE study materials yourself at a fraction of the camp price. However, who has the willpower.',
  'MCSE boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get the MCSE study materials yourself at a fraction of the camp price. However, who has the willpower.',
]

const comments = [
  { id: 1, name: 'Emilly Blunt', avatar: '/img/blog/c1.jpg', date: '2026-09-04T15:12:00', text: 'Never say goodbye till the end comes!', replies: [
    { id: 2, name: 'Elsie Cunningham', avatar: '/img/blog/c2.jpg', date: '2026-09-04T15:40:00', text: 'Never say goodbye till the end comes!' },
    { id: 3, name: 'Annie Stephens', avatar: '/img/blog/c3.jpg', date: '2026-09-04T16:02:00', text: 'Never say goodbye till the end comes!' },
  ] },
  { id: 4, name: 'Maria Luna', avatar: '/img/blog/c4.jpg', date: '2026-09-05T09:30:00', text: 'Never say goodbye till the end comes!', replies: [] },
  { id: 5, name: 'Ina Hayes', avatar: '/img/blog/c5.jpg', date: '2026-09-06T11:45:00', text: 'Never say goodbye till the end comes!', replies: [] },
]

function post(id, fields) {
  return {
    id,
    excerpt,
    body,
    quote,
    closing,
    cover: '/img/blog/feature-img1.jpg',
    images: ['/img/blog/post-img1.jpg', '/img/blog/post-img2.jpg'],
    author: 'Mark Wiens',
    comments: comments.map((c) => ({ ...c, replies: [...c.replies] })),
    ...fields,
  }
}

export const posts = [
  post(1, { slug: 'astronomy-binoculars-a-great-alternative', title: 'Astronomy Binoculars A Great Alternative', image: '/img/blog/main-blog/m-blog-1.jpg', thumb: '/img/blog/popular-post/post1.jpg', date: '2026-09-28', views: 1200000, categories: ['technology', 'lifestyle'], tags: ['Technology', 'Lifestyle'] }),
  post(2, { slug: 'the-basics-of-buying-a-telescope', title: 'The Basics Of Buying A Telescope', image: '/img/blog/main-blog/m-blog-2.jpg', thumb: '/img/blog/popular-post/post2.jpg', date: '2026-09-21', views: 870000, categories: ['technology'], tags: ['Technology', 'Adventure'] }),
  post(3, { slug: 'the-glossary-of-telescopes', title: 'The Glossary Of Telescopes', image: '/img/blog/main-blog/m-blog-3.jpg', thumb: '/img/blog/popular-post/post3.jpg', date: '2026-09-14', views: 540000, categories: ['technology', 'art'], tags: ['Art', 'Technology'] }),
  post(4, { slug: 'the-night-sky', title: 'The Night Sky', image: '/img/blog/main-blog/m-blog-4.jpg', thumb: '/img/blog/popular-post/post4.jpg', date: '2026-09-07', views: 1500000, categories: ['adventure', 'lifestyle'], tags: ['Adventure', 'Lifestyle'] }),
  post(5, { slug: 'telescopes-101', title: 'Telescopes 101', image: '/img/blog/main-blog/m-blog-5.jpg', thumb: '/img/blog/popular-post/post1.jpg', date: '2026-08-31', views: 320000, categories: ['technology'], tags: ['Technology'] }),
  post(6, { slug: 'space-the-final-frontier', title: 'Space The Final Frontier', image: '/img/blog/main-blog/m-blog-2.jpg', thumb: '/img/blog/popular-post/post2.jpg', date: '2026-08-24', views: 990000, categories: ['adventure'], tags: ['Adventure', 'Architecture'] }),
  post(7, { slug: 'the-amazing-hubble', title: 'The Amazing Hubble', image: '/img/blog/main-blog/m-blog-3.jpg', thumb: '/img/blog/popular-post/post3.jpg', date: '2026-08-17', views: 410000, categories: ['architecture', 'art'], tags: ['Architecture', 'Art'] }),
  post(8, { slug: 'street-style-for-the-new-season', title: 'Street Style For The New Season', image: '/img/blog/main-blog/m-blog-4.jpg', thumb: '/img/blog/popular-post/post4.jpg', date: '2026-08-10', views: 760000, categories: ['fashion', 'lifestyle'], tags: ['Fashion', 'Lifestyle'] }),
  post(9, { slug: 'eating-well-on-the-road', title: 'Eating Well On The Road', image: '/img/blog/main-blog/m-blog-1.jpg', thumb: '/img/blog/popular-post/post1.jpg', date: '2026-08-03', views: 280000, categories: ['food', 'adventure'], tags: ['Food', 'Adventure'] }),
]
