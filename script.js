// 🔥 Variáveis globais para armazenar os dados
let lista = JSON.parse(localStorage.getItem("lista")) || {
    Frutas: [],
    Laticínios: [],
    Carnes: [],
    Padaria: [],
    Congelados: [],
    Doces: [],
    Verduras: [],
    Outros: []
};

let totalGasto = 0;
let orcamento = localStorage.getItem("orcamento") || 0;
let modo = localStorage.getItem("modo") || "individual";
let membros = JSON.parse(localStorage.getItem("membros")) || [];

// Atualiza a interface ao carregar a página
document.getElementById("total").textContent = totalGasto.toFixed(2);
document.getElementById("orcamentoInput").value = orcamento;

// 🎯 Definir Modo (Individual ou Família)
function definirModo() {
    modo = document.getElementById("modo").value;
    localStorage.setItem("modo", modo);

    if (modo === "individual") {
        document.getElementById("perfilIndividual").style.display = "block";
        document.getElementById("perfilFamilia").style.display = "none";
    } else {
        document.getElementById("perfilIndividual").style.display = "none";
        document.getElementById("perfilFamilia").style.display = "block";
    }
}

// 💾 SALVAR PERFIL DO USUÁRIO
function salvarUsuario() {
    let nome = document.getElementById("nome").value.trim();
    let altura = parseFloat(document.getElementById("altura").value) / 100;
    let peso = parseFloat(document.getElementById("peso").value);
    let temDiabetes = document.getElementById("diabetes").value;

    // ✅ Operações Booleanas → Evitar valores inválidos
    if (!nome || isNaN(altura) || altura <= 0 || isNaN(peso) || peso <= 0) {
        alert("⚠️ Preencha os dados corretamente!");
        return;
    }

    localStorage.setItem("nomeUsuario", nome);
    localStorage.setItem("altura", altura);
    localStorage.setItem("peso", peso);
    localStorage.setItem("diabetes", temDiabetes);

    document.getElementById("nomeUsuario").textContent = nome;
    calcularIMC(peso, altura);
    recomendarDieta(temDiabetes);
}

// 📊 CÁLCULO DE IMC
function calcularIMC(peso, altura) {
    let imc = (peso / (altura * altura)).toFixed(1);
    document.getElementById("imc").textContent = imc;
    return imc;
}

// 🍏 RECOMENDAR DIETA BASEADA NO IMC E DIABETES
function recomendarDieta(diabetes) {
    let dieta = "Balanceada";
    let imc = parseFloat(document.getElementById("imc").textContent);

    if (diabetes === "sim") {
        dieta = "Baixa em açúcares";
    } else if (imc < 18.5) {
        dieta = "Rica em proteínas e calorias";
    } else if (imc > 25) {
        dieta = "Baixa em gorduras e carboidratos";
    }

    document.getElementById("dieta").textContent = dieta;
}

// 💰 DEFINIR ORÇAMENTO (INDIVIDUAL OU FAMÍLIA)
function definirOrcamento() {
    let novoOrcamento = parseFloat(document.getElementById("orcamentoInput").value);

    if (isNaN(novoOrcamento) || novoOrcamento <= 0) {
        alert("⚠️ Insira um valor válido para o orçamento!");
        return;
    }

    if (modo === "familia" && membros.length > 0) {
        orcamento = novoOrcamento / membros.length; // Divide pelo número de pessoas
        alert(`💰 Orçamento por pessoa: R$ ${orcamento.toFixed(2)}`);
    } else {
        orcamento = novoOrcamento;
    }

    localStorage.setItem("orcamento", orcamento);
}

// 🛍️ ADICIONAR ITEM NA LISTA DE COMPRAS
function adicionarItem() {
    let nome = document.getElementById("item").value.trim();
    let quantidade = parseInt(document.getElementById("quantidade").value);
    let preco = parseFloat(document.getElementById("preco").value);
    let validade = document.getElementById("validade").value;
    let categoria = document.getElementById("categoria").value;
    let diabetes = localStorage.getItem("diabetes");

    if (!nome || isNaN(quantidade) || quantidade <= 0 || isNaN(preco) || preco <= 0 || !validade) {
        alert("⚠️ Preencha todos os campos corretamente!");
        return;
    }

    let precoTotal = preco * quantidade;
    totalGasto += precoTotal;

    let produtosRicosEmAcucar = ["chocolate", "bala", "refrigerante", "bolo", "sorvete"];
    if (diabetes === "sim" && produtosRicosEmAcucar.some(prod => nome.toLowerCase().includes(prod))) {
        alert("⚠️ Este produto contém alto teor de açúcar! Cuidado!");
    }

    let itemFormatado = `${nome} (x${quantidade}, R$${preco.toFixed(2)}, vence em ${validade})`;
    lista[categoria].push(itemFormatado);
    localStorage.setItem("lista", JSON.stringify(lista));

    document.getElementById("total").textContent = totalGasto.toFixed(2);

    atualizarLista();
    verificarOrcamento();
    verificarPromocao(categoria);
    verificarValidade(validade);
}

// 📜 ATUALIZAR A LISTA DE COMPRAS
function atualizarLista() {
    let listaHtml = "<h2>🛒 Sua Lista</h2>";
    for (let categoria in lista) {
        if (lista[categoria].length > 0) {
            listaHtml += `<h3>${categoria}:</h3><ul>`;
            lista[categoria].forEach((item, index) => {
                listaHtml += `<li class="item">${item} <button class="remover" onclick="removerItem('${categoria}', ${index})">❌</button></li>`;
            });
            listaHtml += "</ul>";
        }
    }
    document.getElementById("listaDeCompras").innerHTML = listaHtml;
}

// ❌ REMOVER ITEM DA LISTA
function removerItem(categoria, index) {
    lista[categoria].splice(index, 1);
    localStorage.setItem("lista", JSON.stringify(lista));
    atualizarLista();
}

// ⚠️ ALERTAS (Orçamento, Promoção e Validade)
function verificarOrcamento() {
    if (totalGasto >= orcamento * 0.9) {
        alert("⚠️ Atenção! Você está perto do seu limite de orçamento!");
    }
}

function verificarPromocao(categoria) {
    let diaSemana = new Date().getDay();
    let promoHoje = { 1: "Carnes", 3: "Frutas e Verduras", 5: "Padaria" };

    if (promoHoje[diaSemana] && promoHoje[diaSemana] === categoria) {
        alert(`🔥 Promoção do dia! ${categoria} estão em oferta hoje!`);
    }
}

function verificarValidade(validade) {
    let hoje = new Date();
    let dataValidade = new Date(validade);
    let diffDias = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));

    if (diffDias <= 3) {
        alert(`⚠️ Atenção! O item vence em ${diffDias} dias!`);
    }
}

// 📌 RECUPERAR PERFIL AO RECARREGAR A PÁGINA
window.onload = function() {
    definirModo();
    let nomeSalvo = localStorage.getItem("nomeUsuario");
    if (nomeSalvo) {
        document.getElementById("nomeUsuario").textContent = nomeSalvo;
    }
};