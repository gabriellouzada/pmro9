import React, { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Search, Users, Trophy, TrendingUp, BookOpen, Target, ChevronDown, ChevronUp, Upload, RefreshCw, FileText, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function DashboardRelatorioEducacional() {
  const [studentsData, setStudentsData] = useState([]);
  const [summaryData, setSummaryData] = useState({});
  const [classificacaoData, setClassificacaoData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  
  // Estados para filtros e interface
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [showTopOnly, setShowTopOnly] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  // Função para processar o arquivo Excel
  const processExcelFile = useCallback((file) => {
    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Processar aba "Ranking IEA"
        const rankingSheetName = 'Ranking IEA';
        if (workbook.SheetNames.includes(rankingSheetName)) {
          const rankingSheet = workbook.Sheets[rankingSheetName];
          const rankingData = XLSX.utils.sheet_to_json(rankingSheet);
          
          // Processar dados dos estudantes
          const processedStudents = rankingData.map(row => ({
            ranking: row.RANKING || 0,
            nome: row.NOME || 'Nome não encontrado',
            escola: row.ESCOLA || 'Escola não encontrada',
            iea_score: parseFloat(row.IEA_SCORE) || 0,
            engajamento: parseFloat(row.ENGAJAMENTO_DIGITAL) || 0,
            progressao: parseFloat(row.PROGRESSAO_CURRICULAR) || 0,
            performance: parseFloat(row.PERFORMANCE_AVALIATIVA) || 0,
            persistencia: parseFloat(row.PERSISTENCIA_ACADEMICA) || 0
          })).filter(student => student.ranking > 0); // Filtrar linhas inválidas

          setStudentsData(processedStudents.sort((a, b) => a.ranking - b.ranking));

          // Calcular dados do resumo
          const totalEstudantes = processedStudents.length;
          const estudantesAtivos = processedStudents.filter(s => s.iea_score > 0).length;
          const taxaEngajamento = totalEstudantes > 0 ? (estudantesAtivos / totalEstudantes * 100).toFixed(1) : 0;
          const elegiveisAtividades = processedStudents.filter(s => s.iea_score >= 75).length;
          const pontuacaoMediaIEA = estudantesAtivos > 0 ? 
            (processedStudents.reduce((sum, s) => sum + s.iea_score, 0) / estudantesAtivos).toFixed(1) : 0;

          setSummaryData({
            totalEstudantes,
            estudantesAtivos,
            taxaEngajamento: parseFloat(taxaEngajamento),
            elegiveisAtividades,
            pontuacaoMediaIEA: parseFloat(pontuacaoMediaIEA)
          });

          // Calcular distribuição por classificação
          const classificacoes = processedStudents.reduce((acc, student) => {
            let classificacao = 'Insuficiente';
            if (student.iea_score >= 85) classificacao = 'Excelente';
            else if (student.iea_score >= 70) classificacao = 'Muito Bom';
            else if (student.iea_score >= 55) classificacao = 'Bom';
            else if (student.iea_score >= 40) classificacao = 'Regular';
            
            acc[classificacao] = (acc[classificacao] || 0) + 1;
            return acc;
          }, {});

          const cores = {
            'Excelente': '#10B981',
            'Muito Bom': '#3B82F6',
            'Bom': '#F59E0B',
            'Regular': '#F97316',
            'Insuficiente': '#EF4444'
          };

          setClassificacaoData(
            Object.entries(classificacoes).map(([classificacao, quantidade]) => ({
              classificacao,
              quantidade,
              color: cores[classificacao]
            }))
          );

          setFileUploaded(true);
          setActiveTab('ranking');
        } else {
          throw new Error('Aba "Ranking IEA" não encontrada no arquivo Excel');
        }

      } catch (err) {
        console.error('Erro ao processar Excel:', err);
        setError(`Erro ao processar arquivo: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  }, []);

  // Handler para upload de arquivo
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        processExcelFile(file);
      } else {
        setError('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      }
    }
  };

  // Filtrar dados
  const filteredStudents = useMemo(() => {
    return studentsData.filter(student => {
      const matchesSearch = student.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.escola.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSchool = selectedSchool === '' || student.escola === selectedSchool;
      const matchesTop = !showTopOnly || student.ranking <= 100;
      
      return matchesSearch && matchesSchool && matchesTop;
    });
  }, [studentsData, searchTerm, selectedSchool, showTopOnly]);

  const schools = useMemo(() => {
    return [...new Set(studentsData.map(s => s.escola))].sort();
  }, [studentsData]);

  const dimensionWeights = [
    { dimensao: 'Engajamento Digital', peso: 30, color: '#3B82F6' },
    { dimensao: 'Progressão Curricular', peso: 25, color: '#10B981' },
    { dimensao: 'Performance Avaliativa', peso: 25, color: '#F59E0B' },
    { dimensao: 'Persistência Acadêmica', peso: 20, color: '#EF4444' }
  ];

  const areaDistribution = [
    { name: 'Português', value: 20, color: '#3B82F6' },
    { name: 'Matemática', value: 22, color: '#10B981' },
    { name: 'Natureza', value: 20, color: '#F59E0B' },
    { name: 'Humanas', value: 20, color: '#EF4444' }
  ];

  // Card de Estatísticas
  const StatCard = ({ title, value, subtitle, icon: Icon, color = "#3B82F6", trend = null }) => (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 text-sm font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-8 h-8" style={{ color }} />
        </div>
      </div>
    </div>
  );

  // Card de Estudante Expandível
  const StudentCard = ({ student, rank }) => {
    const isExpanded = expandedCard === student.ranking;
    
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all duration-300">
        <div 
          className="p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => setExpandedCard(isExpanded ? null : student.ranking)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  rank <= 3 ? 'bg-yellow-500' : rank <= 10 ? 'bg-blue-500' : 'bg-gray-500'
                }`}>
                  {rank}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{student.nome}</h3>
                <p className="text-gray-600 text-sm">{student.escola}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{student.iea_score}</p>
                <p className="text-gray-500 text-sm">IEA Score</p>
              </div>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{student.engajamento}</p>
                <p className="text-gray-600 text-sm">Engajamento</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{student.progressao}</p>
                <p className="text-gray-600 text-sm">Progressão</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{student.performance}</p>
                <p className="text-gray-600 text-sm">Performance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{student.persistencia}</p>
                <p className="text-gray-600 text-sm">Persistência</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Preparar dados para radar chart dos top 3
  const radarData = useMemo(() => {
    if (studentsData.length < 3) return [];
    
    const top3 = studentsData.slice(0, 3);
    return [
      {
        dimension: 'Engajamento',
        [top3[0]?.nome || 'N/A']: top3[0]?.engajamento || 0,
        [top3[1]?.nome || 'N/A']: top3[1]?.engajamento || 0,
        [top3[2]?.nome || 'N/A']: top3[2]?.engajamento || 0
      },
      {
        dimension: 'Progressão',
        [top3[0]?.nome || 'N/A']: top3[0]?.progressao || 0,
        [top3[1]?.nome || 'N/A']: top3[1]?.progressao || 0,
        [top3[2]?.nome || 'N/A']: top3[2]?.progressao || 0
      },
      {
        dimension: 'Performance',
        [top3[0]?.nome || 'N/A']: top3[0]?.performance || 0,
        [top3[1]?.nome || 'N/A']: top3[1]?.performance || 0,
        [top3[2]?.nome || 'N/A']: top3[2]?.performance || 0
      },
      {
        dimension: 'Persistência',
        [top3[0]?.nome || 'N/A']: top3[0]?.persistencia || 0,
        [top3[1]?.nome || 'N/A']: top3[1]?.persistencia || 0,
        [top3[2]?.nome || 'N/A']: top3[2]?.persistencia || 0
      }
    ];
  }, [studentsData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center mb-4 lg:mb-0">
              {/* Logo do Sistema Somatório */}
              <div className="mr-6 flex-shrink-0">
                <div className="w-48 h-16 bg-white rounded-lg shadow-sm border border-gray-300 flex items-center justify-center">
                  <img src={`${process.env.PUBLIC_URL}/logo-somatorio.png`} alt="Sistema Somatório" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-1 text-gray-900">Relatório de Excelência Acadêmica</h1>
                <p className="text-gray-600 text-base lg:text-lg">Parceria Educacional - Preparatório 9º Ano</p>
                {fileUploaded && (
                  <p className="text-gray-700 text-sm mt-2">
                    ✅ Dados carregados: {studentsData.length} estudantes
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              {!fileUploaded && (
                <label className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors cursor-pointer flex items-center justify-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Carregar Excel
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
              {fileUploaded && (
                <label className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors cursor-pointer flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Atualizar Dados
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-center">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-blue-800 font-semibold">Processando arquivo Excel...</h3>
              <p className="text-blue-600 text-sm">Isso pode levar alguns segundos.</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-red-800 font-semibold">Erro ao carregar arquivo</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Screen */}
      {!fileUploaded && !loading && !error && (
        <div className="max-w-4xl mx-auto px-4 py-8 lg:py-16">
          <div className="card text-center p-8 lg:p-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              Carregue o Relatório Excel
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-sm lg:text-base">
              Faça upload do arquivo Excel gerado pelo sistema ETL para visualizar os dados de forma interativa. 
              O arquivo deve conter a aba "Ranking IEA" com os dados dos estudantes.
            </p>
            
            <label className="btn-primary inline-flex cursor-pointer">
              <Upload className="w-5 h-5 mr-2" />
              Selecionar Arquivo Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            
            <div className="mt-8 text-left max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-2">Instruções:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Execute o script ETL para gerar o arquivo Excel</li>
                <li>• Selecione o arquivo "Relatorio_Desempenho_Educacional.xlsx"</li>
                <li>• Aguarde o processamento dos dados</li>
                <li>• Explore os dados nas diferentes abas</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {fileUploaded && !loading && (
        <>
          {/* Stats Cards - Apenas 2 cards */}
          <div className="max-w-7xl mx-auto px-4 -mt-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                title="Estudantes Ativos"
                value={summaryData.estudantesAtivos || '0'}
                icon={BookOpen}
                color="#10B981"
              />
              <StatCard
                title="IEA Médio"
                value={summaryData.pontuacaoMediaIEA || '0'}
                subtitle="Índice de Excelência"
                icon={Target}
                color="#EF4444"
              />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="max-w-7xl mx-auto px-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-2">
              <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1">
                {[
                  { id: 'ranking', label: 'Ranking IEA', icon: Trophy },
                  { id: 'methodology', label: 'Metodologia', icon: BookOpen }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 pb-12">
            {/* Ranking Tab */}
            {activeTab === 'ranking' && (
              <div className="space-y-6 lg:space-y-8">
                {/* Filters */}
                <div className="card">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar estudante ou escola..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                      />
                    </div>
                    
                    <select
                      value={selectedSchool}
                      onChange={(e) => setSelectedSchool(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Todas as escolas</option>
                      {schools.map(school => (
                        <option key={school} value={school}>{school}</option>
                      ))}
                    </select>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showTopOnly}
                        onChange={(e) => setShowTopOnly(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700 text-sm lg:text-base">Apenas Top 100</span>
                    </label>
                    
                    <div className="text-left lg:text-right">
                      <span className="text-gray-600 text-sm lg:text-base">
                        Mostrando {filteredStudents.length} estudantes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Students List */}
                <div className="space-y-4">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <StudentCard key={student.ranking} student={student} rank={student.ranking} />
                    ))
                  ) : (
                    <div className="card text-center p-8 lg:p-12">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum estudante encontrado</h3>
                      <p className="text-gray-600">Tente ajustar os filtros para ver mais resultados.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics Tab - REMOVIDA */}

            {/* Methodology Tab */}
            {activeTab === 'methodology' && (
              <div className="card p-6 lg:p-8">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
                  Metodologia do Índice de Excelência Acadêmica (IEA)
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
                  {dimensionWeights.map((dimension, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: dimension.color }}
                        ></div>
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900 flex-1">
                          {dimension.dimensao}
                        </h3>
                        <span className="text-lg lg:text-xl font-bold" style={{ color: dimension.color }}>
                          {dimension.peso}%
                        </span>
                      </div>
                      <div className="text-gray-600 text-sm">
                        {index === 0 && "Frequência de acesso, diversidade de interações, consistência temporal"}
                        {index === 1 && "Taxa de conclusão geral, diversidade curricular por área, equilíbrio entre áreas"}
                        {index === 2 && "Tentativas de questionários, atualizações de notas"}
                        {index === 3 && "Taxa de conclusão de demonstrações, total de conclusões, atividades de retomada"}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Apenas Áreas do Conhecimento - Critérios de Elegibilidade REMOVIDOS */}
                <div className="max-w-md mx-auto">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 text-center">Áreas do Conhecimento</h3>
                  <div className="space-y-3">
                    {areaDistribution.map((area, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{area.name}</span>
                        <span className="text-gray-600">{area.value} módulos</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informações adicionais sobre os dados carregados */}
                {fileUploaded && studentsData.length > 0 && (
                  <div className="mt-8 p-4 lg:p-6 bg-blue-50 rounded-lg">
                    <h3 className="text-base lg:text-lg font-semibold text-blue-900 mb-3">
                      Informações dos Dados Carregados
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-blue-700 font-medium">Total de Estudantes</p>
                        <p className="text-blue-900 text-xl font-bold">{studentsData.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-blue-700 font-medium">Maior IEA Score</p>
                        <p className="text-blue-900 text-xl font-bold">
                          {Math.max(...studentsData.map(s => s.iea_score)).toFixed(1)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-blue-700 font-medium">Menor IEA Score</p>
                        <p className="text-blue-900 text-xl font-bold">
                          {Math.min(...studentsData.map(s => s.iea_score)).toFixed(1)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-blue-700 font-medium">Escolas Diferentes</p>
                        <p className="text-blue-900 text-xl font-bold">{schools.length}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Informações sobre a parceria */}
                <div className="mt-8 p-4 lg:p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3">
                    Sobre o Projeto
                  </h3>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>
                      <strong>Objetivo:</strong> Identificar estudantes do 9º ano com maior potencial acadêmico 
                      para participação em atividades extras preparatórias.
                    </p>
                    <p>
                      <strong>Metodologia:</strong> Análise multidimensional baseada em dados de engajamento digital, 
                      progressão curricular, performance avaliativa e persistência acadêmica.
                    </p>
                    <p>
                      <strong>Público-alvo:</strong> Estudantes da rede pública municipal em preparação 
                      para ingresso em instituições de ensino médio de prestígio.
                    </p>
                    <p>
                      <strong>Período de análise:</strong> Dados coletados durante o curso preparatório 
                      na plataforma de ensino digital.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}