import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { TextField } from '../../../components/ui/FormControls'
import Modal from '../../../components/ui/Modal'
import { ApiError } from '../../../lib/api-client'
import { applyServerErrors } from '../../../lib/forms'
import { useSendContactMessage } from '../queries'
import { contactFormSchema } from '../schemas'

const FIELDS = ['name', 'email', 'subject', 'message']
const EMPTY = { name: '', email: '', subject: '', message: '' }

/** The template's success / error popups. */
function MessageModal({ status, onClose }) {
  const ok = status === 'success'
  return (
    <Modal className="modal-message" onClose={onClose}>
      <div className="modal-content">
        <div className="modal-header">
          <button type="button" className="close" aria-label="Close" onClick={onClose}>
            <i className="fa fa-close" aria-hidden="true"></i>
          </button>
          <h2>{ok ? 'Thank you' : 'Sorry !'}</h2>
          <p>{ok ? 'Your message is successfully sent...' : 'Something went wrong'}</p>
        </div>
      </div>
    </Modal>
  )
}

export default function ContactForm() {
  const [status, setStatus] = useState(null)
  const sendMessage = useSendContactMessage()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(contactFormSchema), defaultValues: EMPTY })

  const onSubmit = handleSubmit((values) =>
    sendMessage.mutateAsync(values).then(
      () => {
        setStatus('success')
        reset(EMPTY)
      },
      (error) => {
        // Field problems are shown under the inputs; anything else gets the error popup.
        if (error instanceof ApiError && error.isValidation) applyServerErrors(error, setError, FIELDS)
        else setStatus('error')
      },
    ),
  )

  return (
    <>
      <form className="row contact_form" noValidate onSubmit={onSubmit}>
        <div className="col-md-6">
          <TextField type="text" placeholder="Enter your name" error={errors.name} {...register('name')} />
          <TextField type="email" placeholder="Enter email address" error={errors.email} {...register('email')} />
          <TextField type="text" placeholder="Enter Subject" error={errors.subject} {...register('subject')} />
        </div>
        <div className="col-md-6">
          <TextField
            as="textarea"
            rows="1"
            placeholder="Enter Message"
            error={errors.message}
            {...register('message')}
          />
        </div>
        <div className="col-md-12 text-right">
          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send Message'}
          </button>
        </div>
      </form>
      {status && <MessageModal status={status} onClose={() => setStatus(null)} />}
    </>
  )
}
