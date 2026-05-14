# PWA icons mapping

Esta pasta contem os assets de icone usados pelo PWA (`vite.config.js` -> `manifest.icons`) e a pelo Service Worker para notificacoes push (`src/sw.ts`).

## Origem (single source of truth)

Toda a familia de icones do PWA deriva do mesmo SVG mestre:

- `public/icons/source.svg` -> copia do logo principal `public/favicon.svg`, com a cor da marca aplicada (`#37602c`). Este SVG e o ponto de partida unico para gerar todas as variantes raster.

Se o branding mudar, atualizar so este ficheiro e voltar a correr a geracao.

## Mapeamento source -> output

| Source                    | Output                          | Tamanho   | Usado por                                      | Notas                                                          |
| ------------------------- | ------------------------------- | --------- | ---------------------------------------------- | -------------------------------------------------------------- |
| `public/icons/source.svg` | `public/icons/icon-192.png`     | 192 x 192 | `vite.config.js` manifest, push (`sw.ts`)      | "any" purpose. PNG opaco com fundo `#fdf7e8`.                  |
| `public/icons/source.svg` | `public/icons/icon-512.png`     | 512 x 512 | `vite.config.js` manifest                      | "any" purpose. Splash/install Android.                         |
| `public/icons/source.svg` | `public/icons/icon-maskable.png`| 512 x 512 | `vite.config.js` manifest (`purpose: maskable`)| Conteudo dentro do safe-area de 80%. Fundo `#fdf7e8` cheio.    |
| `public/favicon.svg`      | `public/favicon.svg`            | vetor     | `index.html` (`<link rel="icon">`)             | Continua a servir como favicon vetorial, nao precisa duplicar. |
| `public/loading.png`      | `public/loading.png`            | raster    | `LoadingScreen.tsx`, `ErrorScreen.tsx`         | Imagem de splash interna; nao e icone PWA.                     |

## Outros assets de imagem do app (referencia, NAO entram em `public/icons`)

| Asset                            | Tipo               | Local de uso                | Funcao                                                    |
| -------------------------------- | ------------------ | --------------------------- | --------------------------------------------------------- |
| `public/favicon.svg`             | SVG vetorial       | `index.html`                | Favicon do browser.                                       |
| `public/icons.svg`               | Sprite SVG default | (nao referenciado pela app) | Sprite de exemplo. Pode ser removido se nao for usado.    |
| `public/loading.png`             | PNG                | LoadingScreen, ErrorScreen  | Imagem de splash do preload.                              |
| `src/assets/session-joint.png`   | PNG                | `pages/CreateEvent.tsx`     | Ilustracao decorativa do slider de intensidade.           |
| `src/assets/hero.png`            | PNG                | (nao referenciado)          | Hero placeholder; remover ou re-usar em landing futura.   |
| `src/assets/react.svg`           | SVG default Vite   | (nao referenciado)          | Pode ser removido.                                        |
| `src/assets/vite.svg`            | SVG default Vite   | (nao referenciado)          | Pode ser removido.                                        |

## Como gerar os PNGs

Os tres PNGs sao gerados a partir de `source.svg` com o script `scripts/generate-pwa-icons.mjs`:

```bash
# Instalar a dependencia uma vez (dev only)
npm install --save-dev sharp

# Gerar/atualizar os tres icones
node scripts/generate-pwa-icons.mjs
```

O script faz:

1. Le `public/icons/source.svg`.
2. Gera `icon-192.png`, `icon-512.png` (any) com fundo `#fdf7e8`.
3. Gera `icon-maskable.png` com o logo escalado a 80% e centrado, no mesmo fundo, para satisfazer o safe-area do Android maskable.

## Validacao

Apos gerar:

1. `npm run build`
2. `npm run preview`
3. Abrir o site, DevTools -> Application -> Manifest. Confirmar:
   - 192, 512 e maskable carregam sem 404.
   - Maskable mostra o logo dentro do circulo de preview.
4. Em Chrome, instalar a app e confirmar que o icone na home/dock e o esperado.
