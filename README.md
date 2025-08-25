# Dashboard Relatório Educacional 📊

Dashboard interativo para análise de desempenho educacional com **Índice de Excelência Acadêmica (IEA)** - Parceria Público-Privada para preparação de estudantes do 9º ano.

![Dashboard Preview](./docs/dashboard-preview.png)

## ✨ Funcionalidades

### 📈 Visualizações Interativas
- **Cards de estatísticas** com indicadores principais
- **Gráfico de pizza** para distribuição por classificação
- **Gráfico de barras** para pesos das dimensões
- **Radar chart** comparando performance dos top 3 estudantes
- **Filtros dinâmicos** por nome, escola e ranking

### 🏆 Sistema de Ranking
- **Cards expansíveis** para cada estudante
- **Busca em tempo real** por nome ou escola
- **Filtro por escola** específica
- **Toggle para Top 10** apenas
- **Ranking visual** com cores diferenciadas

### 📊 Analytics Avançados
- **4 Dimensões do IEA**: Engajamento Digital (30%), Progressão Curricular (25%), Performance Avaliativa (25%), Persistência Acadêmica (20%)
- **4 Áreas do Conhecimento**: Português, Matemática, Natureza, Humanas
- **Critérios de elegibilidade** para atividades extras
- **Estatísticas dinâmicas** calculadas automaticamente

## 🚀 Como Usar

### 1. Gerar Dados com ETL
Execute o script Python ETL para gerar o arquivo Excel:
```bash
python etl_relatorio_educacional.py
```

### 2. Carregar no Dashboard
1. Abra o dashboard
2. Clique em "Carregar Excel"
3. Selecione o arquivo `Relatorio_Desempenho_Educacional.xlsx`
4. Aguarde o processamento
5. Explore os dados nas abas: Ranking, Analytics e Metodologia

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/dashboard-relatorio-educacional.git
cd dashboard-relatorio-educacional

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm start
```

A aplicação estará disponível em `http://localhost:3000`

### Build para Produção
```bash
npm run build
```

## 📦 Deploy no GitHub Pages

### Configuração Automática
O projeto inclui GitHub Actions para deploy automático:

1. **Fork ou clone** este repositório
2. **Configure o GitHub Pages**:
   - Vá em Settings > Pages
   - Source: GitHub Actions
3. **Atualize o `package.json`**:
   ```json
   "homepage": "https://SEU_USUARIO.github.io/NOME_DO_REPOSITORIO"
   ```
4. **Commit e push** para a branch `main`
5. **Aguarde o deploy** automático via GitHub Actions

### Deploy Manual
```bash
# Instalar gh-pages (se não estiver no package.json)
npm install --save-dev gh-pages

# Deploy manual
npm run deploy
```

## 🏗️ Arquitetura

### Tecnologias Utilizadas
- **React 18** - Framework principal
- **Tailwind CSS** - Estilização e design system
- **Recharts** - Gráficos e visualizações
- **SheetJS (xlsx)** - Leitura de arquivos Excel
- **Lucide React** - Ícones modernos

### Estrutura do Projeto
```
src/
├── components/
│   └── DashboardRelatorioEducacional.js
├── App.js
├── index.js
├── index.css
└── App.css

public/
├── index.html
├── manifest.json
└── favicon.ico

.github/
└── workflows/
    └── deploy.yml
```

### Componentes Principais
- **DashboardRelatorioEducacional**: Componente principal
- **StatCard**: Cards de estatísticas
- **StudentCard**: Cards expansíveis de estudantes
- **Upload Handler**: Processamento de arquivos Excel

## 📊 Metodologia IEA

O **Índice de Excelência Acadêmica** é calculado com base em 4 dimensões:

### 🎯 Dimensões e Pesos
1. **Engajamento Digital (30%)**
   - Frequência de acesso
   - Diversidade de interações
   - Consistência temporal

2. **Progressão Curricular (25%)**
   - Taxa de conclusão geral
   - Diversidade curricular por área
   - Equilíbrio entre áreas

3. **Performance Avaliativa (25%)**
   - Tentativas de questionários
   - Atualizações de notas

4. **Persistência Acadêmica (20%)**
   - Taxa de conclusão de demonstrações
   - Total de conclusões
   - Atividades de retomada

### 🎓 Critérios de Elegibilidade
- Percentil 90+ no IEA
- Mínimo 30 eventos registrados
- Taxa de conclusão ≥ 60%
- Mínimo 15 dias de atividade

## 🌟 Áreas do Conhecimento

- **Português**: 20 módulos (Estrutura da palavra, Classes gramaticais, Sintaxe)
- **Matemática**: 22 módulos (Equações, Funções, Porcentagem e Juros)
- **Natureza**: 20 módulos (Biologia: Sistemática, Ecologia, Impactos Ambientais)
- **Humanas**: 20 módulos (Geografia: EUA, Europa, Rússia)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT