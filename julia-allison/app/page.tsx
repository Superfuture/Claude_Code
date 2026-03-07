import { Navbar } from "@/components/ui/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { VideoSection } from "@/components/sections/VideoSection";
import { PressMarquee } from "@/components/sections/PressMarquee";
import { SocialProof } from "@/components/sections/SocialProof";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/ui/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <VideoSection />
        <PressMarquee />
        <SocialProof />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
