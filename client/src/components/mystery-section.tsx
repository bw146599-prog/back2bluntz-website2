export default function MysterySection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-card border border-border rounded-2xl p-12">
          {/* Cannabis botanical illustration background */}
          <div className="relative">
            <div className="absolute inset-0 opacity-5">
              <img 
                src="https://pixabay.com/get/g7201461a8e513b2f59085dd2ab320e169d690e83d247c3101e427f4184238bb6ae26a1c3eaed9491df962ccf7df414d43bca13556afa4f843a3d798935a4dfd1_1280.jpg" 
                alt="Cannabis botanical illustration" 
                className="w-full h-full object-cover rounded-xl" 
              />
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-primary mb-6" data-testid="mystery-title">The Journey Begins</h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8" data-testid="mystery-description">
                We're cultivating something special. A premium experience that transcends the ordinary. 
                Follow our journey and be the first to know when we unlock the next level.
              </p>
              <div className="flex justify-center space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
