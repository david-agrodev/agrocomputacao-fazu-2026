const API_URL = 'https://script.google.com/macros/s/AKfycbwD_6cRRCsYMQznjGb-sA9ldzDuXHHmpai_9jZnAj22OqD6C0FGcDshyDlToes-0J0r/exec';

let currentUser = null;
let currentPage = 'login';
let config = {
  votacao_ativa: 'SIM',
  resultado_ao_vivo: 'SIM',
  tema: 'LIGHT',
  nome_sistema: 'Agrocomputação FAZU 2026'
};
let avisos = [];
let categorias = [];
let professores = [];
let funcionarios = [];
let alunos = [];
let cronograma = [];
let votosDoAluno = [];
let resultados = [];
let modalAberto = null;

async function initApp() {
  renderApp();
  lucide.createIcons();
}

async function fetchAPI(action, params = {}) {
  try {
    const url = new URL(API_URL);
    url.searchParams.append('action', action);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Erro na API:', error);
    return { success: false, message: 'Erro de conexão' };
  }
}

async function carregarDados() {
  console.log('=== Carregando dados ===');
  
  const [configRes, avisosRes, categoriasRes, professoresRes, funcionariosRes, alunosRes, cronogramaRes] = await Promise.all([
    fetchAPI('getConfig'),
    fetchAPI('getAvisos'),
    fetchAPI('getCategorias'),
    fetchAPI('getProfessores'),
    fetchAPI('getFuncionarios'),
    fetchAPI('getAlunos'),
    fetchAPI('getCronograma')
  ]);
  
  console.log('Config:', configRes);
  console.log('Professores:', professoresRes);
  console.log('Alunos:', alunosRes);
  console.log('Funcionários:', funcionariosRes);
  
  if (configRes.success) config = { ...config, ...configRes.data };
  if (avisosRes.success) avisos = avisosRes.data;
  if (categoriasRes.success) categorias = categoriasRes.data;
  if (professoresRes.success) professores = professoresRes.data;
  if (funcionariosRes.success) funcionarios = funcionariosRes.data;
  if (alunosRes.success) alunos = alunosRes.data;
  if (cronogramaRes.success) cronograma = cronogramaRes.data;
  
  console.log('Professores carregados:', professores);
  console.log('Alunos carregados:', alunos);
  
  if (currentUser) {
    const votosRes = await fetchAPI('getVotosAluno', { aluno: currentUser.nome });
    if (votosRes.success) votosDoAluno = votosRes.data;
    
    if (config.resultado_ao_vivo === 'SIM') {
      const resultadosRes = await fetchAPI('getResultados');
      if (resultadosRes.success) resultados = resultadosRes.data;
    }
  }
}

function getOpcoesPorCategoria(categoria) {
  console.log('getOpcoesPorCategoria - Categoria:', categoria);
  
  const mapCategoriaParaAba = {
    'Paraninfo': professores,
    'Patrono': professores,
    'Nome da Turma': professores,
    'Professor Homenageado': professores,
    'Funcionário Homenageado': funcionarios,
    'Orador': alunos,
    'Juramentista': alunos,
    'Mensagem aos Pais': alunos
  };
  
  const dados = mapCategoriaParaAba[categoria] || [];
  console.log('Dados para categoria:', dados);
  
  const opcoes = dados.map(item => item.nome);
  console.log('Opções geradas:', opcoes);
  
  return opcoes;
}

function renderApp() {
  const app = document.getElementById('app');
  
  if (currentPage === 'login') {
    app.innerHTML = renderLoginPage();
  } else {
    app.innerHTML = renderMainApp();
    lucide.createIcons();
  }
}

function renderLoginPage() {
  return `
    <div class="login-container">
      <div class="login-card">
        <img src="https://i.imgur.com/4AiXzf8.png" class="logo">
        <h1>Agrocomputação FAZU 2026</h1>
        <p class="subtitle">Sistema Oficial da Turma</p>
        <div class="input-group">
          <label>Login</label>
          <input type="text" id="login" placeholder="Digite seu login">
        </div>
        <div class="input-group">
          <label>Senha</label>
          <input type="password" id="senha" placeholder="Digite sua senha">
        </div>
        <button onclick="handleLogin()">Entrar</button>
      </div>
    </div>
  `;
}

