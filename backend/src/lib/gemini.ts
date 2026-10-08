import "dotenv/config";

const modeloPadrao = "gemini-3.5-flash-lite";
const tempoLimiteMs = 15_000;
const tamanhoMaximoFrase = 160;

type DadosProdutoParaFrase = {
  descricao: string;
  categoria?: string | null;
  especificacoes?: string | null;
};

type RespostaGemini = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

function montarPrompt(produto: DadosProdutoParaFrase): string {
  const linhas = [
    "Você é redator de um restaurante gaúcho chamado Minuta Campeira.",
    "Crie UMA frase curta, apetitosa e típica gaúcha, de uma única linha, como chamada para ação (CTA) para vender o produto abaixo.",
    "Use o jeito de falar do Rio Grande do Sul (ex.: bah, tchê, barbaridade, capaz, tri) sem exagerar.",
    `No máximo ${tamanhoMaximoFrase - 40} caracteres.`,
    "Não invente ingredientes que não estejam nas especificações.",
    "Responda somente com a frase, sem aspas, sem hashtags e sem emojis.",
    "",
    `Produto: ${produto.descricao}`,
  ];

  if (produto.categoria) {
    linhas.push(`Categoria: ${produto.categoria}`);
  }
  if (produto.especificacoes) {
    linhas.push(`Especificações: ${produto.especificacoes}`);
  }

  return linhas.join("\n");
}

// Mantém só a primeira linha, sem aspas/marcadores que o modelo às vezes adiciona
function limparFrase(texto: string): string {
  const primeiraLinha =
    texto
      .split("\n")
      .map((linha) => linha.trim())
      .find((linha) => linha.length > 0) ?? "";

  const semMarcacao = primeiraLinha
    .replace(/^[-*•\s]+/, "")
    .replace(/^["'“”‘’«»]+|["'“”‘’«»]+$/g, "")
    .replace(/\*\*/g, "")
    .trim();

  return semMarcacao.length > tamanhoMaximoFrase
    ? `${semMarcacao.slice(0, tamanhoMaximoFrase - 1).trimEnd()}…`
    : semMarcacao;
}

export async function gerarFraseVenda(
  produto: DadosProdutoParaFrase,
): Promise<string> {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) {
    throw new Error("GEMINI_NAO_CONFIGURADO");
  }

  const modelo = process.env.GEMINI_MODEL || modeloPadrao;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": chave,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: montarPrompt(produto) }] }],
      generationConfig: { temperature: 0.9 },
    }),
    signal: AbortSignal.timeout(tempoLimiteMs),
  });

  if (!response.ok) {
    const detalhe = await response.text().catch(() => "");
    console.error(
      `Gemini respondeu HTTP ${response.status} (modelo ${modelo}):`,
      detalhe.slice(0, 500),
    );
    throw new Error(`GEMINI_HTTP_${response.status}`);
  }

  const dados = (await response.json()) as RespostaGemini;
  const texto =
    dados.candidates?.[0]?.content?.parts
      ?.map((parte) => parte.text ?? "")
      .join("") ?? "";

  const frase = limparFrase(texto);
  if (!frase) {
    throw new Error("GEMINI_RESPOSTA_VAZIA");
  }

  return frase;
}
