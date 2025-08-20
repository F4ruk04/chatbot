/**
 * Página de Empresas
 * Interface moderna para gestão de empresas
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import { companiesAPI, Company } from '@/lib/api';
import {
  Building2,
  Plus,
  Phone,
  Edit,
  Trash2,
  Search,
  Calendar,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import axios from 'axios';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    whatsapp_phone_number: '',
    context_prompt: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companiesAPI.getAll();
      setCompanies(data);
    } catch (err: unknown) {
      let errorMessage = 'Erro ao carregar empresas';
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingCompany) {
        await companiesAPI.update(editingCompany.id, formData);
      } else {
        await companiesAPI.create(formData);
      }
      
      // Limpar formulário e recarregar lista
      setFormData({
        nome: '',
        descricao: '',
        whatsapp_phone_number: '',
        context_prompt: '',
      });
      setShowForm(false);
      setEditingCompany(null);
      await loadCompanies();
    } catch (err: unknown) {
      let formErrorMessage = (editingCompany ? 'Erro ao atualizar empresa' : 'Erro ao criar empresa');
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        formErrorMessage = err.response.data.detail;
      }
      setFormError(formErrorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar esta empresa?')) {
      try {
        await companiesAPI.delete(id);
        await loadCompanies();
      } catch (err: unknown) {
        let deleteErrorMessage = 'Erro ao deletar empresa';
        if (axios.isAxiosError(err) && err.response?.data?.detail) {
          deleteErrorMessage = err.response.data.detail;
        }
        setError(deleteErrorMessage);
        console.error(err);
      }
    }
  };

  const filteredCompanies = companies.filter(company => {
    // Filtrar por termo de pesquisa
    const matchesSearch = company.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Esconder empresa que está sendo editada
    const isNotBeingEdited = !editingCompany || company.id !== editingCompany.id;
    
    return matchesSearch && isNotBeingEdited;
  });

  if (loading) {
    return (
      <Layout>
        <AuthGuard>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </AuthGuard>
      </Layout>
    );
  }

  return (
    <Layout>
      <AuthGuard>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Empresas
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Gerencie suas empresas e configure os chatbots
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base"
            >
              <Plus className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden xs:inline">Adicionar </span>Empresa
            </button>
          </div>

          {/* Barra de pesquisa e filtros */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {/* Removido botão de filtros por enquanto */}
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-400">{error}</span>
              </div>
            </div>
          )}

          {/* Formulário de criação */}
          {showForm && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingCompany ? 'Editar Empresa' : 'Adicionar Nova Empresa'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {editingCompany ? 'Atualize os dados da sua empresa' : 'Configure os dados da sua empresa para o chatbot'}
                </p>
              </div>
              
              <div className="p-6">
                {formError && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-red-700 dark:text-red-400">{formError}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nome da Empresa */}
                    <div className="md:col-span-2">
                      <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome da Empresa *
                      </label>
                      <input
                        type="text"
                        name="nome"
                        id="nome"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Nome da sua empresa"
                        value={formData.nome}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Descrição */}
                    <div className="md:col-span-2">
                      <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Descrição
                      </label>
                      <textarea
                        name="descricao"
                        id="descricao"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="Breve descrição da empresa"
                        value={formData.descricao}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Número do WhatsApp */}
                    <div>
                      <label htmlFor="whatsapp_phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Número do WhatsApp *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          name="whatsapp_phone_number"
                          id="whatsapp_phone_number"
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="+351912345678"
                          value={formData.whatsapp_phone_number}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contexto para o Chatbot */}
                  <div>
                    <label htmlFor="context_prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contexto para o Chatbot
                    </label>
                    <textarea
                      name="context_prompt"
                      id="context_prompt"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Descreva o contexto da sua empresa para o chatbot responder adequadamente..."
                      value={formData.context_prompt}
                      onChange={handleChange}
                    />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Este texto ajudará o chatbot a responder de forma mais personalizada aos seus clientes.
                    </p>
                  </div>

                  {/* Botões */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingCompany(null);
                        setFormData({
                          nome: '',
                          descricao: '',
                          whatsapp_phone_number: '',
                          context_prompt: '',
                        });
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {formLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {editingCompany ? 'Salvando...' : 'Criando...'}
                        </div>
                      ) : (
                        editingCompany ? 'Salvar Alterações' : 'Criar Empresa'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Lista de empresas */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchTerm ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa registada'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm ? 'Tente ajustar os termos de pesquisa.' : 'Comece por adicionar a sua primeira empresa.'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Adicionar Empresa
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCompanies.map((company) => (
                  <div key={company.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {company.nome}
                            </h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 w-fit">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativo
                            </span>
                          </div>
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {company.descricao || 'Sem descrição'}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{company.whatsapp_phone_number}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">Criado em {new Date(company.created_at).toLocaleDateString('pt-PT')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end space-x-1 sm:space-x-2 flex-shrink-0">
                        <button
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => {
                            setEditingCompany(company);
                            setFormData({
                              nome: company.nome,
                              descricao: company.descricao || '',
                              whatsapp_phone_number: company.whatsapp_phone_number,
                              context_prompt: company.context_prompt || '',
                            });
                            setShowForm(true);
                          }}
                          aria-label="Editar empresa"
                        >
                          <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          aria-label="Deletar empresa"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </div>
                    {company.context_prompt && (
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center mb-2">
                          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-2 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Contexto do Chatbot</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                          {company.context_prompt}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AuthGuard>
    </Layout>
  );
}
