import Hero from "../components/home/Hero";
import FeaturedCategories from "../components/home/FeaturedCategories";
import WhyChooseUs from "../components/home/WhyChooseUs";
import Gallery from "../components/home/Gallery";
import HowItWorks from "../components/home/HowItWorks";
import FAQ from "../components/home/FAQ";
import CTASection from "../components/home/CTASection";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <WhyChooseUs />
      <Gallery />
      <HowItWorks />
      <FAQ />
      <CTASection />
    </>
  );
}
