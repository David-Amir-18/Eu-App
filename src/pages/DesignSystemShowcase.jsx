// Design System Showcase - Visual examples of all design tokens

function DesignSystemShowcase() {
  return (
    <div className="min-h-screen bg-surface-page p-8">
      <h1 className="text-heading-h1 font-(weight-bold) text-text-headings mb-8">
        EU Health & Fitness Design System
      </h1>
      <p className="text-body-lg text-text-body mb-12">
        Complete showcase of all design tokens and components
      </p>

      {/* Typography */}
      <Section title="Typography">
        <div className="space-y-6">
          <div>
            <h3 className="text-body-md font-(weight-semibold) text-text-headings mb-4">Headings</h3>
            <div className="space-y-4">
              <div>
                <h1 className="text-heading-h1 font-(weight-bold) text-text-headings">Heading 1</h1>
                <code className="text-xs text-neutral-500">text-heading-h1 (3.75rem / 60px)</code>
              </div>
              <div>
                <h2 className="text-heading-h2 font-(weight-bold) text-text-headings">Heading 2</h2>
                <code className="text-xs text-neutral-500">text-heading-h2 (3rem / 48px)</code>
              </div>
              <div>
                <h3 className="text-heading-h3 font-(weight-bold) text-text-headings">Heading 3</h3>
                <code className="text-xs text-neutral-500">text-heading-h3 (2.5rem / 40px)</code>
              </div>
              <div>
                <h4 className="text-heading-h4 font-(weight-semibold) text-text-headings">Heading 4</h4>
                <code className="text-xs text-neutral-500">text-heading-h4 (2rem / 32px)</code>
              </div>
              <div>
                <h5 className="text-heading-h5 font-(weight-semibold) text-text-headings">Heading 5</h5>
                <code className="text-xs text-neutral-500">text-heading-h5 (1.5rem / 24px)</code>
              </div>
              <div>
                <h6 className="text-heading-h6 font-(weight-semibold) text-text-headings">Heading 6</h6>
                <code className="text-xs text-neutral-500">text-heading-h6 (1.25rem / 20px)</code>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-body-md font-(weight-semibold) text-text-headings mb-4">Body Text</h3>
            <div className="space-y-4">
              <div>
                <p className="text-body-lg text-text-body">Large body text - The quick brown fox jumps over the lazy dog.</p>
                <code className="text-xs text-neutral-500">text-body-lg (1.25rem / 20px)</code>
              </div>
              <div>
                <p className="text-body-md text-text-body">Medium body text - The quick brown fox jumps over the lazy dog.</p>
                <code className="text-xs text-neutral-500">text-body-md (1rem / 16px)</code>
              </div>
              <div>
                <p className="text-body-sm text-text-body">Small body text - The quick brown fox jumps over the lazy dog.</p>
                <code className="text-xs text-neutral-500">text-body-sm (0.75rem / 12px)</code>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-body-md font-(weight-semibold) text-text-headings mb-4">Font Weights</h3>
            <div className="space-y-2">
              <p className="text-body-md font-(weight-light) text-text-body">Light (300) - The quick brown fox</p>
              <p className="text-body-md font-(weight-regular) text-text-body">Regular (400) - The quick brown fox</p>
              <p className="text-body-md font-(weight-semibold) text-text-body">Semibold (600) - The quick brown fox</p>
              <p className="text-body-md font-(weight-bold) text-text-body">Bold (700) - The quick brown fox</p>
            </div>
          </div>
        </div>
        <CodeExample code='<h1 className="text-heading-h1 font-(weight-bold) text-text-headings">Heading</h1>\n<p className="text-body-md text-text-body">Body text</p>' />
      </Section>

      {/* Spacing */}
      <Section title="Spacing Scale">
        <div className="space-y-4">
          <SpacingDemo size="3xs" value="0.125rem / 2px" />
          <SpacingDemo size="2xs" value="0.25rem / 4px" />
          <SpacingDemo size="xs" value="0.5rem / 8px" />
          <SpacingDemo size="sm" value="0.75rem / 12px" />
          <SpacingDemo size="md" value="1rem / 16px" />
          <SpacingDemo size="lg" value="1.5rem / 24px" />
          <SpacingDemo size="xl" value="2rem / 32px" />
          <SpacingDemo size="2xl" value="3rem / 48px" />
          <SpacingDemo size="3xl" value="4rem / 64px" />
        </div>
        <CodeExample code='<div className="p-md m-lg gap-sm">Spacing utilities</div>\n<div className="space-y-xl">Vertical spacing</div>' />
      </Section>

      {/* Border Radius */}
      <Section title="Border Radius">
        <div className="flex flex-wrap gap-6">
          <BorderRadiusDemo radius="none" label="none (0)" />
          <BorderRadiusDemo radius="sm" label="sm (0.125rem)" />
          <BorderRadiusDemo radius="md" label="md (0.25rem)" />
          <BorderRadiusDemo radius="lg" label="lg (0.5rem)" />
          <BorderRadiusDemo radius="round" label="round (3.25rem)" />
        </div>
        <CodeExample code='<div className="rounded-lg">Rounded corners</div>\n<button className="rounded-round">Pill button</button>' />
      </Section>

      {/* Primary Colors */}
      <Section title="Primary Colors">
        <div className="grid grid-cols-7 gap-4">
          <ColorSwatch color="bg-primary-100" name="primary-100" />
          <ColorSwatch color="bg-primary-200" name="primary-200" />
          <ColorSwatch color="bg-primary-300" name="primary-300" />
          <ColorSwatch color="bg-primary-400" name="primary-400" />
          <ColorSwatch color="bg-primary-500" name="primary-500" />
          <ColorSwatch color="bg-primary-600" name="primary-600" />
          <ColorSwatch color="bg-primary-700" name="primary-700" />
        </div>
        <CodeExample code='<button className="bg-primary-400 text-white p-4">Primary Button</button>' />
      </Section>

      {/* Secondary Colors */}
      <Section title="Secondary Colors">
        <div className="grid grid-cols-7 gap-4">
          <ColorSwatch color="bg-secondary-100" name="secondary-100" />
          <ColorSwatch color="bg-secondary-200" name="secondary-200" />
          <ColorSwatch color="bg-secondary-300" name="secondary-300" />
          <ColorSwatch color="bg-secondary-400" name="secondary-400" />
          <ColorSwatch color="bg-secondary-500" name="secondary-500" />
          <ColorSwatch color="bg-secondary-600" name="secondary-600" />
          <ColorSwatch color="bg-secondary-700" name="secondary-700" />
        </div>
        <CodeExample code='<button className="bg-secondary-400 text-white p-4">Secondary Button</button>' />
      </Section>

      {/* Neutral Colors */}
      <Section title="Neutral Colors">
        <div className="grid grid-cols-9 gap-4">
          <ColorSwatch color="bg-neutral-100" name="neutral-100" />
          <ColorSwatch color="bg-neutral-200" name="neutral-200" />
          <ColorSwatch color="bg-neutral-300" name="neutral-300" />
          <ColorSwatch color="bg-neutral-400" name="neutral-400" />
          <ColorSwatch color="bg-neutral-500" name="neutral-500" />
          <ColorSwatch color="bg-neutral-600" name="neutral-600" />
          <ColorSwatch color="bg-neutral-700" name="neutral-700" />
          <ColorSwatch color="bg-neutral-white border border-gray-300" name="neutral-white" />
          <ColorSwatch color="bg-neutral-black" name="neutral-black" />
        </div>
        <CodeExample code='<div className="bg-neutral-100 border border-neutral-300 p-4">Card</div>' />
      </Section>

      {/* Success Colors */}
      <Section title="Success Colors">
        <div className="grid grid-cols-7 gap-4">
          <ColorSwatch color="bg-success-100" name="success-100" />
          <ColorSwatch color="bg-success-200" name="success-200" />
          <ColorSwatch color="bg-success-300" name="success-300" />
          <ColorSwatch color="bg-success-400" name="success-400" />
          <ColorSwatch color="bg-success-500" name="success-500" />
          <ColorSwatch color="bg-success-600" name="success-600" />
          <ColorSwatch color="bg-success-700" name="success-700" />
        </div>
        <CodeExample code='<div className="bg-surface-success border border-border-success p-4"><p className="text-text-success">Success!</p></div>' />
      </Section>

      {/* Error Colors */}
      <Section title="Error Colors">
        <div className="grid grid-cols-7 gap-4">
          <ColorSwatch color="bg-error-100" name="error-100" />
          <ColorSwatch color="bg-error-200" name="error-200" />
          <ColorSwatch color="bg-error-300" name="error-300" />
          <ColorSwatch color="bg-error-400" name="error-400" />
          <ColorSwatch color="bg-error-500" name="error-500" />
          <ColorSwatch color="bg-error-600" name="error-600" />
          <ColorSwatch color="bg-error-700" name="error-700" />
        </div>
        <CodeExample code='<div className="bg-surface-error border border-border-error p-4"><p className="text-text-error">Error!</p></div>' />
      </Section>

      {/* Warning Colors */}
      <Section title="Warning Colors">
        <div className="grid grid-cols-7 gap-4">
          <ColorSwatch color="bg-warning-100" name="warning-100" />
          <ColorSwatch color="bg-warning-200" name="warning-200" />
          <ColorSwatch color="bg-warning-300" name="warning-300" />
          <ColorSwatch color="bg-warning-400" name="warning-400" />
          <ColorSwatch color="bg-warning-500" name="warning-500" />
          <ColorSwatch color="bg-warning-600" name="warning-600" />
          <ColorSwatch color="bg-warning-700" name="warning-700" />
        </div>
        <CodeExample code='<div className="bg-surface-warning border border-border-warning p-4"><p className="text-warning-500">Warning!</p></div>' />
      </Section>

      {/* Information Colors */}
      <Section title="Information Colors">
        <div className="grid grid-cols-7 gap-4">
          <ColorSwatch color="bg-information-100" name="information-100" />
          <ColorSwatch color="bg-information-200" name="information-200" />
          <ColorSwatch color="bg-information-300" name="information-300" />
          <ColorSwatch color="bg-information-400" name="information-400" />
          <ColorSwatch color="bg-information-500" name="information-500" />
          <ColorSwatch color="bg-information-600" name="information-600" />
          <ColorSwatch color="bg-information-700" name="information-700" />
        </div>
        <CodeExample code='<div className="bg-surface-information border border-border-information p-4"><p className="text-information-500">Info!</p></div>' />
      </Section>

      {/* Semantic Text Colors */}
      <Section title="Semantic Text Colors">
        <div className="space-y-4">
          <TextExample className="text-text-headings" label="text-headings">Main heading text</TextExample>
          <TextExample className="text-text-body" label="text-body">Body text for paragraphs</TextExample>
          <TextExample className="text-text-disabled" label="text-disabled">Disabled text</TextExample>
          <TextExample className="text-text-action" label="text-action">Link and action text</TextExample>
          <TextExample className="text-text-action-hover" label="text-action-hover">Link hover state</TextExample>
          <TextExample className="text-text-success" label="text-success">Success message</TextExample>
          <TextExample className="text-text-error" label="text-error">Error message</TextExample>
        </div>
        <CodeExample code='<h1 className="text-text-headings">Heading</h1>\n<p className="text-text-body">Body text</p>\n<a className="text-text-action hover:text-text-action-hover">Link</a>' />
      </Section>

      {/* Spacing */}
      <Section title="Tailwind Spacing (Standard)">
        <div className="space-y-2">
          <SpacingDemo size="1" value="0.25rem / 4px" />
          <SpacingDemo size="2" value="0.5rem / 8px" />
          <SpacingDemo size="4" value="1rem / 16px" />
          <SpacingDemo size="6" value="1.5rem / 24px" />
          <SpacingDemo size="8" value="2rem / 32px" />
        </div>
        <CodeExample code='<div className="p-4 m-2">Padding and margin</div>\n<div className="space-y-4">Vertical spacing</div>' />
      </Section>

      {/* Component Examples */}
      <Section title="Component Examples">
        <div className="space-y-8">
          {/* Buttons */}
          <div>
            <h3 className="text-heading-h5 font-(weight-semibold) text-text-headings mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <button className="bg-primary-400 text-white px-6 py-3 rounded-lg hover:bg-primary-500 transition font-(weight-semibold)">
                Primary Button
              </button>
              <button className="bg-secondary-400 text-white px-6 py-3 rounded-lg hover:bg-secondary-500 transition font-(weight-semibold)">
                Secondary Button
              </button>
              <button className="bg-surface-disabled text-text-disabled px-6 py-3 rounded-lg cursor-not-allowed font-(weight-semibold)">
                Disabled Button
              </button>
              <button className="border-2 border-primary-400 text-primary-400 px-6 py-3 rounded-lg hover:bg-primary-100 transition font-(weight-semibold)">
                Outline Button
              </button>
              <button className="bg-success-500 text-white px-6 py-3 rounded-round hover:bg-success-600 transition font-(weight-semibold)">
                Pill Button
              </button>
            </div>
            <CodeExample code='<button className="bg-primary-400 text-white px-6 py-3 rounded-lg hover:bg-primary-500 font-(weight-semibold)">\n  Primary Button\n</button>' />
          </div>

          {/* Cards */}
          <div>
            <h3 className="text-heading-h5 font-(weight-semibold) text-text-headings mb-4">Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h4 className="text-text-headings text-body-lg font-(weight-semibold) mb-2">Card Title</h4>
                <p className="text-text-body text-body-sm">Card description text goes here with proper spacing.</p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-lg p-6">
                <h4 className="text-text-headings text-body-lg font-(weight-semibold) mb-2">Another Card</h4>
                <p className="text-text-body text-body-sm">More content here with consistent styling.</p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-lg p-6">
                <h4 className="text-text-headings text-body-lg font-(weight-semibold) mb-2">Third Card</h4>
                <p className="text-text-body text-body-sm">Even more content with design tokens.</p>
              </div>
            </div>
            <CodeExample code='<div className="bg-white border border-neutral-200 rounded-lg p-6">\n  <h4 className="text-text-headings text-body-lg font-(weight-semibold)">Card Title</h4>\n  <p className="text-text-body text-body-sm">Description</p>\n</div>' />
          </div>

          {/* Alerts */}
          <div>
            <h3 className="text-heading-h5 font-(weight-semibold) text-text-headings mb-4">Alerts</h3>
            <div className="space-y-3">
              <div className="bg-surface-success border border-border-success rounded-lg p-4">
                <p className="text-text-success font-(weight-semibold) text-body-md">✓ Success! Your changes have been saved.</p>
              </div>
              <div className="bg-surface-error border border-border-error rounded-lg p-4">
                <p className="text-text-error font-(weight-semibold) text-body-md">✕ Error! Something went wrong.</p>
              </div>
              <div className="bg-surface-warning border border-border-warning rounded-lg p-4">
                <p className="text-warning-600 font-(weight-semibold) text-body-md">⚠ Warning! Please review your input.</p>
              </div>
              <div className="bg-surface-information border border-border-information rounded-lg p-4">
                <p className="text-information-600 font-(weight-semibold) text-body-md">ℹ Info: New features available!</p>
              </div>
            </div>
            <CodeExample code='<div className="bg-surface-success border border-border-success rounded-lg p-4">\n  <p className="text-text-success font-(weight-semibold)">Success message</p>\n</div>' />
          </div>

          {/* Form Inputs */}
          <div>
            <h3 className="text-heading-h5 font-(weight-semibold) text-text-headings mb-4">Form Inputs</h3>
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-text-body text-body-sm font-(weight-semibold) mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:border-border-focus focus:outline-none text-body-md"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-text-body text-body-sm font-(weight-semibold) mb-2">Password</label>
                <input
                  type="password"
                  className="w-full border border-border-error rounded-lg px-4 py-3 focus:outline-none text-body-md"
                  placeholder="Enter password"
                />
                <p className="text-text-error text-body-sm mt-2">Password is required</p>
              </div>
              <div >
                <label className="block text-text-body text-body-sm font-(weight-semibold) mb-2">Disabled Input</label>
                <input
                  type="text"
                  disabled
                  className="w-full border border-border-disabled bg-surface-disabled text-text-disabled rounded-lg px-4 py-3 cursor-not-allowed text-body-md"
                  placeholder="Disabled"
                />
              </div>
            </div>
            <CodeExample code='<input\n  type="email"\n  className="border border-neutral-300 rounded-lg px-4 py-3 focus:border-border-focus text-body-md"\n  placeholder="Enter your email"\n/>' />
          </div>
        </div>
      </Section>
    </div>
  )
}

