import { useState } from 'react'
import {
  Button,
  IconButton,
  Field,
  Checkbox,
  RadioButton,
  Switch,
  DefinedField,
  MenuItem,
  Menu,
  DatePicker,
} from '../components/index.js'

function Section({ title, children }) {
  return (
    <section className="mb-16">
      <h2 className="text-heading-h4 font-bold text-text-headings mb-6 pb-3 border-b-2 border-border-primary">
        {title}
      </h2>
      <div className="space-y-6">{children}</div>
    </section>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {label && (
        <span className="text-body-sm text-text-disabled w-28 shrink-0">{label}</span>
      )}
      {children}
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 4h10M6 4V3h4v1M5 4l.5 8h5l.5-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="3" r="1" fill="currentColor" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <circle cx="8" cy="13" r="1" fill="currentColor" />
    </svg>
  )
}

// ── Showcase ──────────────────────────────────────────────────────────────────
export default function ComponentShowcase() {
  const [checkA, setCheckA] = useState(false)
  const [checkB, setCheckB] = useState(true)
  const [radio, setRadio] = useState('option1')
  const [switchA, setSwitchA] = useState(false)
  const [switchB, setSwitchB] = useState(true)
  const [selectVal, setSelectVal] = useState('')
  const [date, setDate] = useState(null)

  const selectOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'disabled-opt', label: 'Unavailable', disabled: true },
  ]

  const menuItems = [
    { label: 'Edit', icon: <PlusIcon />, onClick: () => alert('Edit') },
    { label: 'Duplicate', onClick: () => alert('Duplicate') },
    { label: 'Delete', icon: <TrashIcon />, destructive: true, onClick: () => alert('Delete') },
    { label: 'Archived', disabled: true },
  ]

  return (
    <div className="min-h-screen bg-surface-page p-8 max-w-4xl mx-auto">
      <h1 className="text-heading-h2 font-bold text-text-headings mb-4">
        Component Library
      </h1>
      <p className="text-body-lg text-text-body mb-12">
        All components use only the design tokens from <code className="text-body-sm bg-neutral-100 px-xs py-2xs rounded-md">src/index.css</code>.
      </p>

      {/* ── Button ── */}
      <Section title="Button">
        <Row label="Variants">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </Row>
        <Row label="Sizes">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Row>
        <Row label="States">
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <Button variant="outline" loading>Loading outline</Button>
        </Row>
        <Row label="Full width">
          <div className="w-full max-w-xs">
            <Button fullWidth>Full Width</Button>
          </div>
        </Row>
      </Section>

      {/* ── IconButton ── */}
      <Section title="IconButton">
        <Row label="Variants">
          <IconButton icon={<PlusIcon />} variant="primary" aria-label="Add" />
          <IconButton icon={<PlusIcon />} variant="outline" aria-label="Add outline" />
          <IconButton icon={<PlusIcon />} variant="ghost" aria-label="Add ghost" />
          <IconButton icon={<TrashIcon />} variant="danger" aria-label="Delete" />
        </Row>
        <Row label="Sizes">
          <IconButton icon={<PlusIcon />} size="sm" aria-label="Small" />
          <IconButton icon={<PlusIcon />} size="md" aria-label="Medium" />
          <IconButton icon={<PlusIcon />} size="lg" aria-label="Large" />
        </Row>
        <Row label="States">
          <IconButton icon={<PlusIcon />} disabled aria-label="Disabled" />
          <IconButton icon={<PlusIcon />} loading aria-label="Loading" />
        </Row>
      </Section>

      {/* ── Field ── */}
      <Section title="Field">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <Field
            id="field-default"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            helperText="We'll never share your email."
          />
          <Field
            id="field-error"
            label="Password"
            type="password"
            placeholder="Enter password"
            error
            errorMessage="Password is required."
            required
          />
          <Field
            id="field-disabled"
            label="Disabled field"
            placeholder="Cannot edit"
            disabled
          />
          <Field
            id="field-search"
            label="Search"
            type="search"
            placeholder="Search workouts..."
          />
        </div>
      </Section>

      {/* ── Checkbox ── */}
      <Section title="Checkbox">
        <Row label="States">
          <Checkbox
            id="cb-a"
            label="Unchecked"
            checked={checkA}
            onChange={e => setCheckA(e.target.checked)}
          />
          <Checkbox
            id="cb-b"
            label="Checked"
            checked={checkB}
            onChange={e => setCheckB(e.target.checked)}
          />
          <Checkbox
            id="cb-c"
            label="Indeterminate"
            indeterminate
            checked={false}
            onChange={() => {}}
          />
          <Checkbox
            id="cb-d"
            label="Disabled"
            disabled
          />
          <Checkbox
            id="cb-e"
            label="Disabled checked"
            disabled
            checked
            onChange={() => {}}
          />
        </Row>
      </Section>

      {/* ── RadioButton ── */}
      <Section title="RadioButton">
        <Row label="Group">
          <RadioButton
            id="r1"
            name="difficulty"
            value="option1"
            label="Beginner"
            checked={radio === 'option1'}
            onChange={() => setRadio('option1')}
          />
          <RadioButton
            id="r2"
            name="difficulty"
            value="option2"
            label="Intermediate"
            checked={radio === 'option2'}
            onChange={() => setRadio('option2')}
          />
          <RadioButton
            id="r3"
            name="difficulty"
            value="option3"
            label="Advanced"
            checked={radio === 'option3'}
            onChange={() => setRadio('option3')}
          />
          <RadioButton
            id="r4"
            name="difficulty"
            value="option4"
            label="Disabled"
            disabled
          />
        </Row>
      </Section>

      {/* ── Switch ── */}
      <Section title="Switch">
        <Row label="States">
          <Switch
            id="sw-a"
            label="Notifications off"
            checked={switchA}
            onChange={setSwitchA}
          />
          <Switch
            id="sw-b"
            label="Notifications on"
            checked={switchB}
            onChange={setSwitchB}
          />
          <Switch
            id="sw-c"
            label="Disabled off"
            disabled
          />
          <Switch
            id="sw-d"
            label="Disabled on"
            disabled
            defaultChecked
          />
        </Row>
      </Section>

      {/* ── DefinedField ── */}
      <Section title="DefinedField (Select)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <DefinedField
            id="df-default"
            label="Difficulty level"
            options={selectOptions}
            value={selectVal}
            onChange={setSelectVal}
            placeholder="Choose difficulty..."
            helperText="Select your fitness level."
          />
          <DefinedField
            id="df-error"
            label="Required field"
            options={selectOptions}
            placeholder="Select..."
            error
            errorMessage="Please select an option."
            required
          />
          <DefinedField
            id="df-disabled"
            label="Disabled"
            options={selectOptions}
            disabled
            placeholder="Cannot select"
          />
        </div>
      </Section>

      {/* ── Menu ── */}
      <Section title="Menu & MenuItem">
        <Row label="Placements">
          <Menu
            trigger={<Button variant="outline">Actions ▾</Button>}
            items={menuItems}
            placement="bottom-start"
          />
          <Menu
            trigger={<Button variant="secondary">More ▾</Button>}
            items={menuItems}
            placement="bottom-end"
          />
          <Menu
            trigger={
              <IconButton icon={<DotsIcon />} variant="ghost" aria-label="More options" />
            }
            items={menuItems}
            placement="bottom-end"
          />
        </Row>
      </Section>

      {/* ── DatePicker ── */}
      <Section title="DatePicker">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <DatePicker
            id="dp-default"
            label="Start date"
            value={date}
            onChange={setDate}
            helperText="Select your workout start date."
          />
          <DatePicker
            id="dp-min"
            label="With min/max"
            minDate={new Date()}
            maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
            placeholder="Next 30 days only"
          />
          <DatePicker
            id="dp-error"
            label="Error state"
            error
            errorMessage="Date is required."
            required
          />
          <DatePicker
            id="dp-disabled"
            label="Disabled"
            disabled
          />
        </div>
      </Section>
    </div>
  )
}