function renderMainApp() {
  return `
    <div class="app-container">
      <div class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <img src="https://i.imgur.com/4AiXzf8.png" class="sidebar-logo">
          <h2>${config.nome_sistema || 'Agrocomputação FAZU 2026'}</h2>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-item ${currentPage === 'home' ? 'active' : ''}" onclick="navigateTo('home')">
            <i data-lucide="home"></i>
            <span>Home</span>
          </div>
          <div class="nav-item ${currentPage === 'votacoes' ? 'active' : ''}" onclick="navigateTo('votacoes')">
            <i data-lucide="vote"></i>
            <span>Votações</span>
          </div>
          <div class="nav-item ${currentPage === 'cronograma' ? 'active' : ''}" onclick="navigateTo('cronograma')">
            <i data-lucide="calendar"></i>
            <span>Cronograma</span>
          </div>
          <div class="nav-item ${currentPage === 'homenageados' ? 'active' : ''}" onclick="navigateTo('homenageados')">
            <i data-lucide="award"></i>
            <span>Homenageados</span>
          </div>
          <div class="nav-item ${currentPage === 'documentos' ? 'active' : ''}" onclick="navigateTo('documentos')">
            <i data-lucide="file-text"></i>
            <span>Documentos</span>
          </div>
        </nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <i data-lucide="user-circle"></i>
            <div>
              <p class="user-name">${currentUser?.nome || 'Usuário'}</p>
              <p class="user-role">${currentUser?.admin === 'SIM' ? 'Administrador' : 'Aluno'}</p>
            </div>
          </div>
          <button class="logout-btn" onclick="handleLogout()">
            <i data-lucide="log-out"></i>
          </button>
        </div>
      </div>
      
      <div class="main-content">
        <button class="menu-toggle" onclick="toggleSidebar()">
          <i data-lucide="menu"></i>
        </button>
        ${renderCurrentPage()}
        ${modalAberto ? renderModal() : ''}
      </div>
    </div>
  `;
}

function renderCurrentPage() {
  switch (currentPage) {
    case 'home': return renderHomePage();
    case 'votacoes': return renderVotacoesPage();
    case 'cronograma': return renderCronogramaPage();
    case 'homenageados': return renderHomenageadosPage();
    case 'documentos': return renderDocumentosPage();
    default: return renderHomePage();
  }
}

