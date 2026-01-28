"use client";

import { useState } from "react";
import { Menu, X, Download, Smartphone, Zap, Shield, Users } from "lucide-react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-sm z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">AppModerno</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="hover:text-green-400 transition-colors">
                Recursos
              </a>
              <a href="#about" className="hover:text-blue-400 transition-colors">
                Sobre
              </a>
              <a href="#download" className="hover:text-red-400 transition-colors">
                Download
              </a>
              <a href="#contact" className="hover:text-purple-400 transition-colors">
                Contato
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            <div className="px-4 py-4 space-y-3">
              <a
                href="#features"
                className="block py-2 hover:text-green-400 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Recursos
              </a>
              <a
                href="#about"
                className="block py-2 hover:text-blue-400 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Sobre
              </a>
              <a
                href="#download"
                className="block py-2 hover:text-red-400 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Download
              </a>
              <a
                href="#contact"
                className="block py-2 hover:text-purple-400 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Contato
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)]">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  O app mais{" "}
                  <span className="text-green-400">rápido</span>,{" "}
                  <span className="text-blue-400">seguro</span> e{" "}
                  <span className="text-red-400">intuitivo</span> do mercado
                </h1>
                <p className="text-lg sm:text-xl text-gray-400">
                  Disponível para iOS e Android. Baixe agora e experimente a
                  revolução mobile.
                </p>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#download"
                  className="inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all hover:scale-105 shadow-2xl"
                >
                  <Download className="w-5 h-5" />
                  App Store
                </a>
                <a
                  href="#download"
                  className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all hover:scale-105 shadow-2xl"
                >
                  <Download className="w-5 h-5" />
                  Google Play
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-800">
                <div>
                  <div className="text-3xl font-bold text-green-400">500K+</div>
                  <div className="text-sm text-gray-400">Downloads</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">4.9★</div>
                  <div className="text-sm text-gray-400">Avaliação</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-400">50K+</div>
                  <div className="text-sm text-gray-400">Reviews</div>
                </div>
              </div>
            </div>

            {/* Right Content - Mockup */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-blue-500/20 to-purple-500/20 blur-3xl rounded-full"></div>
                
                {/* Phone Mockup */}
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl border border-gray-700 w-[280px] sm:w-[320px] h-[560px] sm:h-[640px]">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-[2.5rem] w-full h-full flex items-center justify-center overflow-hidden">
                    <div className="text-center space-y-6 p-8">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mx-auto flex items-center justify-center">
                        <Smartphone className="w-10 h-10 text-white" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">
                          Bem-vindo!
                        </h3>
                        <p className="text-white/80 text-sm">
                          Seu app favorito agora ainda melhor
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-left">
                          <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-yellow-300" />
                            <span className="text-white text-sm">Ultra rápido</span>
                          </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-left">
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-green-300" />
                            <span className="text-white text-sm">100% seguro</span>
                          </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-left">
                          <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-blue-300" />
                            <span className="text-white text-sm">Comunidade ativa</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Recursos <span className="text-green-400">Incríveis</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Tudo que você precisa em um único app
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-green-500 transition-all hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Performance</h3>
              <p className="text-gray-400">
                Velocidade incomparável com tecnologia de ponta para uma
                experiência fluida.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-blue-500 transition-all hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Segurança</h3>
              <p className="text-gray-400">
                Seus dados protegidos com criptografia de nível militar e
                privacidade garantida.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-red-500 transition-all hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Comunidade</h3>
              <p className="text-gray-400">
                Junte-se a milhares de usuários satisfeitos e compartilhe
                experiências.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="download" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Baixe agora e descubra por que somos a escolha de milhares de
            usuários.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="inline-flex items-center justify-center gap-3 bg-white text-black px-10 py-5 rounded-xl font-semibold hover:bg-gray-200 transition-all hover:scale-105 shadow-2xl text-lg"
            >
              <Download className="w-6 h-6" />
              Baixar para iOS
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-blue-500 text-white px-10 py-5 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all hover:scale-105 shadow-2xl text-lg"
            >
              <Download className="w-6 h-6" />
              Baixar para Android
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">AppModerno</span>
              </div>
              <p className="text-gray-400 text-sm">
                O melhor app para iOS e Android.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Recursos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Preços
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#about" className="hover:text-white transition-colors">
                    Sobre
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    Contato
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Termos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Licença
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 AppModerno. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
