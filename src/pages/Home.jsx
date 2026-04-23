import { useNavigate } from 'react-router-dom'
import { Button } from '../components/index.js'
import { Field } from '../components/index.js'


export default function Home() {
  const navigate = useNavigate()
  return (
    <>

    <div className="min-h-screen flex justify-center items-center bg-neutral-100">
    <div className="max-w-3xl w-full flex flex-col items-center gap-8 text-center">

      <h1 className = "text-heading-h3 text-text-headings">
        Take control of your health today
      </h1>

      <p className = "text-body-sm text-text-body">
        EU brings together meal planning and workout guidance in one place, whether you're managing a chronic condition or simply want to feel better. Start building the life you deserve.
      </p>

      <Button variant='primary' size='sm'>Begin</Button>
      </div>
      
    </div>

    <div className='min-h-screen flex items-center justify-center bg-white flex-col '>
      <div className='max-w-3xl w-full flex flex-col items-center gap-8 text-center'>
        <h1 className = "text-heading-h3 text-text-headings">
        Meals built for your condition
      </h1>
      <p className = "text-body-sm text-text-body">
      Whether you're managing diabetes, heart disease, or simply following a diet, we build meals that fit your needs.
      </p>

      </div>



{/* left column: text content, right: image */}
<div className = "px-16 py-8  ">

    <div className='flex mt-8 gap-24 w-full items-center '>

      {/* left column */}
        <div className='flex flex-col gap-4 flex-1 '>
          <div className='flex flex-col'>
          <h1 className= "text-body-lg">Nutrition that works</h1>
          <p className = "text-body-sm text-text-body">Eat right for your body.
             EU builds meals around your condition, not against it.</p>
             
          </div>
<hr />
          <div className='flex flex-col'>
          <h1 className= "text-body-lg text-secondary-400">Movement on your terms</h1>
          <p className = "text-body-sm text-secondary-200">Move the way you need to move. Build strength, endurance, or just feel better in your own skin.</p>
          </div>
          <hr />
          <div className='flex flex-col'>
          <h1 className= "text-body-lg text-secondary-400 ">Healing that sticks</h1>
          <p className = "text-body-sm text-secondary-200">Heal from injury or fix what's been holding you back. Step-by-step guidance that actually works.</p>
          </div>
<hr />

        </div>

        {/* right side */}
        <div className='flex-1'>
        <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWVhbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60" 
        alt="Healthy meal" 
        className='w-full h-auto rounded-lg shadow-md' />
        </div>
        
      </div>

    </div>

</div>


<div className="min-h-screen flex flex-col gap-16 justify-center">

  
  <div className="flex gap-16 items-start px-30">
    
    <div className="flex-1 text-heading-h3 text-text-headings">
      Meals designed for your health
    </div>

    <div className="flex-1 text-body-md text-text-body">
      EU creates meal plans that account for your condition, your preferences, and what your body actually needs. No guessing. No generic diets that don't fit.
    </div>
  </div>

  
  <div className="grid grid-cols-4 gap-4">
    <img src="img1.jpg" className="w-full h-40 object-cover rounded-lg" />
    <img src="img2.jpg" className="w-full h-40 object-cover rounded-lg" />
    <img src="img3.jpg" className="w-full h-40 object-cover rounded-lg" />
    <img src="img4.jpg" className="w-full h-40 object-cover rounded-lg" />

    <img src="img5.jpg" className="w-full h-40 object-cover rounded-lg" />
    <img src="img6.jpg" className="w-full h-40 object-cover rounded-lg" />
    <img src="img7.jpg" className="w-full h-40 object-cover rounded-lg" />
    <img src="img8.jpg" className="w-full h-40 object-cover rounded-lg" />
  </div>

</div>


<div className="grid grid-cols-2 gap-6 min-h-screen px-30 py-20">

  {/* LEFT BIG CARD */}
  <div className="row-span-2 bg-neutral-400 p-6 flex flex-col justify-center text-center">
    
    <h2 className="text-heading-h4 text-text-headings mb-4 text-white">
      Rehabilitation built to restore your strength
    </h2>

    <p className="text-body-md text-text-body text-white">
      Injury slows you down. A bad back stops you cold. HealthPlan Hub guides you through recovery with programs that work, whether you're healing from surgery or fixing posture that's held you back for years.
    </p>
    <Button variant='primary' size='md' className='mt-6 self-center'>Start</Button>

  </div>

  {/* TOP RIGHT CARD */}
  <div className="bg-neutral-200 p-6 border border-neutral-200 flex flex-col justify-center text-center">
    
    <h3 className="text-body-lg text-text-headings mb-2">
      Recover from injury
    </h3>

    <p className="text-body-sm text-text-body">
      Guided programs take you from pain to strength with exercises built for healing.
    </p>

  </div>

  {/* BOTTOM RIGHT CARD */}
  <div className="bg-neutral-200 p-6 border border-neutral-200 flex flex-col justify-center text-center">
    
    <h3 className="text-body-lg text-text-headings mb-2">
      Fix your posture
    </h3>

    <p className="text-body-sm text-text-body">
      Years of bad habits end here. Step-by-step corrections that stick and feel natural.
    </p>

  </div>

</div>



  <div className="min-h-screen flex flex-col gap-16 items-center justify-center px-16">

  {/* TEXT SECTION */}
  <div className="flex flex-col gap-6 text-center max-w-3xl">
    <h1 className="text-heading-h1 text-text-headings">
      Workouts that fit how you actually live
    </h1>

    <p className="text-body-md text-text-body">
      Build strength or maintain it. Run faster or just run. EU adapts to where you are now and takes you where you want to go, at your pace, on your schedule.
    </p>
  </div>
<div className="grid grid-cols-3 gap-6 w-full max-w-6xl auto-rows-fr">

  <div className="bg-neutral-300 p-6 flex flex-col justify-end h-full min-h-[280px]">
    <h3 className="text-body-lg text-white mb-2">
      Strength training for real results
    </h3>
    <p className="text-body-sm text-white">
      Build muscle and power at your own pace with programs that meet you where you are.
    </p>
  </div>

  <div className="bg-neutral-300 p-6 flex flex-col justify-end h-full min-h-[280px]">
    <h3 className="text-body-lg text-white mb-2">
      Run longer, stronger, and smarter
    </h3>
    <p className="text-body-sm text-white">
      Whether it's your first mile or your hundredth, we guide you forward without burning out.
    </p>
  </div>

  <div className="bg-neutral-300 p-6 flex flex-col justify-end h-full min-h-[280px]">
    <h3 className="text-body-lg text-white mb-2">
      Move freely and feel the difference
    </h3>
    <p className="text-body-sm text-white">
      Loosen tight muscles and improve your range of motion with routines that fit your schedule.
    </p>
  </div>

</div>

</div>

<div className="min-h-screen flex items-center px-16 py-20">
  
  {/* LEFT: TEXT */}
  <div className="flex-1 flex flex-col gap-6">
    <h2 className="text-heading-h1 text-text-headings">
      Start your journey now
    </h2>

    <p className="text-body-md text-text-body">
      Your workouts adapt to your body, your progress, and your lifestyle.
      No rigid plans. Just movement that makes sense for you.
    </p>

    <Button variant='primary' size='md' className='self-start' onClick={() => navigate('/signup')}>
      Begin
    </Button>
  </div>

  {/* RIGHT: IMAGE */}
  <div className="flex-1 flex justify-center items-center">
    <img
      src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438"
      alt="Workout"
      className="w-full max-w-md rounded-lg shadow-lg object-cover"
    />
  </div>

</div>

<div className="min-h-screen flex flex-col gap-16 items-center justify-center px-16">

    <h1 className="text-heading-h1 text-text-headings">
      Questions
    </h1>

    <p className="text-body-md text-text-body">
      Still wondering if EU is right for you? Check out our FAQs or reach out to our support team. We're here to help you take control of your health and wellness.
    </p>


    <h1 className="text-heading-h1 text-text-headings">
      Still have questions?
    </h1>

    <p className="text-body-md text-text-body">
      Reach out to our support team anytime.
    </p>
  <Button variant="primary" size="md" onClick={() => navigate('/contact')}>
  Contact
</Button>

  </div>


<div className="bg-neutral-300 p-8 rounded-lg flex gap-12 items-center justify-center">

  {/* LEFT SIDE */}
  <div className="flex-1 flex flex-col gap-8">
    <h1 className="text-heading-h3 text-text-headings">
      Get health tips weekly
    </h1>

    <p className="text-body-sm text-text-body max-w-md">
      Subscribe for meal ideas, workout tips, and stories from people like you.
    </p>
  </div>

  {/* RIGHT SIDE */}
  <div className="flex-1 flex justify-center">
    <div className="w-full max-w-md flex flex-col gap-6">

      <Field
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="Enter your email"
        required
      />

      <button className="bg-primary-400 text-white px-6 py-3 rounded-lg hover:bg-primary-500">
        Subscribe
      </button>

    </div>
  </div>

</div>



</>

   
  )
}
