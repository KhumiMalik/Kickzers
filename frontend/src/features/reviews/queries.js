import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productKeys } from '../products'
import { createReview, getReviews } from './api'

export const reviewKeys = {
  list: (slug, page = 1) => ['reviews', slug, page],
  all: (slug) => ['reviews', slug],
}

export const useReviews = (slug, page = 1) =>
  useQuery({ queryKey: reviewKeys.list(slug, page), queryFn: () => getReviews(slug, page) })

/** Posting a review changes the list and the product's rating summary. */
export function useCreateReview(slug) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values) => createReview(slug, values),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: reviewKeys.all(slug) }),
        queryClient.invalidateQueries({ queryKey: productKeys.detail(slug) }),
      ]),
  })
}
