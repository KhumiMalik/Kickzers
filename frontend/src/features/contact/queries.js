import { useMutation } from '@tanstack/react-query'
import { sendContactMessage } from './api'

export const useSendContactMessage = () => useMutation({ mutationFn: sendContactMessage })
