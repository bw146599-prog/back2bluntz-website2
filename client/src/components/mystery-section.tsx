export default function MysterySection() {
  return (
    <section className="py-24 px-4 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in-up animate-text-glow" data-testid="mystery-title">
            The <span className="text-primary animate-pulse-slow">Journey</span> Begins
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8 animate-expand" style={{ animationDelay: '0.3s' }}></div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.6s' }} data-testid="mystery-description">
            We're cultivating something extraordinary. A premium experience that transcends the ordinary.
          </p>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Main Feature Card */}
          <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-3xl p-8 relative overflow-hidden hover:border-primary/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 animate-slide-in-left" style={{ animationDelay: '0.9s' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float-slow"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 animate-bounce-slow">
                <div className="w-8 h-8 bg-primary rounded-xl animate-pulse-glow"></div>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Premium Cultivation</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Every product is carefully crafted with attention to detail, ensuring an unmatched experience for our community.
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <span className="text-primary font-semibold text-sm">In Development</span>
              </div>
            </div>
          </div>

          {/* Secondary Feature Card */}
          <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-3xl p-8 relative overflow-hidden hover:border-primary/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 animate-slide-in-right" style={{ animationDelay: '1.2s' }}>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '1s' }}></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                <div className="w-8 h-8 bg-primary rounded-xl animate-pulse-glow" style={{ animationDelay: '0.5s' }}></div>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Exclusive Community</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Join a select group of enthusiasts who appreciate quality and craftsmanship in every experience.
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span className="text-primary font-semibold text-sm">Building Community</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '1.5s' }}>
          <div className="inline-flex items-center space-x-3 bg-primary/10 border border-primary/30 rounded-full px-8 py-4 hover:scale-105 hover:bg-primary/15 transition-all duration-300 animate-float-slow">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            </div>
            <span className="text-primary font-semibold">Stay tuned for updates</span>
          </div>
        </div>
      </div>
    </section>
  );
}
