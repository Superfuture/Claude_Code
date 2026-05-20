import { useRef } from 'react';
import { Hero } from './sections/Hero';
import { Capabilities } from './sections/Capabilities';
import { Subscribe } from './sections/Subscribe';
import { Footer } from './sections/Footer';

export default function App() {
  const subscribeRef = useRef<HTMLElement>(null);

  const scrollToSubscribe = () => {
    subscribeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="bg-black min-h-screen">
      <Hero onCta={scrollToSubscribe} />
      <Capabilities />
      <Subscribe ref={subscribeRef} />
      <Footer />
    </main>
  );
}
