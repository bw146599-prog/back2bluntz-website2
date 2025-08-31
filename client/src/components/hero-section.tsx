export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
      {/* Gradient Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Brand Title with Special "2" Glow */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-7xl md:text-9xl font-black mb-4 tracking-tighter leading-none" data-testid="brand-title">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-purple-300">b</span>
            <span className="neon-white-glow text-white animate-pulse-glow">2</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-purple-300">bluntz</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-transparent mx-auto animate-expand"></div>
        </div>
        
        {/* Enhanced Tagline */}
        <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-2xl md:text-4xl text-foreground font-medium mb-4 tracking-wide animate-text-glow" data-testid="tagline">
            Something <span className="text-primary font-bold italic animate-pulse-slow">extraordinary</span> is growing...
          </p>
          <p className="text-lg md:text-xl text-muted-foreground font-light max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.6s' }}>
            Premium cannabis experiences that transcend the ordinary. Join the evolution.
          </p>
        </div>
        
        {/* Modern Coming Soon Badge */}
        <div className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.9s' }} data-testid="coming-soon-badge">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/30 rounded-2xl px-8 py-4 hover:scale-105 transition-all duration-300 animate-float-slow">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <span className="text-primary font-bold text-xl tracking-widest">COMING SOON</span>
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-6 hover:border-primary/50 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 animate-slide-in-left" style={{ animationDelay: '1.2s' }}>
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 mx-auto animate-bounce-slow">
              <div className="w-6 h-6 bg-primary rounded-full animate-pulse-glow"></div>
            </div>
            <h3 className="text-primary font-semibold mb-2">Premium Quality</h3>
            <p className="text-muted-foreground text-sm">Curated experiences beyond expectations</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-6 hover:border-primary/50 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 animate-slide-in-up" style={{ animationDelay: '1.4s' }}>
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 mx-auto animate-bounce-slow" style={{ animationDelay: '0.2s' }}>
              <div className="w-6 h-6 bg-primary rounded-full animate-pulse-glow" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <h3 className="text-primary font-semibold mb-2">Exclusive Access</h3>
            <p className="text-muted-foreground text-sm">Limited availability for true connoisseurs</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-6 hover:border-primary/50 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 animate-slide-in-right" style={{ animationDelay: '1.6s' }}>
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 mx-auto animate-bounce-slow" style={{ animationDelay: '0.4s' }}>
              <div className="w-6 h-6 bg-primary rounded-full animate-pulse-glow" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <h3 className="text-primary font-semibold mb-2">Community</h3>
            <p className="text-muted-foreground text-sm">Connect with like-minded enthusiasts</p>
          </div>
        </div>
      </div>
    </section>
  );
}
