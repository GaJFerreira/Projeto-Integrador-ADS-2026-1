const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageBreak, TableOfContents, PageNumber, Header, Footer
} = require("docx");

const BLUE = "1F4E79";
const LIGHTBLUE = "D5E8F0";
const GREY = "F2F2F2";
const CONTENT_W = 9360;

const border = { style: BorderStyle.SINGLE, size: 1, color: "BBBBBB" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
}
function p(text, opts = {}) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, ...opts })] });
}
function bullet(text) {
  return new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 },
    children: [new TextRun(text)] });
}
function bulletRuns(runs) {
  return new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: runs });
}

function headerCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, margins: cellMargins,
    shading: { fill: BLUE, type: ShadingType.CLEAR },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF" })] })],
  });
}
function bodyCell(text, width, fill) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, margins: cellMargins,
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({ children: [new TextRun(text)] })],
  });
}
function table(headers, rows, widths) {
  const headerRow = new TableRow({ tableHeader: true, children: headers.map((h, i) => headerCell(h, widths[i])) });
  const bodyRows = rows.map((r, ri) =>
    new TableRow({ children: r.map((c, i) => bodyCell(c, widths[i], ri % 2 ? GREY : undefined)) }));
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths,
    rows: [headerRow, ...bodyRows] });
}
const spacer = () => new Paragraph({ spacing: { after: 120 }, children: [] });

