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
        
        {/* Footer */}
        <footer className="py-12 px-4 border-t border-border">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <img 
                src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100" 
                alt="Cannabis plant silhouette" 
                className="mx-auto opacity-20 h-16 w-auto object-contain" 
              />
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 b2bluntz. Premium cannabis experiences coming soon.
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              For adults 21+ only. Please consume responsibly.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
