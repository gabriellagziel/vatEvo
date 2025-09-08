"use client";

import React from "react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Vatevo
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/vida" className="text-gray-700 hover:text-gray-900">
              ViDA
            </Link>
            <Link href="/solutions" className="text-gray-700 hover:text-gray-900">
              Solutions
            </Link>
            <Link href="/compare" className="text-gray-700 hover:text-gray-900">
              Compare
            </Link>
            <Link href="/demo" className="text-gray-700 hover:text-gray-900">
              Demo
            </Link>
            <Link href="/contact">
              <Button>Request Demo</Button>
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-gray-900"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/vida"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900"
                onClick={() => setIsOpen(false)}
              >
                ViDA
              </Link>
              <Link
                href="/solutions"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900"
                onClick={() => setIsOpen(false)}
              >
                Solutions
              </Link>
              <Link
                href="/compare"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900"
                onClick={() => setIsOpen(false)}
              >
                Compare
              </Link>
              <Link
                href="/demo"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900"
                onClick={() => setIsOpen(false)}
              >
                Demo
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2"
                onClick={() => setIsOpen(false)}
              >
                <Button className="w-full">Request Demo</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
