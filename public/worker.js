
const regex = /(DATASUL|----|Página)/gim;
const regexSpage = /(       )/gim;
const separador = "  ";

const ignorarLinha = function (linha, cabecalho) {
  if (linha == "" || linha == "\r" || linha == "\f") return true;
  const resultadoRegex = linha.match(regex);
  const resultadoRegexEspacos = linha.match(regexSpage);

  const hasResultadoRegex = resultadoRegex && resultadoRegex.length;
  const hasResultadoRegexEspacos =
    resultadoRegexEspacos &&
    resultadoRegexEspacos.length &&
    resultadoRegexEspacos.length > 10;
  return hasResultadoRegex || hasResultadoRegexEspacos || linha == cabecalho;
};

const linhaSeparador = (proxima) => {
  const reg = /(-  -)/gm;
  return proxima.match(reg);
};

const getCabecalho = (linhas) => {
  let cabecalhoBarra = null;
  const encontrou = linhas.find((line, index) => {
    if (index + 1 < linhas.length) {
      const proximaSeparador = linhaSeparador(linhas[index + 1]);
      if (proximaSeparador) cabecalhoBarra = linhas[index + 1];
      return proximaSeparador;
    }
    return false;
  });

  const cabecalho = encontrou
    .split("  ")
    .map((coluna) => coluna.trim())
    .filter((coluna) => coluna.length);

  const colunas = [];

  const cabecalhoParts = cabecalhoBarra.split("  ");
  colunas.push({ inicio: 0, fim: cabecalhoParts[0].length + 2 });

  for (let i = 1; i < cabecalhoParts.length; i++) {
    colunas.push({
      inicio: colunas[i - 1].fim,
      fim: colunas[i - 1].fim + cabecalhoParts[i].length + 2,
    });
  }
  postMessage({
    type: "render",
    html: `
    <tr>
      ${cabecalho.map((col) => `<td> ${col} </td> `).join("")}
    </tr>`,
  });

  return { cabecalho, linha: encontrou, colunas };
};

const converterColuna = (linha, colunas) => {
  const converted = colunas.map((coluna) => {
    return linha.substring(coluna.inicio, coluna.fim);
  });
  postMessage({
    type: "render",
    html: `
    <tr>
      ${converted.map((col) => `<td> ${col} </td> `).join("")}
    </tr>`,
  });
  return converted;
};

const openFile = function (file) {
  const reader = new FileReader();

  reader.onload = function () {
    const text = reader.result;
    let lines = text.split("\n");

    const cabecalho = getCabecalho(lines);
    lines = lines.filter((line) => !ignorarLinha(line, cabecalho.linha));
    const colunas = lines.map((linha) => {
      return converterColuna(linha, cabecalho.colunas);
    });

    let csvContent =
      "data:text/csv;charset=utf-8," +
      `${cabecalho.cabecalho.join(";")} \n
    ${colunas.map((e) => e.join(";")).join("\n")}`;
    const encodedUri = encodeURI(csvContent);

    postMessage({
      type: "csv",
      csv: encodedUri,
    });
  };
  reader.readAsText(file);
};

onmessage = (event) => {
  switch (event.data.type) {
    case "convert":
      openFile(event.data.file);
      break;
  }
};
