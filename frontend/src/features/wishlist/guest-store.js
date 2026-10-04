import { useSyncExternalStore } from 'react'

/**
 * Guest wishlist: product ids kept in localStorage until the visitor logs in,
 * when WishlistSync merges them into the account (decision Q3 in docs/plan.md).
 * Implemented as a tiny external store so every component sees the same list.
 */
const STORAGE_KEY = 'kickzers.guest-wishlist'
const listeners = new Set()

function read() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

let snapshot = read()

function write(ids) {
  snapshot = ids
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Storage unavailable: the list just won't survive a reload.
  }
  listeners.forEach((listener) => listener())
}

export const guestWishlist = {
  ids: () => snapshot,
  toggle: (id) => write(snapshot.includes(id) ? snapshot.filter((x) => x !== id) : [...snapshot, id]),
  clear: () => write([]),
  subscribe: (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

/** @returns {number[]} product ids in the guest wishlist */
export const useGuestWishlistIds = () => useSyncExternalStore(guestWishlist.subscribe, guestWishlist.ids)
