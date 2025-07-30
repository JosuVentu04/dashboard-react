import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-black py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>
              © {new Date().getFullYear()} Marcel. Todos los derechos reservados.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="/about" className="text-gray-300 hover:text-white text-sm transition-colors">
              Acerca de
            </a>
            <a href="/privacy" className="text-gray-300 hover:text-white text-sm transition-colors">
              Privacidad
            </a>
            <a href="/contact" className="text-gray-300 hover:text-white text-sm transition-colors">
              Contacto
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}