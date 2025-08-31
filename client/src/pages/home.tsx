import HeroSection from "@/components/hero-section";
import InteractiveGame from "@/components/interactive-game";
import MysterySection from "@/components/mystery-section";
import SocialMediaSection from "@/components/social-media-section";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Background Cannabis Pattern */}
      <div className="fixed inset-0 cannabis-bg"></div>
      
      {/* Floating Cannabis Leaves Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-8 h-8 opacity-10 animate-float" style={{ animationDelay: '0s' }}>
          <img 
            src="https://images.unsplash.com/photo-1601049676869-702ea24cfd58?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
            alt="Cannabis leaf" 
            className="w-full h-full object-contain filter invert" 
          />
        </div>
        <div className="absolute top-32 right-20 w-6 h-6 opacity-15 animate-float" style={{ animationDelay: '1s' }}>
          <img 
            src="https://images.unsplash.com/photo-1601049676869-702ea24cfd58?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
            alt="Cannabis leaf" 
            className="w-full h-full object-contain filter invert" 
          />
        </div>
        <div className="absolute bottom-40 left-1/4 w-10 h-10 opacity-10 animate-float" style={{ animationDelay: '2s' }}>
          <img 
            src="https://images.unsplash.com/photo-1601049676869-702ea24cfd58?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
            alt="Cannabis leaf" 
            className="w-full h-full object-contain filter invert" 
          />
        </div>
        <div className="absolute top-1/2 right-10 w-7 h-7 opacity-12 animate-float" style={{ animationDelay: '0.5s' }}>
          <img 
            src="https://images.unsplash.com/photo-1601049676869-702ea24cfd58?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
            alt="Cannabis leaf" 
            className="w-full h-full object-contain filter invert" 
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        <HeroSection />
        <InteractiveGame />
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
              © 2024 Elevation. Premium cannabis experiences coming soon.
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
