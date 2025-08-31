import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiTiktok, SiInstagram, SiSnapchat, SiTelegram } from "react-icons/si";

export default function SocialMediaSection() {
  const [email, setEmail] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email subscription functionality
    console.log("Email submitted:", email);
    setEmail("");
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="text-3xl font-bold text-primary mb-8" data-testid="social-title">Stay Connected</h3>
        <p className="text-muted-foreground text-lg mb-12" data-testid="social-description">
          Follow our journey across platforms. Exclusive content and early access await.
        </p>
        
        {/* Social Media Links */}
        <div className="flex justify-center space-x-8 mb-12">
          {/* TikTok */}
          <a 
            href="#" 
            className="social-icon group transition-all duration-300 hover:-translate-y-1 hover:scale-110"
            data-testid="link-tiktok"
          >
            <div className="w-16 h-16 bg-card border border-border rounded-2xl flex items-center justify-center hover:bg-primary hover:border-primary transition-all group">
              <SiTiktok className="text-2xl text-muted-foreground group-hover:text-primary-foreground" />
            </div>
          </a>
          
          {/* Instagram */}
          <a 
            href="#" 
            className="social-icon group transition-all duration-300 hover:-translate-y-1 hover:scale-110"
            data-testid="link-instagram"
          >
            <div className="w-16 h-16 bg-card border border-border rounded-2xl flex items-center justify-center hover:bg-primary hover:border-primary transition-all group">
              <SiInstagram className="text-2xl text-muted-foreground group-hover:text-primary-foreground" />
            </div>
          </a>
          
          {/* Snapchat */}
          <a 
            href="#" 
            className="social-icon group transition-all duration-300 hover:-translate-y-1 hover:scale-110"
            data-testid="link-snapchat"
          >
            <div className="w-16 h-16 bg-card border border-border rounded-2xl flex items-center justify-center hover:bg-primary hover:border-primary transition-all group">
              <SiSnapchat className="text-2xl text-muted-foreground group-hover:text-primary-foreground" />
            </div>
          </a>
          
          {/* Telegram */}
          <a 
            href="#" 
            className="social-icon group transition-all duration-300 hover:-translate-y-1 hover:scale-110"
            data-testid="link-telegram"
          >
            <div className="w-16 h-16 bg-card border border-border rounded-2xl flex items-center justify-center hover:bg-primary hover:border-primary transition-all group">
              <SiTelegram className="text-2xl text-muted-foreground group-hover:text-primary-foreground" />
            </div>
          </a>
        </div>

        {/* Newsletter Signup Teaser */}
        <div className="bg-card border border-border rounded-xl p-8">
          <h4 className="text-xl font-semibold text-primary mb-4" data-testid="newsletter-title">Get Early Access</h4>
          <p className="text-muted-foreground mb-6" data-testid="newsletter-description">
            Be the first to know when we launch. Exclusive previews for early supporters.
          </p>
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              data-testid="input-email"
            />
            <Button 
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
              data-testid="button-join-list"
            >
              Join List
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
