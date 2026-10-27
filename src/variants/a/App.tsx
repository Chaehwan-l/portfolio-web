import { MotionConfig } from "motion/react";
import { FloatingNav, Hero } from "@/components/Hero";
import { About, Approach, Marquee } from "@/sections/Intro";
import { Cases } from "@/sections/Cases";
import { OtherWork, SideProjects, StackEdu } from "@/sections/More";
import { Flow } from "@/sections/Flow";
import { Contact } from "@/sections/Contact";

/* Section order alternates dark → light sheets; each sheet rises over the previous one. */
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a href="#cases" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-[#D7E2EA] focus:px-4 focus:py-2 focus:text-[#0C0C0C]">
        본문으로 건너뛰기
      </a>
      <FloatingNav />
      <main className="overflow-x-clip bg-[#0C0C0C]">
        <Hero />
        <Marquee />
        <About />
        <Approach />
        <Cases />
        <OtherWork />
        <Flow />
        <SideProjects />
        <StackEdu />
        <Contact />
      </main>
    </MotionConfig>
  );
}
