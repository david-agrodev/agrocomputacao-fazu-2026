const API_URL =
'https://script.google.com/macros/s/AKfycbwD_6cRRCsYMQznjGb-sA9ldzDuXHHmpai_9jZnAj22OqD6C0FGcDshyDlToes-0J0r/exec';


async function login(){

  const login =
  document.getElementById('login').value;

  const senha =
  document.getElementById('senha').value;

  try{

    const response =
    await fetch(
      `${API_URL}?action=login&login=${login}&senha=${senha}`
    );

    const data =
    await response.json();

    if(data.success){

      carregarHome(data.user);

    }else{

      alert(data.message);

    }

  }catch(error){

    console.error(error);

    alert('Erro ao conectar.');

  }

}


function carregarHome(user){

  document.getElementById('app').innerHTML = `

    <div class="home">

      <div class="topbar">

        <h1>
          Agrocomputação FAZU 2026
        </h1>

        <div class="user">
          ${user.nome}
        </div>

      </div>

      <div class="cards">

        <div class="card">
          <div class="card-title">
            Dias para Colação
          </div>

          <div class="card-value">
            80
          </div>
        </div>

        <div class="card">
          <div class="card-title">
            Votações
          </div>

          <div class="card-value">
            5/8
          </div>
        </div>

        <div class="card">
          <div class="card-title">
            Próximo Evento
          </div>

          <div class="card-value" style="font-size:22px;">
            Ensaio
          </div>
        </div>

      </div>

      <div class="alert">

        Você possui votações pendentes:
        <br><br>

        • Patrono
        <br>

        • Nome da Turma

      </div>

      <div class="menu">

        <div class="menu-card">

          <div class="icon">
            🗳️
          </div>

          <h3>Votações</h3>

        </div>

        <div class="menu-card">

          <div class="icon">
            📅
          </div>

          <h3>Cronograma</h3>

        </div>

        <div class="menu-card">

          <div class="icon">
            🎓
          </div>

          <h3>Homenageados</h3>

        </div>

        <div class="menu-card">

          <div class="icon">
            📄
          </div>

          <h3>Documentos</h3>

        </div>

      </div>

    </div>

  `;

}
