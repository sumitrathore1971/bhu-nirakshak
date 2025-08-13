import React from "react";
import Hero from "./Hero";
import About from "./About";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import LiveMapPreview from "./LiveMapPreview";
import CallToAction from "./CallToAction";
import Footer from "../Footer";
import Navbar from "./Navbar";

export default function LandingPage() {
  return (
    <>
    <Navbar/>
      <Hero />
      <Features />
      <HowItWorks />
      <LiveMapPreview />
		  <About />
      <CallToAction />
      {/* <Footer /> */}
    </>
  );
}
