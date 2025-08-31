export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-4">
      <div className="max-w-4xl mx-auto">
        {/* Brand Title */}
        <h1 className="text-6xl md:text-8xl font-bold text-primary mb-6 animate-glow tracking-tight" data-testid="brand-title">
          ELEVATION
        </h1>
        
        {/* Mysterious Tagline */}
        <p className="text-xl md:text-3xl text-muted-foreground mb-8 font-light tracking-wide" data-testid="tagline">
          Something extraordinary is <span className="text-primary font-semibold">growing</span>...
        </p>
        
        {/* Coming Soon Badge */}
        <div className="inline-block bg-card border border-border rounded-full px-8 py-4 mb-12" data-testid="coming-soon-badge">
          <span className="text-primary font-semibold text-lg tracking-widest">COMING SOON</span>
        </div>

        {/* Teaser Text */}
        <div className="max-w-2xl mx-auto mb-16">
          <p className="text-muted-foreground text-lg leading-relaxed" data-testid="teaser-text">
            Premium cannabis experiences await. Be among the first to discover what lies beyond the ordinary.
          </p>
        </div>
      </div>
    </section>
  );
}
