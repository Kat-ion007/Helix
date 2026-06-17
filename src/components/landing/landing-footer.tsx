"use client"

import Link from "next/link"

export function LandingFooter() {
  const productLinks = [
    { name: "Features", href: "#features" },
    { name: "Solutions", href: "#solutions" },
    { name: "Product Walkthrough", href: "/login" },
    { name: "Security Standards", href: "#" },
  ]

  const companyLinks = [
    { name: "About Helix", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Contact Operations", href: "#contact" },
  ]

  const legalLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
  ]

  return (
    <footer className="bg-surface-raised border-t border-border/60 py-12 text-xs text-text-secondary select-none">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Company Info (Col: 5) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 text-text-primary font-bold text-base hover:opacity-90">
            <div className="bg-accent text-black font-extrabold w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 select-none">
              H
            </div>
            <span>Helix</span>
          </Link>
          <p className="max-w-xs leading-relaxed text-text-secondary">
            Helix is a high-speed customer operations workspace designed to reduce context-switching and accelerate ticket resolution.
          </p>
        </div>

        {/* Links Column 1: Product (Col: 3) */}
        <div className="md:col-span-3 flex flex-col gap-3">
          <h4 className="font-bold text-text-primary uppercase tracking-wider text-[10px]">Product</h4>
          <ul className="flex flex-col gap-2">
            {productLinks.map((link, idx) => (
              <li key={idx}>
                <a href={link.href} className="hover:text-text-primary transition-colors">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Links Column 2: Company (Col: 2) */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <h4 className="font-bold text-text-primary uppercase tracking-wider text-[10px]">Company</h4>
          <ul className="flex flex-col gap-2">
            {companyLinks.map((link, idx) => (
              <li key={idx}>
                <a href={link.href} className="hover:text-text-primary transition-colors">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Links Column 3: Legal (Col: 2) */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <h4 className="font-bold text-text-primary uppercase tracking-wider text-[10px]">Legal</h4>
          <ul className="flex flex-col gap-2">
            {legalLinks.map((link, idx) => (
              <li key={idx}>
                <a href={link.href} className="hover:text-text-primary transition-colors">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-6 border-t border-border/30 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>© {new Date().getFullYear()} Helix Inc. All rights reserved.</span>
        <span className="text-[10px] text-text-muted">Designed & Optimized for B2B Operations.</span>
      </div>
    </footer>
  )
}
