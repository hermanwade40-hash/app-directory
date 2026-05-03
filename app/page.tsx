import Image from 'next/image';

const services = [
  'Classic Haircuts',
  "Women\'s Styling",
  'Beard Grooming',
  'Color & Treatment',
  'Braids & Protective Styles',
  'Special Occasion Styling',
];

const gallery = [
  '/shop/phone.png',
  '/shop/top.png',
  '/shop/gloves.png',
  '/shop/weights.png',
  '/shop/shorts.png',
  '/shop/shoes.png',
];

export default function Page() {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-900">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/95 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-2xl font-semibold tracking-wide">Orellana&apos;s Studio</p>
            <p className="text-xs tracking-[0.35em] text-stone-500 uppercase">Salon & Barbershop</p>
          </div>
          <button className="rounded-md bg-emerald-900 px-5 py-2 text-sm font-medium text-white">BOOK NOW</button>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <p className="text-sm tracking-[0.3em] text-amber-700 uppercase">Beauty. Confidence. Crafted for you.</p>
          <h1 className="text-5xl leading-tight font-semibold md:text-7xl">Crafted, Not Rushed</h1>
          <p className="max-w-xl text-lg text-stone-600">
            Precision cuts, effortless style, and elevated grooming for everyone. Experience beauty and barbering crafted with intention.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-md bg-emerald-900 px-5 py-3 text-sm font-semibold text-white">BOOK YOUR APPOINTMENT</button>
            <button className="rounded-md border border-stone-300 px-5 py-3 text-sm font-semibold">VIEW SERVICES</button>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-700 via-stone-800 to-stone-950 p-2 shadow-2xl">
          <div className="h-[420px] rounded-xl bg-[radial-gradient(circle_at_20%_20%,#fff5,transparent_35%),radial-gradient(circle_at_80%_10%,#fbbf24,transparent_30%),linear-gradient(160deg,#444,#111)]" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-12">
        <h2 className="mb-6 text-center text-2xl font-semibold">Our Services</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article key={service} className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">{service}</h3>
              <p className="mt-2 text-sm text-stone-600">Tailored service focused on quality, style, and confidence.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-950 to-stone-900 p-8 text-white">
            <h2 className="text-4xl leading-tight font-semibold">Where Craftsmanship Meets Confidence</h2>
            <p className="mt-4 text-stone-200">
              Our skilled professionals take time to understand your style and goals. Every cut, color, and treatment is delivered with precision.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {['Expert Stylists', 'Premium Products', 'Personalized Care', 'Relaxed Experience'].map((item) => (
              <div key={item} className="rounded-xl border border-stone-200 bg-stone-50 p-5">
                <h3 className="font-semibold">{item}</h3>
                <p className="mt-1 text-sm text-stone-600">Dedicated to healthy, lasting results.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <h2 className="mb-6 text-center text-2xl font-semibold">Our Work</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {gallery.map((src) => (
            <div key={src} className="overflow-hidden rounded-xl border border-stone-200 bg-white">
              <Image src={src} alt="Gallery style" width={300} height={220} className="h-44 w-full object-cover" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
