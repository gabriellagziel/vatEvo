import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Vatevo</h3>
            <p className="text-gray-400">
              EU e-invoicing compliance made simple for SaaS companies.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/solutions" className="hover:text-white">Solutions</Link></li>
              <li><Link href="/demo" className="hover:text-white">Demo</Link></li>
              <li><a href="https://app-ezgnqzzi.fly.dev/docs" target="_blank" className="hover:text-white">API Docs</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Learn</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/vida" className="hover:text-white">What is ViDA?</Link></li>
              <li><Link href="/compare" className="hover:text-white">Comparison</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/contact" className="hover:text-white">Request Demo</Link></li>
              <li><a href="mailto:contact@vatevo.com" className="hover:text-white">contact@vatevo.com</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Vatevo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
