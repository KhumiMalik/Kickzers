import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { postKeys } from '../blog'
import { productKeys } from '../products'
import { createComment, getComments } from './api'

export const commentKeys = {
  list: (subject, slug) => ['comments', subject, slug],
}

/** @param {'products'|'posts'} subject */
export const useComments = (subject, slug) =>
  useQuery({ queryKey: commentKeys.list(subject, slug), queryFn: () => getComments(subject, slug) })

/** Posting refreshes the thread and the parent's comment count. */
export function useCreateComment(subject, slug) {
  const queryClient = useQueryClient()
  const parentKey = subject === 'posts' ? postKeys.detail(slug) : productKeys.detail(slug)
  return useMutation({
    mutationFn: (values) => createComment(subject, slug, values),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: commentKeys.list(subject, slug) }),
        queryClient.invalidateQueries({ queryKey: parentKey }),
      ]),
  })
}
