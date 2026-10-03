import { useMutation } from '@tanstack/react-query'
import { subscribe } from './api'

export const useSubscribe = () => useMutation({ mutationFn: subscribe })