function renderHomePage() {
  const dataColacao = new Date('2026-07-30');
  const hoje = new Date();
  const diffTime = dataColacao - hoje;
  const diffDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const categoriasConcluidas = votosDoAluno.length;
  const totalCategorias = categorias.length || 8;
  
  const pendentes = categorias.filter(cat => 
    !votosDoAluno.some(v => v.categoria === cat.categoria)
  );
  
  return `
    <div class="page-content">
      <div class="page-header">
        <h1>Bem-vindo, ${currentUser?.nome || 'Aluno'}!</h1>
        <p>Confira as últimas atualizações da turma</p>
      </div>
      
      <div class="cards-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i data-lucide="clock"></i>
          </div>
          <div class="stat-info">
            <p class="stat-label">Dias para Colação</p>
            <p class="stat-value">${diffDias}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i data-lucide="vote"></i>
          </div>
          <div class="stat-info">
            <p class="stat-label">Votações</p>
            <p class="stat-value">${categoriasConcluidas}/${totalCategorias}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i data-lucide="calendar"></i>
          </div>
          <div class="stat-info">
            <p class="stat-label">Próximo Evento</p>
            <p class="stat-value" style="font-size:18px;">${cronograma[2]?.evento || 'Ensaio'}</p>
          </div>
        </div>
      </div>
      
      ${avisos.length > 0 ? `
        <div class="alert-box">
          <div class="alert-icon">
            <i data-lucide="bell"></i>
          </div>
          <div class="alert-content">
            ${avisos.map(a => `
              <div style="margin-bottom:10px;">
                <h3 style="font-size:16px;">${a.titulo}</h3>
                <p style="font-size:14px;">${a.mensagem}</p>
                <small style="color:#856404;">${a.data || ''}</small>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      ${pendentes.length > 0 ? `
        <div class="alert-box" style="background:#e3f2fd; color:#1565c0;">
          <div class="alert-icon" style="background:#90caf9; color:#1565c0;">
            <i data-lucide="alert-triangle"></i>
          </div>
          <div class="alert-content">
            <h3 style="color:#1565c0;">Você possui votações pendentes!</h3>
            <ul>
              ${pendentes.map(p => `<li style="color:#1565c0;">${p.categoria}</li>`).join('')}
            </ul>
          </div>
        </div>
      ` : ''}
      
      <div class="menu-grid">
        <div class="menu-item" onclick="navigateTo('votacoes')">
          <i data-lucide="vote"></i>
          <h3>Votações</h3>
          <p>Participe das votações da turma</p>
        </div>
        <div class="menu-item" onclick="navigateTo('cronograma')">
          <i data-lucide="calendar"></i>
          <h3>Cronograma</h3>
          <p>Veja todas as datas importantes</p>
        </div>
        <div class="menu-item" onclick="navigateTo('homenageados')">
          <i data-lucide="award"></i>
          <h3>Homenageados</h3>
          <p>Veja os resultados das votações</p>
        </div>
        <div class="menu-item" onclick="navigateTo('documentos')">
          <i data-lucide="file-text"></i>
          <h3>Documentos</h3>
          <p>Orientações e traje oficial</p>
        </div>
      </div>
    </div>
  `;
}

function renderVotacoesPage() {
  const votacaoAtiva = config.votacao_ativa === 'SIM';
  
  return `
    <div class="page-content">
      <div class="page-header">
        <h1>Votações</h1>
        <p>Participe das decisões da turma</p>
      </div>
      
      ${!votacaoAtiva ? `
        <div class="alert-box" style="background:#ffebee; color:#c62828;">
          <div class="alert-icon" style="background:#ef9a9a; color:#c62828;">
            <i data-lucide="lock"></i>
          </div>
          <div class="alert-content">
            <h3 style="color:#c62828;">Votações encerradas</h3>
            <p style="color:#c62828;">As votações estão temporariamente desativadas.</p>
          </div>
        </div>
      ` : ''}
      
      <div class="votacoes-list">
        ${(categorias.length > 0 ? categorias : [
          { id: 1, categoria: 'Paraninfo', status: 'ABERTO' },
          { id: 2, categoria: 'Patrono', status: 'ABERTO' },
          { id: 3, categoria: 'Nome da Turma', status: 'ABERTO' },
          { id: 4, categoria: 'Professor Homenageado', status: 'ABERTO' },
          { id: 5, categoria: 'Funcionário Homenageado', status: 'ABERTO' },
          { id: 6, categoria: 'Orador', status: 'ABERTO' },
          { id: 7, categoria: 'Juramentista', status: 'ABERTO' },
          { id: 8, categoria: 'Mensagem aos Pais', status: 'ABERTO' }
        ]).map(cat => {
          const jaVotou = votosDoAluno.some(v => v.categoria === cat.categoria);
          const status = jaVotou ? 'concluido' : (cat.status === 'ABERTO' ? 'pendente' : 'fechado');
          const podeVotar = votacaoAtiva && cat.status === 'ABERTO';
          
          return `
            <div class="votacao-card">
              <div class="votacao-info">
                <h3>${cat.categoria}</h3>
                <span class="votacao-status ${status}">
                  ${jaVotou ? 'Votado' : (cat.status === 'ABERTO' ? 'Aberto' : 'Fechado')}
                </span>
              </div>
              <button class="votar-btn" ${!podeVotar ? 'disabled' : ''} onclick="abrirModalVotacao('${cat.categoria}')">
                ${jaVotou ? 'Alterar Voto' : 'Votar'}
                <i data-lucide="chevron-right"></i>
              </button>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderCronogramaPage() {
  const eventos = cronograma.length > 0 ? cronograma : [
    { evento: 'Entrega documentos pendentes', data: '30/06/2026', local: 'Secretaria Acadêmica' },
    { evento: 'Lista homenageados por curso', data: '10/07/2026', local: 'FAZU' },
    { evento: 'Ensaio Colação de Grau', data: '29/07/2026', local: 'Centro de Eventos' },
    { evento: 'Solenidade Colação de Grau', data: '30/07/2026', local: 'Centro de Eventos ABCZ' }
  ];
  
  return `
    <div class="page-content">
      <div class="page-header">
        <h1>Cronograma</h1>
        <p>Datas importantes da colação</p>
      </div>
      
      <div class="timeline">
        ${eventos.map((evento, index) => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-card">
              <div class="timeline-date">
                <i data-lucide="calendar"></i>
                <span>${evento.data}</span>
              </div>
              <h3>${evento.evento}</h3>
              <p class="timeline-local">
                <i data-lucide="map-pin"></i>
                ${evento.local}
              </p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderHomenageadosPage() {
  const mostrarResultados = config.resultado_ao_vivo === 'SIM';
  
  const dados = resultados.length > 0 ? resultados : [];
  
  return `
    <div class="page-content">
      <div class="page-header">
        <h1>Homenageados</h1>
        <p>Resultados das votações</p>
      </div>
      
      ${!mostrarResultados ? `
        <div class="alert-box" style="background:#e3f2fd; color:#1565c0;">
          <div class="alert-icon" style="background:#90caf9; color:#1565c0;">
            <i data-lucide="eye-off"></i>
          </div>
          <div class="alert-content">
            <h3 style="color:#1565c0;">Resultados em breve</h3>
            <p style="color:#1565c0;">Os resultados serão divulgados em breve.</p>
          </div>
        </div>
      ` : ''}
      
      ${dados.length > 0 ? `
        <div class="homenageados-grid">
          ${dados.map(h => `
            <div class="homenageado-card">
              <div class="homenageado-icon">
                <i data-lucide="user"></i>
              </div>
              <h3>${h.nome || 'A definir'}</h3>
              <p class="homenageado-cargo">${h.cargo}</p>
              ${h.votos ? `
                <div class="votos-info">
                  <i data-lucide="thumbs-up"></i>
                  <span>${h.votos} votos</span>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="alert-box" style="background:#e3f2fd; color:#1565c0;">
          <div class="alert-icon" style="background:#90caf9; color:#1565c0;">
            <i data-lucide="info"></i>
          </div>
          <div class="alert-content">
            <h3 style="color:#1565c0;">Nenhum resultado ainda</h3>
            <p style="color:#1565c0;">Aguarde os primeiros votos serem registrados.</p>
          </div>
        </div>
      `}
    </div>
  `;
}

function renderDocumentosPage() {
  return `
    <div class="page-content">
      <div class="page-header">
        <h1>Documentos e Orientações</h1>
        <p>Informações importantes para a colação</p>
      </div>
      
      <div class="documentos-section">
        <div class="documento-card">
          <div class="documento-icon">
            <i data-lucide="shirt"></i>
          </div>
          <h3>Traje Oficial</h3>
          <ul>
            <li>Toga preta</li>
            <li>Faixa verde</li>
            <li>Capelo com borla preta</li>
            <li>Sapato social</li>
          </ul>
        </div>
        
        <div class="documento-card">
          <div class="documento-icon">
            <i data-lucide="clipboard-list"></i>
          </div>
          <h3>Orientações Gerais</h3>
          <ul>
            <li>Chegar 1h antes do evento</li>
            <li>Levar documento com foto</li>
            <li>Não levar objetos de valor</li>
            <li>Seguir as orientações da comissão</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

function renderModal() {
  if (!modalAberto) return '';
  
  const categoria = modalAberto;
  const votoAtual = votosDoAluno.find(v => v.categoria === categoria);
  const opcoes = getOpcoesPorCategoria(categoria);
  
  return `
    <div class="modal-overlay" onclick="fecharModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2>Votar em ${categoria}</h2>
          <button class="modal-close" onclick="fecharModal()">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-content">
          ${opcoes.length > 0 ? `
            <div class="opcoes-list">
              ${opcoes.map(opcao => `
                <div class="opcao-item ${votoAtual?.voto === opcao ? 'selected' : ''}" onclick="selecionarOpcao('${opcao}')">
                  <div class="opcao-radio"></div>
                  <span>${opcao}</span>
                </div>
              `).join('')}
            </div>
          ` : `
            <div style="text-align:center;padding:40px;color:#666;">
              <i data-lucide="inbox" style="width:64px;height:64px;margin-bottom:16px;opacity:0.5;"></i>
              <p>Nenhuma opção disponível para esta categoria</p>
            </div>
          `}
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="fecharModal()">Cancelar</button>
          <button class="btn-primary" onclick="confirmarVoto('${categoria}')" ${!votoSelecionado || opcoes.length === 0 ? 'disabled' : ''}>
            Confirmar Voto
          </button>
        </div>
      </div>
    </div>
  `;
}

let votoSelecionado = null;

function abrirModalVotacao(categoria) {
  modalAberto = categoria;
  votoSelecionado = votosDoAluno.find(v => v.categoria === categoria)?.voto || null;
  renderApp();
}

function fecharModal() {
  modalAberto = null;
  votoSelecionado = null;
  renderApp();
}

function selecionarOpcao(opcao) {
  votoSelecionado = opcao;
  renderApp();
}

async function confirmarVoto(categoria) {
  if (!votoSelecionado) {
    alert('Selecione uma opção!');
    return;
  }
  
  const res = await fetchAPI('votar', {
    aluno: currentUser.nome,
    categoria: categoria,
    voto: votoSelecionado
  });
  
  if (res.success) {
    alert('Voto registrado com sucesso!');
    
    const votoExistenteIndex = votosDoAluno.findIndex(v => v.categoria === categoria);
    if (votoExistenteIndex >= 0) {
      votosDoAluno[votoExistenteIndex].voto = votoSelecionado;
    } else {
      votosDoAluno.push({ aluno: currentUser.nome, categoria, voto: votoSelecionado });
    }
    
    if (config.resultado_ao_vivo === 'SIM') {
      const resultadosRes = await fetchAPI('getResultados');
      if (resultadosRes.success) resultados = resultadosRes.data;
    }
    
    fecharModal();
  } else {
    alert(res.message || 'Erro ao registrar voto.');
  }
}

async function handleLogin() {
  const login = document.getElementById('login').value;
  const senha = document.getElementById('senha').value;
  
  if (!login || !senha) {
    alert('Por favor, preencha login e senha.');
    return;
  }
  
  const data = await fetchAPI('login', { login, senha });
  
  if (data.success) {
    currentUser = data.user;
    currentPage = 'home';
    await carregarDados();
    renderApp();
  } else {
    alert(data.message || 'Login ou senha inválidos.');
  }
}

function handleLogout() {
  currentUser = null;
  currentPage = 'login';
  config = {
    votacao_ativa: 'SIM',
    resultado_ao_vivo: 'SIM',
    tema: 'LIGHT',
    nome_sistema: 'Agrocomputação FAZU 2026'
  };
  avisos = [];
  categorias = [];
  professores = [];
  funcionarios = [];
  alunos = [];
  cronograma = [];
  votosDoAluno = [];
  resultados = [];
  renderApp();
}

function navigateTo(page) {
  currentPage = page;
  renderApp();
  
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.remove('open');
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
}

document.addEventListener('DOMContentLoaded', initApp);
