import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/index.js'
import { Field } from '../components/index.js'
import { Checkbox } from '../components/index.js'

export default function Contact() {
  const navigate = useNavigate()
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    if (!agreed) return
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-neutral-200 flex items-stretch">

      {/* Left panel — decorative */}
      <div className="hidden md:flex w-[30%] bg-neutral-300 rounded-2xl m-4 flex-col justify-end p-8">
        <p className="text-heading-h4 text-neutral-white font-bold leading-tight">
          We're here to help you take control of your health.
        </p>
        <p className="text-body-sm text-neutral-200 mt-3">
          Questions, feedback, or just want to say hello — reach out anytime.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 bg-neutral-100 rounded-2xl m-4 p-10 flex flex-col">

        {/* Back button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-2 border border-neutral-400 text-text-body text-body-sm px-4 py-2 rounded-round hover:bg-neutral-200 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-heading-h3 text-text-headings font-bold mb-1">Contact us</h1>
          <p className="text-body-sm text-text-body">Reach out and we'll get in touch as soon as possible!</p>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div className="bg-surface-success border border-border-success rounded-lg p-6 max-w-md">
              <p className="text-text-success text-body-lg font-semibold">✓ Message sent!</p>
              <p className="text-text-body text-body-sm mt-2">We'll be in touch soon.</p>
            </div>
            <Button variant="outline" size="md" onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 max-w-lg">

            {/* Name row */}
            <div className="flex gap-4 ">
              <Field
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First Name"
                className="flex-1"
              />
              <Field
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last Name"
                className="flex-1"
              />
            </div>

            {/* Email */}
            <Field
              id="email"
              name="email"
              type="email"
              placeholder="Email"
            />

            {/* Message textarea */}
            <div className="flex flex-col w-full">
              <textarea
                id="message"
                name="message"
                placeholder="Your Message"
                rows={6}
                className="w-full rounded-md px-4 py-3 text-body-md text-text-body bg-surface-primary border border-border-primary transition-colors focus:outline-none focus:border-border-focus resize-none"
              />
            </div>

            {/* Privacy checkbox */}
            <Checkbox
              id="privacy"
              name="privacy"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              label="I hereby agree to our Privacy Policy terms."
            />

            {/* Submit */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!agreed}
              onClick={handleSubmit}
            >
              Submit Form
            </Button>

          </div>
        )}
      </div>
    </div>
  )
}