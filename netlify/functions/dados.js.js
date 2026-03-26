exports.handler = async function (event) {
  const SHEET_ID = process.env.SHEET_ID;
  const API_KEY  = process.env.GOOGLE_API_KEY;

  if (!SHEET_ID || !API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Variáveis de ambiente não configuradas.' }),
    };
  }

  const { sheet, range } = event.queryStringParameters || {};

  if (!sheet || !range) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Parâmetros "sheet" e "range" são obrigatórios.' }),
    };
  }

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/` +
    `${encodeURIComponent(sheet + '!' + range)}?key=${encodeURIComponent(API_KEY)}`;

  try {
    const res  = await fetch(url);
    const json = await res.json();

    if (json.error) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: json.error.message || 'Erro da API do Google.' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: json.values || [] }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
