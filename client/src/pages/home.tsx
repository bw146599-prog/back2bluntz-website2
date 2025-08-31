import HeroSection from "@/components/hero-section";
import MysterySection from "@/components/mystery-section";
import SocialMediaSection from "@/components/social-media-section";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        <HeroSection />
        <MysterySection />
        <SocialMediaSection />
        
        {/* Modern Footer */}
        <footer className="py-16 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-card/50 to-transparent"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            {/* Logo Area */}
            <div className="mb-8">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-primary rounded-xl"></div>
              </div>
              <h4 className="text-2xl font-bold text-primary mb-2">b2bluntz</h4>
            </div>
            
            {/* Copyright */}
            <div className="space-y-3">
              <p className="text-muted-foreground">
                © 2024 b2bluntz. Premium cannabis experiences coming soon.
              </p>
              <p className="text-muted-foreground text-sm border border-border/30 rounded-full px-6 py-2 inline-block">
                For adults 21+ only. Please consume responsibly.
              </p>
            </div>
            
            {/* Decorative Elements */}
            <div className="flex justify-center space-x-2 mt-8">
              <div className="w-2 h-2 bg-primary/50 rounded-full"></div>
              <div className="w-2 h-2 bg-primary/30 rounded-full"></div>
              <div className="w-2 h-2 bg-primary/50 rounded-full"></div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
