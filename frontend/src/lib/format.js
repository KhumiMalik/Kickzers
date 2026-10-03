const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

/** 1200000 → "1.2M" */
export const formatCompact = (n) => compact.format(n)

/** 5 → "05" */
export const pad2 = (n) => String(n).padStart(2, '0')

/** Joins truthy class names: cx('a', false && 'b', 'c') → "a c". */
export const cx = (...classes) => classes.filter(Boolean).join(' ')
