import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiTiktok, SiInstagram, SiYoutube, SiTelegram } from "react-icons/si";

export default function SocialMediaSection() {
  const [email, setEmail] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email subscription functionality
    console.log("Email submitted:", email);
    setEmail("");
  };

  const socialPlatforms = [
    { icon: SiTiktok, name: "TikTok", color: "hover:bg-red-500", testId: "link-tiktok", url: "https://www.tiktok.com/@b2bluntz" },
    { icon: SiInstagram, name: "Instagram", color: "hover:bg-pink-500", testId: "link-instagram", url: "#" },
    { icon: SiYoutube, name: "YouTube", color: "hover:bg-red-600", testId: "link-youtube", url: "https://www.youtube.com/@b2bluntz" },
    { icon: SiTelegram, name: "Telegram", color: "hover:bg-blue-500", testId: "link-telegram", url: "https://t.me/b2blunt" }
  ];

  return (
    <section className="py-24 px-4 relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold text-foreground mb-6 animate-fade-in-up animate-text-glow" data-testid="social-title">
            Stay <span className="text-primary animate-pulse-slow">Connected</span>
          </h3>
          <div className="w-16 h-1 bg-primary mx-auto mb-8 animate-expand" style={{ animationDelay: '0.3s' }}></div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.6s' }} data-testid="social-description">
            Follow our journey across platforms. Exclusive content and early access await our community.
          </p>
        </div>
        
        {/* Social Media Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {socialPlatforms.map((platform, index) => (
            <a 
              key={platform.name}
              href={platform.url} 
              className="group relative animate-slide-in-up"
              style={{ animationDelay: `${0.9 + index * 0.1}s` }}
              data-testid={platform.testId}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-3xl p-8 text-center transition-all duration-300 hover:border-primary/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors animate-bounce-slow" style={{ animationDelay: `${index * 0.2}s` }}>
                  <platform.icon className="text-3xl text-primary group-hover:scale-110 transition-transform animate-pulse-glow" style={{ animationDelay: `${index * 0.3}s` }} />
                </div>
                <h4 className="text-foreground font-semibold mb-2">{platform.name}</h4>
                <p className="text-muted-foreground text-sm">Follow us</p>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-primary/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </a>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-br from-card to-card/30 border border-primary/20 rounded-3xl p-10 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '1.3s' }}>
          {/* Background Effect */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
              <div className="w-10 h-10 bg-primary rounded-2xl animate-pulse-glow"></div>
            </div>
            
            <h4 className="text-3xl font-bold text-primary mb-4" data-testid="newsletter-title">Get Early Access</h4>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto" data-testid="newsletter-description">
              Be the first to know when we launch. Exclusive previews for early supporters.
            </p>
            
            <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-background/50 border border-border/50 rounded-2xl px-6 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 backdrop-blur-sm"
                  required
                  data-testid="input-email"
                />
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 whitespace-nowrap"
                  data-testid="button-join-list"
                >
                  Join Waitlist
                </Button>
              </div>
            </form>
            
            <div className="flex items-center justify-center mt-6 space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-primary font-medium text-sm">Launching Soon</span>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
