'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { api } from '@/lib/api'; // Import the API instance

interface CompanyFormData {
  nome: string;
  descricao: string;
  context_prompt: string;
}

export default function NewCompanyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CompanyFormData>({
    nome: '',
    descricao: '',
    context_prompt: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/companies/add', formData); // Use api.post

      router.push('/dashboard');
    } catch (err: any) { // Use 'any' for broader error handling from axios
      const errorMessage = err.response?.data?.detail || err.message || 'Erro ao criar empresa';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Nova Empresa
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure sua empresa e receba um número WhatsApp oficial para começar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nome da Empresa *
          </label>
          <input
            type="text"
            name="nome"
            id="nome"
            required
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            placeholder="Ex: Minha Empresa"
          />
        </div>

        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descrição da Empresa
          </label>
          <textarea
            name="descricao"
            id="descricao"
            rows={3}
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            placeholder="Descreva sua empresa, produtos/serviços principais"
          />
        </div>

        <div>
          <label htmlFor="context_prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Instruções para o Chatbot *
          </label>
          <textarea
            name="context_prompt"
            id="context_prompt"
            rows={5}
            required
            value={formData.context_prompt}
            onChange={(e) => setFormData({ ...formData, context_prompt: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            placeholder="Ex: Você é um assistente da Minha Empresa, especializada em produtos para casa. Seja sempre cordial e ajude os clientes com informações sobre nossos produtos, preços e disponibilidade..."
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Estas instruções definem como seu chatbot irá interagir com os clientes.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-blue-800 dark:text-blue-300 font-medium mb-2">
            ℹ️ Sobre o Número do WhatsApp
          </h3>
          <p className="text-blue-700 dark:text-blue-400 text-sm">
            Ao criar sua empresa, você receberá automaticamente um número oficial do WhatsApp Business via Twilio. 
            Não é necessário fornecer um número próprio.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Criando...
            </div>
          ) : (
            'Criar Empresa'
          )}
        </button>
      </form>
    </div>
  );
}