const doc = new Document({
  creator: "Equipe Projeto Integrador ADS - PUC Goias",
  title: "Modulo Compre com Saude - Apresentacao",
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, color: BLUE, font: "Arial" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 25, bold: true, color: "2E5E8C", font: "Arial" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•",
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [
    // ---------- CAPA ----------
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        new Paragraph({ spacing: { before: 2600, after: 0 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Plataforma de Auxilio ao Idoso", size: 28, color: "666666" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120 },
          children: [new TextRun({ text: "Modulo Compre com Saude", bold: true, size: 56, color: BLUE })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 8 } },
          children: [new TextRun({ text: "Lista de compras saudavel com apoio nutricional e por patologia", italics: true, size: 26, color: "444444" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 800 },
          children: [new TextRun({ text: "Apresentacao do modulo e das novas implementacoes", size: 26, bold: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1600 },
          children: [new TextRun({ text: "Projeto Integrador - Analise e Desenvolvimento de Sistemas", size: 22, color: "666666" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80 },
          children: [new TextRun({ text: "PUC Goias - 2026/1", size: 22, color: "666666" })] }),
      ],
    },
    // ---------- CONTEUDO ----------
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Compre com Saude  |  Pagina ", size: 18, color: "888888" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888" })] })] }),
      },
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Sumario")] }),
        new TableOfContents("Sumario", { hyperlink: true, headingStyleRange: "1-2" }),
        new Paragraph({ children: [new PageBreak()] }),

        // 1. Visao geral
        h1("1. Visao Geral do Modulo"),
        p("O modulo Compre com Saude faz parte da Plataforma de Auxilio ao Idoso e tem como objetivo ajudar o usuario a montar listas de compras mais saudaveis, levando em conta suas condicoes de saude (patologias), informacoes nutricionais dos produtos e sugestoes de substituicao."),
        p("Principais propositos:", { bold: true }),
        bullet("Montar e gerenciar listas de compras associadas ao usuario autenticado."),
        bullet("Oferecer um catalogo de produtos com informacao nutricional e custo medio."),
        bullet("Sugerir produtos relacionados e substitutos adequados a cada patologia."),
        bullet("Disponibilizar listas-modelo (templates) compativeis com as patologias do usuario."),
        bullet("Busca rapida de produtos por nome (autocomplete) sem sensibilidade a acentos."),

        // 2. Arquitetura
        h1("2. Arquitetura e Organizacao"),
        p("O backend segue o padrao de monolito modular Maven multi-module. O modulo lista-compras e independente e expoe sua API sob o prefixo /api/lista-compras, reaproveitando a autenticacao JWT e o controle de permissoes da plataforma central."),
        h2("2.1. Camadas do modulo"),
        table(
          ["Camada", "Responsabilidade"],
          [
            ["controller", "Endpoints REST e documentacao Swagger/OpenAPI."],
            ["service", "Regras de negocio, validacoes e normalizacao de dados."],
            ["database/entity", "Entidades JPA mapeadas no schema lista_compras."],
            ["database/repository", "Acesso a dados via Spring Data JPA."],
            ["dto", "Objetos de transferencia de entrada e saida da API."],
            ["config", "Inicializacao de catalogo (seed) e configuracoes do modulo."],
          ],
          [2600, 6760]
        ),
        spacer(),
        h2("2.2. Seguranca e acesso"),
        bullet("Endpoints de usuario exigem token JWT (header Authorization); a lista e vinculada ao usuario do token."),
        bulletRuns([new TextRun("Endpoints administrativos sao protegidos por "),
          new TextRun({ text: "@PreAuthorize(\"hasRole('ADMIN')\")", font: "Consolas", color: "B00020" }),
          new TextRun(".")]),

        // 3. Modelo de dados
        h1("3. Modelo de Dados"),
        p("As principais entidades do modulo (schema lista_compras):"),
        table(
          ["Entidade", "Descricao"],
          [
            ["Produto", "Item do catalogo: nome, nome normalizado, preco, custo medio, marca, unidade e tabela nutricional."],
            ["Categoria", "Agrupamento de produtos (Laticinios, Padaria, Mercearia, etc.)."],
            ["Lista", "Lista de compras do usuario; pode ser comum ou template."],
            ["ItemLista", "Produto e quantidade dentro de uma lista."],
            ["Patologia", "Condicao de saude (ex.: diabetes, hipertensao)."],
            ["UsuarioPatologia", "Vinculo entre usuario e suas patologias."],
            ["PatologiaItem", "Produtos recomendados/substitutos por patologia."],
            ["ProdutoRelacionado", "Relacao de afinidade entre produtos."],
            ["HistoricoCompra", "Registro de compras para apoio e analise."],
          ],
          [2600, 6760]
        ),

        // 4. Funcionalidades
        h1("4. Funcionalidades e Endpoints"),
        h2("4.1. Listas de compras"),
        table(
          ["Metodo", "Rota", "Descricao"],
          [
            ["POST", "/listas", "Criar lista com itens (usuario autenticado)."],
            ["GET", "/listas", "Listar listas do usuario."],
            ["GET", "/listas/templates", "Templates compativeis com as patologias do usuario."],
            ["GET", "/listas/{id}", "Buscar lista por ID."],
            ["PUT", "/listas/{id}", "Atualizar titulo, patologia, itens e status."],
            ["PATCH", "/listas/{id}/finalizar", "Finalizar/arquivar a lista."],
          ],
          [1100, 3460, 4800]
        ),
        spacer(),
        h2("4.2. Produtos e autocomplete"),
        table(
          ["Metodo", "Rota", "Descricao"],
          [
            ["GET", "/produtos", "Listar produtos ativos."],
            ["GET", "/produtos/buscar", "Autocomplete: busca por nome normalizado (sem acento)."],
            ["GET", "/produtos/{id}/relacionados", "Produtos relacionados por afinidade."],
            ["GET", "/produtos/{id}/substituiveis", "Substitutos conforme patologias do usuario."],
          ],
          [1100, 3860, 4400]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // 5. Novas implementacoes
        h1("5. Novas Implementacoes"),

        h2("5.1. Cadastro administrativo de produtos (nutricao e custo medio)"),
        p("Foi adicionada uma area administrativa completa para gestao do catalogo, sob /api/lista-compras/admin/produtos, restrita ao perfil ADMIN."),
        bullet("Cadastro de produto com tabela nutricional: calorias, proteinas, carboidratos, gorduras totais e saturadas, fibras, sodio e acucares (por porcao de referencia)."),
        bullet("Campos de marca, unidade de medida e porcao de referencia em gramas."),
        bullet("Custo medio do produto com data de atualizacao, permitindo acompanhamento de preco."),
        bullet("Atualizacao parcial: PATCH /{id}/custo (somente custo) e PATCH /{id}/nutricao (somente tabela nutricional)."),
        bullet("Desativacao via soft delete (ativo = false), preservando historico."),
        spacer(),
        table(
          ["Metodo", "Rota", "Descricao"],
          [
            ["GET", "/admin/produtos", "Listar todos (inclui inativos)."],
            ["POST", "/admin/produtos", "Cadastrar produto com nutricao e custo."],
            ["PUT", "/admin/produtos/{id}", "Atualizar produto completo."],
            ["PATCH", "/admin/produtos/{id}/custo", "Atualizar apenas o custo medio."],
            ["PATCH", "/admin/produtos/{id}/nutricao", "Atualizar apenas a nutricao."],
            ["DELETE", "/admin/produtos/{id}", "Desativar (soft delete)."],
          ],
          [1200, 4360, 3800]
        ),

        h2("5.2. Hotfix - Autocomplete de produtos"),
        p("Sintoma: o autocomplete do campo \"Adicionar item\" retornava erro 500, exibindo o aviso \"Erro ao buscar produtos para autocomplete\".", { }),
        p("Causa raiz:", { bold: true }),
        bulletRuns([new TextRun("A busca usava uma query nativa dependente da funcao "),
          new TextRun({ text: "public.f_unaccent", font: "Consolas", color: "B00020" }),
          new TextRun(" e da extensao unaccent do PostgreSQL, criadas apenas via script SQL manual.")]),
        bulletRuns([new TextRun("Em ambientes que carregam dados pelo inicializador Java, a funcao nao existe, gerando o erro "),
          new TextRun({ text: "\"o esquema public nao existe\"", italics: true }),
          new TextRun(" (SQLState 3F000).")]),
        p("Solucao aplicada:", { bold: true }),
        bullet("Remocao da query nativa; passou-se a usar consulta JPA pura sobre a coluna nome_normalizado."),
        bullet("O nome normalizado ja e gravado sem acento e em minusculas pela aplicacao, tornando a funcao do banco redundante."),
        bullet("O termo digitado passa pela mesma normalizacao em Java, mantendo a busca sem acento e sem diferenciar maiusculas."),
        bullet("Alinhamento do script de massa de dados para gravar o nome normalizado sem acento."),
        p("Resultado:", { bold: true }),
        bullet("Autocomplete funciona em qualquer ambiente, sem necessidade de extensao ou script manual no banco."),
        bullet("Nenhum outro endpoint foi afetado; comportamento de busca preservado."),

        // 6. Validacao
        h1("6. Validacao e Proximos Passos"),
        h2("6.1. Validacao realizada"),
        bullet("Compilacao do modulo com sucesso (Maven)."),
        bullet("Varredura confirmando ausencia de dependencias nativas remanescentes no fluxo de busca."),
        bullet("Teste manual do fluxo de login e busca de produtos."),
        h2("6.2. Proximos passos sugeridos"),
        bullet("Cobertura de testes automatizados para os servicos de produto e lista."),
        bullet("Centralizar a URL base da API no frontend via variavel de ambiente."),
        bullet("Indice de texto (trigram/GIN) para otimizar buscas em catalogos maiores."),

        spacer(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 },
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 6 } },
          children: [new TextRun({ text: "Fim da apresentacao - Modulo Compre com Saude", italics: true, color: "888888" })] }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  const out = __dirname + "/Apresentacao-Modulo-Compre-com-Saude.docx";
  fs.writeFileSync(out, buffer);
  console.log("OK ->", out);
});
