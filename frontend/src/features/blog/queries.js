import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getBlogSidebar, getPost, getPosts } from './api'

export const postKeys = {
  list: (filters) => ['posts', 'list', filters],
  detail: (slug) => ['posts', 'detail', slug],
  sidebar: ['blog', 'sidebar'],
}

/** @param {{ category?: string, tag?: string, q?: string, page?: number }} filters */
export const usePosts = (filters) =>
  useQuery({ queryKey: postKeys.list(filters), queryFn: () => getPosts(filters), placeholderData: keepPreviousData })

export const usePost = (slug) =>
  useQuery({ queryKey: postKeys.detail(slug), queryFn: () => getPost(slug), enabled: Boolean(slug) })

export const useBlogSidebar = () =>
  useQuery({ queryKey: postKeys.sidebar, queryFn: getBlogSidebar, staleTime: 5 * 60_000 })
