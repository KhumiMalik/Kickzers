// Public API of the products feature.
export { default as DealsOfTheWeek } from './components/DealsOfTheWeek'
export { default as ProductCard } from './components/ProductCard'
export { default as ProductGallery } from './components/ProductGallery'
export { default as ProductOverview } from './components/ProductOverview'
export { default as ProductTabs } from './components/ProductTabs'
export { QuickViewProvider, useQuickView } from './components/QuickViewProvider'
export { productKeys, useDealsOfTheWeek, useProduct, useRelatedProducts } from './queries'
export { productSummarySchema, promotionSchema } from './schemas'
