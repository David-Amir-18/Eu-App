import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/index.js'
import { Field } from '../components/index.js'
import { Checkbox } from '../components/index.js'

export default function Contact() {
  const navigate = useNavigate()
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  })

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }))
  }

  function handleSubmit(e) {
    if (e) e.preventDefault()
    if (!agreed) return
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-neutral-200 flex items-center justify-center p-4 md:p-8 relative font-sans">

      {/* Core Card Container */}
      <div className="relative z-10 w-full max-w-5xl bg-surface-primary border border-border-primary rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[640px]">

        {/* Left Decorative Information Panel*/}
        <div className="w-full md:w-[38%] bg-secondary-600 text-neutral-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="flex flex-col gap-10">
            {/* Heading */}
            <div className="flex flex-col gap-3">
              <h2 className="text-heading-h3 font-bold text-neutral-white leading-tight">
                Get in touch
              </h2>
              <p className="text-body-sm text-neutral-100 leading-relaxed">
                Have questions about our plans, or just want to leave feedback? Drop us a line and we'll get back to you shortly.
              </p>
            </div>

            {/* Styled Contact details block */}
            <div className="flex flex-col gap-8">
              {/* EMAIL */}
              <div className="flex items-start gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-200 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="flex flex-col gap-0.5">
                  <span className="text-body-xs font-bold text-neutral-200 tracking-wider uppercase">EMAIL</span>
                  <span className="text-body-sm text-neutral-200">hello@eulife.com</span>
                </div>
              </div>

              {/* PHONE */}
              <div className="flex items-start gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-200 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div className="flex flex-col gap-0.5">
                  <span className="text-body-xs font-bold text-neutral-200 tracking-wider uppercase">PHONE</span>
                  <span className="text-body-sm text-neutral-200">+201012345678</span>
                </div>
              </div>

              {/* OFFICE */}
              <div className="flex items-start gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-200 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex flex-col gap-0.5">
                  <span className="text-body-xs font-bold text-neutral-200 tracking-wider uppercase">OFFICE</span>
                  <span className="text-body-sm text-neutral-200">Cairo, Egypt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Text with Divider */}
          <div className="mt-12">
            <hr className="border-t border-neutral-white/10 mb-5" />
            <p className="text-body-xs text-neutral-200 font-medium tracking-wide">
              Typically responds within a few hours.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-between bg-surface-primary">

          {/* Top Row: Back button & Brand */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 border border-neutral-300 text-text-body text-body-sm font-semibold px-4 py-2 rounded-lg hover:bg-neutral-100 transition-all duration-300 shadow-xs"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="stroke-current">
                <path d="M10 12L6 8l4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>

            <span className="text-body-xs font-bold tracking-widest text-text-disabled uppercase">EU HEALTH</span>
          </div>

          {submitted ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center py-12 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-surface-success border border-border-success flex items-center justify-center text-text-success shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="max-w-md">
                <h3 className="text-heading-h4 font-bold text-text-headings mb-2">Message Sent Successfully!</h3>
                <p className="text-body-md text-text-disabled leading-relaxed">
                  Thank you for reaching out, <strong>{formData.firstName || 'there'}</strong>. Our specialized support team has received your message and will respond within a few hours.
                </p>
              </div>
              <Button variant="outline" size="md" className="font-bold border border-[#1A2E3B] text-[#1A2E3B] hover:bg-neutral-100 px-6 py-2.5 rounded-lg" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-center w-full">
              <div className="mb-8">
                <h1 className="text-heading-h3 text-text-headings font-bold tracking-tight mb-1.5">Contact us</h1>
                <p className="text-body-sm text-text-disabled font-medium">
                  Fill out the form below and we'll be in touch as soon as possible.
                </p>
              </div>

              <div className="flex flex-col gap-5">
                {/* Name Row */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 flex flex-col">
                    <label className="block text-body-sm font-semibold text-text-body mb-1">
                      First Name <span className="text-text-error">*</span>
                    </label>
                    <Field
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Malak"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="block text-body-sm font-semibold text-text-body mb-1">
                      Last Name <span className="text-text-error">*</span>
                    </label>
                    <Field
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="El Hamshary"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-body-sm font-semibold text-text-body mb-1">
                    Email Address <span className="text-text-error">*</span>
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    placeholder="malakelhamshary13@gmail.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                {/* Message Area */}
                <div className="flex flex-col w-full">
                  <label htmlFor="message" className="block text-body-sm font-semibold text-text-body mb-1">
                    Your Message <span className="text-text-error">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="How can we help?"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="w-full rounded-md px-4 py-3 text-body-md text-text-body bg-surface-primary border border-border-primary transition-all duration-300 focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-border-focus/10 resize-none hover:border-neutral-300"
                    required
                  />
                </div>

                {/* Privacy Policy Checkbox */}
                <div className="pt-2">
                  <Checkbox
                    id="privacy"
                    name="privacy"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    label="I agree to the privacy policy terms."
                    className="items-start"
                  />
                </div>

                {/* Submit Button */}
                <div className="mt-4">
                  <Button
                    type="submit"
                    disabled={!agreed || !formData.firstName || !formData.lastName || !formData.email || !formData.message}
                    className="w-full font-bold py-3 text-neutral-white bg-primary-400 hover:bg-blue-700 rounded-lg transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none disabled:bg-[#1A2E3B]/80 text-center flex justify-center items-center shadow-md cursor-pointer"
                  >
                    Submit Form
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}