// Helper Components
function Section({ title, children }) {
  return (
    <section className="mb-16">
      <h2 className="text-heading-h3 font-(weight-bold) text-text-headings mb-6 pb-3 border-b-2 border-neutral-200">{title}</h2>
      {children}
    </section>
  )
}

function ColorSwatch({ color, name }) {
  const isDark = name.includes('-500') || name.includes('-600') || name.includes('-700') || name.includes('black');
  return (
    <div className="flex flex-col items-center">
      <div className={`${color} w-24 h-24 rounded-lg mb-2 shadow-sm flex items-center justify-center`}>
        <span className={`text-xs font-(weight-semibold) ${isDark ? 'text-white' : 'text-neutral-700'}`}>
          {name.split('-').pop()}
        </span>
      </div>
      <span className="text-xs text-neutral-600 text-center font-(weight-regular)">{name}</span>
    </div>
  )
}

function TextExample({ className, label, children }) {
  return (
    <div className="mb-3">
      <p className={`${className} mb-1`}>{children}</p>
      <code className="text-xs text-neutral-500 font-(weight-regular)">{label}</code>
    </div>
  )
}

function SpacingDemo({ size, value }) {
  // Map size to actual padding value for visual representation
  const paddingMap = {
    '3xs': 'p-[0.125rem]',
    '2xs': 'p-[0.25rem]',
    'xs': 'p-[0.5rem]',
    'sm': 'p-[0.75rem]',
    'md': 'p-[1rem]',
    'lg': 'p-[1.5rem]',
    'xl': 'p-[2rem]',
    '2xl': 'p-[3rem]',
    '3xl': 'p-[4rem]',
    '1': 'p-1',
    '2': 'p-2',
    '4': 'p-4',
    '6': 'p-6',
    '8': 'p-8',
  };

  return (
    <div className="flex items-center gap-4">
      <div className={`bg-primary-400 flex items-center justify-center text-white text-xs font-(weight-semibold) ${paddingMap[size]}`}>
        p-{size}
      </div>
      <div className="flex-1">
        <span className="text-sm text-text-body font-(weight-regular)">{size}</span>
        <span className="text-xs text-neutral-500 ml-2">({value})</span>
      </div>
    </div>
  )
}

function BorderRadiusDemo({ radius, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`bg-primary-400 w-24 h-24 rounded-${radius} mb-2 shadow-sm`}></div>
      <span className="text-xs text-neutral-600 font-(weight-regular)">{label}</span>
    </div>
  )
}

function CodeExample({ code }) {
  return (
    <pre className="bg-neutral-700 text-white p-4 rounded-lg overflow-x-auto text-sm mt-6 font-(weight-regular)">
      <code>{code}</code>
    </pre>
  )
}

export default DesignSystemShowcase
