"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { SocialProof } from "@/components/landing/SocialProof";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { BlocksSection } from "@/components/landing/BlocksSection";
import { WhyDifferent } from "@/components/landing/WhyDifferent";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useUserStore();

  useEffect(() => {
    // If user is already logged in, redirect to their dashboard
    if (user) {
      if (user.role === "STUDENT") {
        router.push("/student/dashboard");
      } else if (user.role === "ADMIN" || user.role === "REVIEWER") {
        router.push("/admin");
      }
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <SocialProof />
        <FeaturesGrid />
        <HowItWorks />
        <BlocksSection />
        <WhyDifferent />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
