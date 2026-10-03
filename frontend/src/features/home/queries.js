import { useQuery } from '@tanstack/react-query'
import { getHome } from './api'

export const homeKeys = {
  home: ['home'],
}

export const useHome = () => useQuery({ queryKey: homeKeys.home, queryFn: getHome })
