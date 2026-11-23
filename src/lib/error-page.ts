export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Algo não saiu como esperado — Maria Clara Passos</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.6 system-ui, -apple-system, sans-serif; background: #f8f3eb; color: #36261e; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2.25rem; background: #fdfbf7; border: 1px solid #e5d8c8; border-radius: 1.5rem; }
      h1 { font-family: Georgia, serif; font-size: 1.5rem; font-weight: 500; margin: 0 0 0.75rem; }
      p { color: #6e5c52; margin: 0 0 1.75rem; }
      .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.65rem 1.35rem; border-radius: 9999px; font: inherit; font-weight: 500; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #a85232; color: #fdfbf7; }
      .secondary { background: transparent; color: #36261e; border-color: #d4c4b2; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Não foi possível carregar esta página</h1>
      <p>Ocorreu uma instabilidade temporária. Você pode tentar novamente agora ou voltar para a página inicial.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Tentar novamente</button>
        <a class="secondary" href="/">Voltar ao início</a>
      </div>
    </div>
  </body>
</html>`;
}
