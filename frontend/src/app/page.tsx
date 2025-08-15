'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PricingSection from '@/components/Pricing';
import { 
  Menu, 
  X, 
  Brain, 
  MessageCircle, 
  BarChart3,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Animação de fade-in ao rolar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-in-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mr-3">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ChatBot SaaS</span>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
                Funcionalidades
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
                Preços
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors">
                Depoimentos
              </a>
              <a href="#faq" className="text-gray-700 hover:text-blue-600 transition-colors">
                FAQ
              </a>
            </nav>

            {/* CTA Button - Desktop */}
            <div className="hidden md:flex">
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                Comece Agora
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                Funcionalidades
              </a>
              <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                Preços
              </a>
              <a href="#testimonials" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                Depoimentos
              </a>
              <a href="#faq" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                FAQ
              </a>
              <Link
                href="/register"
                className="block mx-3 mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium text-center"
              >
                Comece Agora
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in-on-scroll">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Transforme seu WhatsApp em uma{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Máquina de Vendas Inteligente
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Crie chatbots personalizados com a IA do Google Gemini, integrados diretamente ao seu WhatsApp Business. 
                Atendimento 24/7, respostas instantâneas e contexto que entende o seu negócio.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Criar meu Chatbot Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="fade-in-on-scroll">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">WhatsApp Business</span>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-3 ml-8">
                    <p className="text-sm text-gray-700">Olá! Gostaria de saber mais sobre seus produtos.</p>
                  </div>
                  <div className="bg-blue-500 text-white rounded-lg p-3 mr-8">
                    <p className="text-sm">Olá! Claro, temos uma linha completa de produtos. Qual categoria te interessa mais?</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 ml-8">
                    <p className="text-sm text-gray-700">Produtos para casa</p>
                  </div>
                  <div className="bg-blue-500 text-white rounded-lg p-3 mr-8">
                    <p className="text-sm">Perfeito! Temos ótimas opções em decoração, utensílios e móveis. Posso te mostrar nosso catálogo?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow fade-in-on-scroll">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">IA Contextualizada com Gemini</h3>
              <p className="text-gray-600">
                Nossa IA aprende sobre seus produtos, serviços e configurações para oferecer respostas que parecem humanas.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow fade-in-on-scroll">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-6">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Integração Direta com WhatsApp</h3>
              <p className="text-gray-600">
                Conecte-se facilmente à sua conta do WhatsApp Business via Twilio, sem complicações técnicas.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow fade-in-on-scroll">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Dashboard de Analytics</h3>
              <p className="text-gray-600">
                Acompanhe o volume de mensagens, conversas ativas e o desempenho do seu chatbot em tempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comece a usar em 3 passos simples
            </h2>
            <p className="text-xl text-gray-600">
              Configure seu chatbot inteligente em minutos, não em dias
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center fade-in-on-scroll">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Registre-se e Conecte</h3>
              <p className="text-gray-600">
                Crie sua conta e conecte facilmente seu WhatsApp Business através da nossa integração segura com Twilio.
              </p>
            </div>

            <div className="text-center fade-in-on-scroll">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Configure sua IA</h3>
              <p className="text-gray-600">
                Insira informações sobre sua empresa, produtos e tom de voz. Nossa IA aprenderá seu contexto específico.
              </p>
            </div>

            <div className="text-center fade-in-on-scroll">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Receba Clientes</h3>
              <p className="text-gray-600">
                Pronto! Seu chatbot já está funcionando 24/7, respondendo clientes com inteligência e personalização.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600">
              Empresas de todos os tamanhos confiam em nossa solução
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg fade-in-on-scroll">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                &quot;Aumentamos nossa taxa de conversão em 40% desde que implementamos o chatbot. 
                As respostas são tão naturais que os clientes nem percebem que é uma IA.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold">MR</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Maria Rodriguez</p>
                  <p className="text-gray-600 text-sm">CEO, TechCorp</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg fade-in-on-scroll">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                &quot;A integração foi super simples e o suporte é excepcional. 
                Nossos clientes adoram o atendimento instantâneo, mesmo fora do horário comercial.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold">JS</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">João Silva</p>
                  <p className="text-gray-600 text-sm">Diretor de Marketing, InovaDigital</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg fade-in-on-scroll">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                &quot;ROI incrível! Reduzimos custos de atendimento em 60% e melhoramos a satisfação do cliente. 
                Recomendo para qualquer empresa que usa WhatsApp.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold">AC</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Ana Costa</p>
                  <p className="text-gray-600 text-sm">Gerente de Operações, MarketMinds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ainda tem dúvidas?
            </h2>
            <p className="text-xl text-gray-600">
              Encontre respostas para as perguntas mais frequentes
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Como funciona a integração com o WhatsApp?",
                answer: "Utilizamos a API oficial do Twilio para conectar seu WhatsApp Business de forma segura. O processo é simples: você autoriza a conexão e em poucos minutos seu chatbot está funcionando."
              },
              {
                question: "A IA realmente entende o contexto da minha empresa?",
                answer: "Sim! Nossa IA baseada no Google Gemini aprende sobre seus produtos, serviços, tom de voz e políticas. Quanto mais informações você fornecer, mais personalizada e precisa serão as respostas."
              },
              {
                question: "Posso cancelar minha assinatura a qualquer momento?",
                answer: "Claro! Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento através do painel de controle, e continuará tendo acesso até o final do período pago."
              },
              {
                question: "Existe limite de mensagens?",
                answer: "Depende do seu plano. O plano Básico tem limite de 1.000 mensagens/mês, o Profissional 5.000 mensagens/mês, e o Enterprise oferece mensagens ilimitadas."
              },
              {
                question: "Como é calculada a cobrança?",
                answer: "A cobrança é mensal e baseada no plano escolhido. Não cobramos por mensagem individual, apenas pelo plano mensal que inclui todas as funcionalidades descritas."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm fade-in-on-scroll">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="fade-in-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Pronto para revolucionar seu atendimento?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Junte-se a centenas de empresas que já transformaram seu WhatsApp em uma ferramenta de vendas poderosa
            </p>
            <Link
              href="/register"
              className="inline-flex items-center bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Comece Agora Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mr-3">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">ChatBot SaaS</span>
              </div>
              <p className="text-gray-400 mb-4">
                Transforme seu WhatsApp em uma máquina de vendas inteligente com nossa IA avançada.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre nós</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Imprensa</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                <li>
                  <a href="mailto:contato@chatbotsaas.com" className="hover:text-white transition-colors flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    contato@chatbotsaas.com
                  </a>
                </li>
                <li>
                  <a href="tel:+5511999999999" className="hover:text-white transition-colors flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    (11) 99999-9999
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 ChatBot SaaS. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Termos de Serviço
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
