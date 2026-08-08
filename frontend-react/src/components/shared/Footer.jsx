import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-bg-elevated border-t border-border mt-auto">
      <div className="container-app mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="20" fill="#6366f1"/>
                <text x="50" y="70" fontSize="60" fill="#fff" fontFamily="Inter, sans-serif" fontWeight="bold" textAnchor="middle">R</text>
              </svg>
              <span className="font-bold text-xl">RentOS</span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed">
              Premium rental marketplace for electronics, equipment, and more. 
              Rent what you need, only when you need it.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-medium text-text mb-4">Explore</h4>
            <ul className="space-y-3">
              <li><Link to="/explore" className="text-sm text-text-muted hover:text-text transition-colors">Browse Products</Link></li>
              <li><Link to="/explore?category=electronics" className="text-sm text-text-muted hover:text-text transition-colors">Electronics</Link></li>
              <li><Link to="/explore?category=furniture" className="text-sm text-text-muted hover:text-text transition-colors">Furniture</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-medium text-text mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link to="/faq" className="text-sm text-text-muted hover:text-text transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="text-sm text-text-muted hover:text-text transition-colors">Contact Us</Link></li>
              <li><Link to="/terms" className="text-sm text-text-muted hover:text-text transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-sm text-text-muted hover:text-text transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium text-text mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="text-sm text-text-muted">support@rentos.com</li>
              <li className="text-sm text-text-muted">+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border-subtle mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} RentOS Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Social placeholders */}
            <a href="#" className="text-text-muted hover:text-text"><div className="w-4 h-4 bg-current rounded-sm"></div></a>
            <a href="#" className="text-text-muted hover:text-text"><div className="w-4 h-4 bg-current rounded-sm transform rotate-45"></div></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
