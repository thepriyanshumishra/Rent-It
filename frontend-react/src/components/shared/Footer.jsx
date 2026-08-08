import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[var(--bg-elevated)] border-t border-[var(--border)] pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent)] text-white font-black flex items-center justify-center">R</div>
              <span className="font-black text-xl text-[var(--text)]">RentIt</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] max-w-sm leading-relaxed">
              The premier enterprise rental management platform. Rent cameras, laptops, vehicles, and equipment with total security.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-extrabold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              <li><Link to="/explore" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Explore Fleet</Link></li>
              <li><Link to="/become-a-lender" className="text-sm font-bold text-[var(--accent)] hover:underline transition-colors flex items-center gap-1">Become a Lender (Earn 60%)</Link></li>
              <li><Link to="/my-rentals" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">My Rentals</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-extrabold text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-4">Support & Contact</h4>
            <ul className="space-y-2.5">
              <li className="text-sm text-[var(--text-muted)]">support@rentit.com</li>
              <li className="text-sm text-[var(--text-muted)]">+91 1800 123 4567</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border)] text-center">
          <p className="text-xs text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} RentIt Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
