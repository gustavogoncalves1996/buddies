# Buddies

Buddies e uma aplicacao social offline-first para descobrir, criar e gerir pequenos encontros de snacks. A ideia central e simples: pessoas podem encontrar eventos proximos no mapa, candidatar-se para participar, e hosts podem criar experiencias acolhedoras, gerir candidatos e manter a comunidade ativa mesmo quando a rede e instavel.

Este README funciona como documento de produto, referencia tecnica e plano de evolucao. Deve ajudar qualquer pessoa a perceber o que ja existe, como o projeto esta organizado, quais sao os blocos de codigo mais importantes, o que ainda falta desenvolver e que funcionalidades podem ser adicionadas no futuro.

## Indice

- [Estado atual](#estado-atual)
- [Objetivos do produto](#objetivos-do-produto)
- [Stack tecnica](#stack-tecnica)
- [Estrutura do repositorio](#estrutura-do-repositorio)
- [Fluxos principais](#fluxos-principais)
- [Arquitetura frontend](#arquitetura-frontend)
- [Modelo de dados Supabase](#modelo-de-dados-supabase)
- [Offline, PWA e push notifications](#offline-pwa-e-push-notifications)
- [Referencias de codigo importantes](#referencias-de-codigo-importantes)
- [Configuracao local](#configuracao-local)
- [Validacao e qualidade](#validacao-e-qualidade)
- [O que falta desenvolver](#o-que-falta-desenvolver)
- [Roadmap de features](#roadmap-de-features)
- [Checklist de desenvolvimento](#checklist-de-desenvolvimento)

## Estado atual

O projeto ja contem uma aplicacao React funcional com autenticacao Supabase, rotas protegidas, mapa de descoberta, criacao de eventos, candidatura a eventos, gestao de candidatos, perfil de utilizador, historico de eventos confirmados, localizacao, internacionalizacao, cache offline e configuracao PWA.

Estado resumido:

- Implementado: frontend React/Vite, rotas principais, store Zustand, Supabase client, schema SQL base, RLS, constraints principais de status/candidatura unica, upload de imagens, geolocalizacao, mapas Leaflet, i18n, PWA, service worker, cache offline e helpers de push no browser.
- Parcial: documentacao de push existe em [app/PWA_AND_PUSH.md](app/PWA_AND_PUSH.md), mas a pasta [supabase/functions/notify-host-on-application](supabase/functions/notify-host-on-application) esta vazia neste workspace.
- Pendente: testes automatizados, tipagem forte do store, robustez de erros, Edge Function real de push, fluxo completo de notificacoes, moderacao, chat, ratings reais, admin/ops e funcionalidades sociais avancadas.

## Objetivos do produto

Buddies deve permitir que a comunidade organize encontros de comida/snacks de pequena escala, com uma experiencia visual acolhedora e um fluxo simples para descoberta e participacao.

Objetivos principais:

- Descobrir eventos proximos num mapa.
- Ver detalhes de cada evento, host, capacidade e localizacao.
- Criar eventos com imagem, data, hora, local e limite de participantes.
- Permitir candidatura de utilizadores a eventos.
- Permitir que hosts aceitem ou rejeitem candidatos.
- Manter a contagem de participantes sincronizada.
- Funcionar razoavelmente bem com rede instavel atraves de cache, service worker e persistencia local.
- Suportar localizacao, moeda, idioma e timezone.
- Preparar a base para PWA instalavel e push notifications.

## Stack tecnica

Frontend:

- React 19
- Vite 8
- TypeScript em ficheiros `.tsx`/`.ts`, embora alguns blocos ainda usem `any`
- React Router 7
- Zustand 5 para estado global
- TanStack React Query 5 com persistencia em `localStorage`
- Tailwind CSS 4
- react-hook-form, zod e @hookform/resolvers
- Leaflet e react-leaflet
- i18next e react-i18next
- lucide-react para icones

Backend e infraestrutura:

- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security
- Supabase Storage, bucket esperado `event-images`
- Supabase Edge Functions, previstas para push notifications
- vite-plugin-pwa com Workbox `injectManifest`
- Capacitor 8 para shell mobile Android/iOS

Scripts disponiveis em [app/package.json](app/package.json):

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Estrutura do repositorio

Raiz principal da app:

- [app](app) contem o frontend, configuracao Vite, PWA, Capacitor e documentacao tecnica.
- [app/src/App.tsx](app/src/App.tsx) define rotas, wrappers globais e protecao de paginas.
- [app/src/main.tsx](app/src/main.tsx) inicializa React, providers, query persistence e registo PWA.
- [app/src/store/useStore.ts](app/src/store/useStore.ts) concentra estado global, mapeamento de dados e mutations Supabase.
- [app/src/utils/supabase.ts](app/src/utils/supabase.ts) inicializa o cliente Supabase.
- [app/src/i18n.ts](app/src/i18n.ts) contem as traducoes.
- [app/src/contexts/LocaleContext.tsx](app/src/contexts/LocaleContext.tsx) gere idioma, pais, moeda, timezone e formatadores `Intl`.
- [app/src/lib/queryClient.ts](app/src/lib/queryClient.ts) configura React Query e persistencia offline.
- [app/src/lib/push.ts](app/src/lib/push.ts) contem helpers de subscricao e remocao de Web Push.
- [app/src/sw.ts](app/src/sw.ts) contem o service worker customizado.
- [app/src/pages](app/src/pages) contem as paginas de rota.
- [app/src/components](app/src/components) contem componentes reutilizaveis.
- [app/public](app/public) contem assets estaticos e referencias de design.
- [app/vite.config.js](app/vite.config.js) configura React, Tailwind e PWA.
- [app/PWA_AND_PUSH.md](app/PWA_AND_PUSH.md) documenta o plano operacional de PWA/push.

Backend e dados:

- [supabase/schema.sql](supabase/schema.sql) contem tabelas, RLS, trigger de perfil e dados seed.
- [supabase/functions/notify-host-on-application](supabase/functions/notify-host-on-application) existe, mas esta vazia e deve receber a Edge Function de push.

Design/reference screens:

- [app/public/DESIGN SYSTEM.md](app/public/DESIGN%20SYSTEM.md)
- [app/public/dashboard/code.html](app/public/dashboard/code.html)
- [app/public/create event/code.html](app/public/create%20event/code.html)
- [app/public/event details/code.html](app/public/event%20details/code.html)
- [app/public/my hosted snacks/code.html](app/public/my%20hosted%20snacks/code.html)
- [app/public/user profile/code.html](app/public/user%20profile/code.html)
- [design](design)

## Fluxos principais

### Autenticacao

- Utilizadores fazem login e signup atraves de Supabase Auth.
- A tabela `profiles` guarda a representacao publica do utilizador.
- O trigger `handle_new_user()` em [supabase/schema.sql](supabase/schema.sql) cria automaticamente um perfil quando um novo utilizador entra em `auth.users`.
- As rotas privadas sao protegidas por [app/src/components/ProtectedRoute.tsx](app/src/components/ProtectedRoute.tsx).

### Descoberta

- A pagina [app/src/pages/Home.tsx](app/src/pages/Home.tsx) apresenta eventos proximos.
- A localizacao do utilizador e pedida no arranque por `requestLocation()`.
- A distancia e calculada no store com Haversine.
- Eventos podem ser ordenados/filtrados por proximidade quando existe permissao de geolocalizacao.

### Criacao de evento

- A pagina [app/src/pages/CreateEvent.tsx](app/src/pages/CreateEvent.tsx) gere formulario, data, hora, localizacao e imagem.
- [app/src/components/AddressAutocomplete.tsx](app/src/components/AddressAutocomplete.tsx) suporta procura de local.
- [app/src/components/ImageUpload.tsx](app/src/components/ImageUpload.tsx) suporta imagem de capa.
- `uploadEventImage()` envia imagens para o bucket Supabase `event-images`.
- `addEvent()` insere o evento na tabela `events`.

### Candidaturas

- A pagina [app/src/pages/EventDetail.tsx](app/src/pages/EventDetail.tsx) permite candidatura a um evento.
- `applyToEvent(eventId, message)` cria uma linha em `applicants`.
- A action impede candidaturas duplicadas no estado local.
- O host gere candidatos em [app/src/pages/MyHostedSnacks.tsx](app/src/pages/MyHostedSnacks.tsx).
- `updateApplicantStatus(applicantId, status)` altera o estado do candidato e atualiza `events.current_snackers` quando necessario.

### Perfil e historico

- [app/src/pages/Profile.tsx](app/src/pages/Profile.tsx) mostra perfil, bio, hobbies, rating e eventos passados.
- [app/src/pages/ConfirmedEvents.tsx](app/src/pages/ConfirmedEvents.tsx) mostra eventos confirmados e serve como exemplo de fluxo offline-first.

### PWA e notificacoes

- [app/src/components/OfflineBanner.tsx](app/src/components/OfflineBanner.tsx) mostra estado offline.
- [app/src/components/PushPrompt.tsx](app/src/components/PushPrompt.tsx) pede permissao de notificacao quando suportado.
- [app/src/lib/push.ts](app/src/lib/push.ts) guarda `push_subscription` no perfil.
- A parte server-side de envio de push ainda precisa ser implementada em [supabase/functions/notify-host-on-application](supabase/functions/notify-host-on-application).

## Arquitetura frontend

### Rotas

As rotas principais estao em [app/src/App.tsx](app/src/App.tsx):

```tsx
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<SignUp />} />

<Route element={<ProtectedRoute />}>
  <Route element={<Layout />}>
    <Route path="/" element={<Home />} />
    <Route path="/create" element={<CreateEvent />} />
    <Route path="/event/:id" element={<EventDetail />} />
    <Route path="/manage" element={<MyHostedSnacks />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/create/:eventId" element={<CreateEvent />} />
    <Route path="/confirmed" element={<ConfirmedEvents />} />
  </Route>
</Route>
```

Wrappers globais:

- `ErrorBoundary` para capturar erros React.
- `LoadingScreen` para estado global de carregamento.
- `ToastHost` para mensagens temporarias.
- `OfflineBanner` para conectividade.
- `PushPrompt` para notificacoes.
- `ProtectedRoute` para acesso autenticado.
- `Layout` para shell de navegacao.

### Estado global

O store em [app/src/store/useStore.ts](app/src/store/useStore.ts) concentra:

- Sessao Supabase.
- Listas de `users`, `events`, `pastEvents` e `applicants`.
- Estado de UI: pesquisa, localizacao, loading e toasts.
- Selectors derivados: `getCurrentUser`, `getHost`, `getEvent`, `getMyEvents`, `getApplicantsForEvent`, `getNearbyEvents`.
- Actions de auth: `initAuth`, `signIn`, `signUp`, `signOut`.
- Fetches: `fetchProfiles`, `fetchEvents`, `fetchPastEvents`, `fetchApplicants`, `fetchAll`.
- Mutations: `addEvent`, `updateEvent`, `cancelEvent`, `applyToEvent`, `updateApplicantStatus`.
- Upload de imagens: `uploadEventImage`.

### Normalizacao de dados

O projeto usa tabelas Supabase em `snake_case` e modelos UI em `camelCase`. A normalizacao esta centralizada no store para evitar dependencias diretas das tabelas dentro dos componentes.

Exemplo importante em [app/src/store/useStore.ts](app/src/store/useStore.ts):

```ts
const mapEvent = (e) => ({
  id: e.id,
  title: e.title,
  description: e.description,
  hostId: e.host_id,
  date: e.date,
  time: e.time,
  location: e.location,
  lat: e.lat,
  lng: e.lng,
  maxSnackers: e.max_snackers,
  currentSnackers: e.current_snackers,
  snackSize: e.snack_size,
  image: e.image,
  status: e.status,
  tag: e.tag,
  walkTime: e.walk_time,
});
```

### Localizacao e formato regional

[app/src/contexts/LocaleContext.tsx](app/src/contexts/LocaleContext.tsx) deteta preferencia regional e disponibiliza:

- `language`
- `countryCode`
- `locale`
- `currency`
- `currencySymbol`
- `timeZone`
- `formatCurrency(value)`
- `formatNumber(value)`
- `formatDate(value)`
- `setLocalePreferences(next)`

A preferencia fica em `localStorage` com a chave `buddies.locale.v1`.

### i18n

As traducoes vivem em [app/src/i18n.ts](app/src/i18n.ts). Todas as strings visiveis ao utilizador devem usar chaves de i18n em vez de texto hardcoded nos componentes.

Areas cobertas atualmente:

- `common`
- `app`
- `nav`
- `notifications`
- `localeExample`
- `home`
- `login`
- `signUp`
- `createEvent`
- `eventDetail`
- `manage`
- `profile`
- `confirmed`

## Modelo de dados Supabase

O schema base esta em [supabase/schema.sql](supabase/schema.sql).

### Tabelas principais

`profiles`:

- `id uuid primary key`
- `auth_id uuid unique references auth.users(id)`
- `name`
- `avatar`
- `bio`
- `favorite_snack`
- `hobbies text[]`
- `rating`
- `events_hosted`
- `events_attended`
- `badge`
- `created_at`

`events`:

- `id bigserial primary key`
- `title`
- `description`
- `host_id references profiles(id)`
- `date`
- `time`
- `location`
- `lat`
- `lng`
- `max_snackers`
- `current_snackers`
- `snack_size`
- `image`
- `status`
- `tag`
- `walk_time`
- `created_at`

`applicants`:

- `id bigserial primary key`
- `event_id references events(id)`
- `user_id references profiles(id)`
- `name`
- `avatar`
- `message`
- `status`, com valores esperados `pending`, `accepted`, `rejected`
- `created_at`

`past_events`:

- `id bigserial primary key`
- `user_id references profiles(id)`
- `title`
- `location`
- `date`
- `image`
- `tag`

### RLS

Politicas implementadas:

- Perfis podem ser vistos por todos.
- Utilizadores podem inserir/atualizar o proprio perfil.
- Eventos podem ser vistos por todos.
- Utilizadores autenticados podem criar eventos se `host_id` pertence ao seu perfil.
- Hosts podem atualizar/apagar os proprios eventos.
- Past events podem ser vistos por todos, mas geridos apenas pelo dono.
- Applicants podem ser vistos por todos.
- Utilizadores autenticados podem candidatar-se usando o proprio perfil.
- Hosts podem atualizar estado de candidatos dos seus eventos.
- O schema tambem define constraints para estados validos de eventos/candidaturas e para impedir candidaturas duplicadas ao mesmo evento.

Ponto de melhoria: a politica atual de `Applicants viewable by everyone` e simples para desenvolvimento, mas em producao pode expor candidaturas publicamente. Uma evolucao recomendada e limitar leitura ao candidato e ao host.

### Trigger de perfil

Quando um utilizador entra em `auth.users`, a funcao `handle_new_user()` cria uma linha em `profiles` com nome e avatar default.

```sql
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### Storage

Bucket esperado:

- `event-images`

Usado por `uploadEventImage()` em [app/src/store/useStore.ts](app/src/store/useStore.ts). O helper valida tipo de ficheiro, tamanho maximo de 5 MB, faz upload e devolve URL publica.

## Offline, PWA e push notifications

### Query cache

[app/src/lib/queryClient.ts](app/src/lib/queryClient.ts) define defaults para comportamento offline-first:

```ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24 * 7,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      retry: 1,
      networkMode: "offlineFirst",
    },
    mutations: {
      networkMode: "offlineFirst",
    },
  },
});
```

A cache fica em `localStorage` com a chave `buddies-query-cache-v1`.

### Service worker

[app/src/sw.ts](app/src/sw.ts) implementa:

- Precache dos assets de build.
- Fallback de navegacao para deep links SPA.
- `CacheFirst` para imagens.
- `NetworkFirst` para requests Supabase.
- `StaleWhileRevalidate` para Nominatim.
- `push` event listener.
- `notificationclick` event listener.
- `SKIP_WAITING` por mensagem.

### Vite PWA

[app/vite.config.js](app/vite.config.js) usa `VitePWA` com `injectManifest` e service worker proprio em [app/src/sw.ts](app/src/sw.ts).

Manifest atual:

- Nome: `Buddies Club`
- Display: `standalone`
- Orientacao: `portrait`
- Start URL: `/`
- Icons esperados em `public/icons`, diretorio que ainda precisa ser criado/populado se os assets PWA nao existirem.

### Push notifications

Client-side implementado em [app/src/lib/push.ts](app/src/lib/push.ts):

- Verifica suporte a Service Worker, PushManager e Notification.
- Pede permissao ao browser.
- Cria PushSubscription com `VITE_VAPID_PUBLIC_KEY`.
- Guarda `push_subscription` no perfil Supabase.
- Permite unsubscribe e limpeza da subscription.

E esperado que `profiles.push_subscription` esteja `null` inicialmente. A coluna so passa a ter JSON quando um utilizador autenticado aceita notificacoes no browser e a app executa `subscribeUserToPush(profileId)`. Os perfis seed/demo tambem ficam normalmente com `push_subscription = null`, porque nao representam uma subscricao real de browser.

Server-side pendente:

- Criar `index.ts` dentro de [supabase/functions/notify-host-on-application](supabase/functions/notify-host-on-application).
- Configurar secrets VAPID no Supabase.
- Criar webhook `applicants INSERT` para chamar a Edge Function.
- Fazer lookup de evento, host e `push_subscription`.
- Enviar Web Push.
- Limpar subscriptions expiradas em erros `404` ou `410`.

As notas operacionais completas estao em [app/PWA_AND_PUSH.md](app/PWA_AND_PUSH.md).

## Referencias de codigo importantes

### Inicializacao da app

Ver [app/src/App.tsx](app/src/App.tsx) e [app/src/main.tsx](app/src/main.tsx).

Responsabilidades:

- Inicializar auth.
- Pedir localizacao.
- Definir rotas.
- Montar providers.
- Registar PWA.
- Mostrar loading, offline banner, push prompt e toasts.

### Supabase client

Ver [app/src/utils/supabase.ts](app/src/utils/supabase.ts).

Este ficheiro deve continuar a ser a unica origem do cliente Supabase. Nao espalhar `createClient()` por componentes.

### Mutation de criacao de evento

Em [app/src/store/useStore.ts](app/src/store/useStore.ts):

```ts
addEvent: async (event) => {
  const me = get().getCurrentUser();
  if (!me) throw new Error("Not signed in");

  const payload = {
    title: event.title,
    description: event.description,
    host_id: me.id,
    date: event.date,
    time: event.time,
    location: event.location,
    lat: event.lat,
    lng: event.lng,
    max_snackers: event.maxSnackers,
    current_snackers: event.currentSnackers ?? 0,
    snack_size: event.snackSize,
    image: event.image,
    status: event.status ?? "planning",
    tag: event.tag,
    walk_time: event.walkTime,
  };

  const { data, error } = await supabase
    .from("events")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  set((s) => ({ events: [...s.events, mapEvent(data)] }));
  await get().fetchEvents();
  return mapEvent(data);
}
```

### Mutation de candidatura

Em [app/src/store/useStore.ts](app/src/store/useStore.ts):

```ts
applyToEvent: async (eventId, message) => {
  const me = get().getCurrentUser();
  if (!me) throw new Error("Not signed in");

  const existing = get().applicants.find(
    (a) => a.eventId === eventId && a.userId === me.id
  );
  if (existing) {
    const err = new Error("You've already applied to this snack.");
    err.code = "DUPLICATE_APPLICATION";
    throw err;
  }

  const payload = {
    event_id: eventId,
    user_id: me.id,
    name: me.name,
    avatar: me.avatar,
    message,
    status: "pending",
  };

  const { data, error } = await supabase
    .from("applicants")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  set((s) => ({ applicants: [...s.applicants, mapApplicant(data)] }));
  return mapApplicant(data);
}
```

### Mutation de aceitacao/rejeicao

`updateApplicantStatus(applicantId, status)` atualiza a candidatura e ajusta `current_snackers` quando o estado entra ou sai de `accepted`. Este comportamento e central para manter capacidade e vagas coerentes.

### Geolocalizacao e proximidade

O store inclui `requestLocation()` e `getNearbyEvents(radiusKm = 10)`. A distancia e calculada com Haversine em km.

### Push subscription

Em [app/src/lib/push.ts](app/src/lib/push.ts), `subscribeUserToPush(profileId)` cria a subscricao browser e grava no perfil:

```ts
const { error } = await supabase
  .from("profiles")
  .update({ push_subscription: sub.toJSON() })
  .eq("id", profileId);
```

O schema principal ja inclui `profiles.push_subscription jsonb`; falta apenas a Edge Function/webhook para transformar essa subscricao guardada em notificacoes enviadas pelo servidor.

## Configuracao local

### Pre-requisitos

- Node.js compativel com Vite 8.
- npm.
- Projeto Supabase criado.
- `.env.local` com variaveis frontend.

### Instalar dependencias

```bash
npm install
```

### Variaveis de ambiente

Criar `.env.local` na pasta [app](app):

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_VAPID_PUBLIC_KEY=...
```

Notas:

- Nao commitar `.env.local`.
- A chave VAPID publica pode ir no frontend.
- A chave VAPID privada deve ficar apenas nos secrets da Edge Function Supabase.

### Base de dados

Aplicar [supabase/schema.sql](supabase/schema.sql) no SQL Editor do Supabase.

O schema ja inclui `profiles.push_subscription jsonb`; depois de aplicar o ficheiro, a parte client-side de subscricao push fica pronta. O envio real continua dependente da Edge Function e dos secrets VAPID.

O ficheiro tambem limpa dados seed antes dos inserts com `TRUNCATE` e reinicia as sequencias de `events`, `applicants` e `past_events`, para que os IDs de exemplo voltem a comecar em 1. Isto deve ser usado apenas em desenvolvimento: `TRUNCATE public.profiles` apaga tambem perfis ligados a utilizadores reais, embora nao apague os registos em `auth.users`.

Depois de executar o seed, `profiles.push_subscription` deve continuar `null` ate cada utilizador ativar push na app. Se continuar `null` depois de carregar em ativar notificacoes, verificar:

- App aberta em `localhost` ou HTTPS.
- `VITE_VAPID_PUBLIC_KEY` definido em `.env.local`.
- Browser com suporte a Service Worker, PushManager e Notification.
- Permissao de notificacoes concedida no browser.
- Service Worker registado; para teste mais realista usar `npm run build` e `npm run preview`.
- Utilizador autenticado tem um perfil em `public.profiles` com `auth_id = auth.uid()`.

### Desenvolvimento

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview PWA

```bash
npm run build
npm run preview
```

Usar preview para testar Service Worker de forma mais realista.

## Validacao e qualidade

Comandos recomendados antes de merge:

```bash
npm run lint
npm run build
```

Notas conhecidas:

- O lint pode reportar um `ESLintEnvWarning` relacionado com o comentario `eslint-env` em [app/src/sw.ts](app/src/sw.ts), mas atualmente sai com sucesso.
- O build pode avisar sobre chunks grandes por causa de dependencias de mapa/PWA.
- Os assets gerados por Capacitor em [app/android](app/android) e [app/ios](app/ios) nao devem ser tratados como fonte principal para lint/refactor.

Testes manuais recomendados:

- Signup/login/logout.
- Criar evento com localizacao e imagem.
- Ver evento no mapa/home.
- Candidatar-se a evento.
- Aceitar/rejeitar candidato como host.
- Confirmar que `current_snackers` muda corretamente.
- Abrir `/confirmed` online, desligar rede e verificar render offline.
- Testar permissao de push em `localhost` ou HTTPS.

## O que falta desenvolver

### Produto

- Melhorias avancadas no fluxo de edicao/cancelamento/reagendamento, como notificacoes automaticas aos candidatos.
- Chat entre host e participantes aceites.
- Feedback, reviews e rating real depois do evento.
- Waitlist quando a capacidade estiver cheia.
- Descoberta com filtros avancados adicionais, como preferencias pessoais e ordenacao por recomendacao.
- Preferencias alimentares e alergias.
- Moderacao e reporting.
- Experiencia de onboarding.
- Settings avancadas de privacidade, conta e preferencia alimentar.
- Painel admin/ops.

### Backend

- Edge Function real para [supabase/functions/notify-host-on-application](supabase/functions/notify-host-on-application).
- Edge Function e webhook para usar `profiles.push_subscription` em notificacoes reais.
- Politicas RLS mais restritivas para `applicants`.
- Validacao server-side de inputs importantes.
- Auditoria de transicoes de estado.
- Jobs ou functions para mover eventos passados para `past_events`.

### Frontend

- Tipagem forte do store Zustand.
- Separacao do store em slices ou data hooks.
- Normalizacao de erros para UI consistente.
- Skeleton/loading states em todas as paginas.
- Estados vazios mais completos.
- Melhor acessibilidade de formularios e mapa.
- Split de bundles em rotas pesadas.
- Testes unitarios, integracao e e2e.

### Mobile/PWA

- Criar e validar icons PWA reais em `public/icons`.
- Fluxo de instalacao PWA.
- Testes offline com Cache Storage e query persistence.
- Validar Android/iOS Capacitor com builds nativos.
- Push notifications end-to-end em browser suportado.

## Roadmap de features

As listas abaixo separam possiveis novas funcionalidades por horizonte de desenvolvimento. Curto prazo foca melhorias incrementais e baixo risco; medio prazo aprofunda produto e dados; longo prazo expande plataforma, comunidade e monetizacao.

### Curto prazo: features possiveis

1. Implementado: editar evento criado pelo host em `/create/:eventId`.
2. Implementado: cancelar evento com badge visual de cancelado.
3. Implementado: reagendar evento editando data e hora no mesmo formulario.
4. Implementado: filtro por distancia no mapa.
5. Implementado: filtro por data: hoje, fim de semana, proximos 7 dias.
6. Implementado: pesquisa por titulo, localizacao, tag e descricao.
7. Implementado: estado vazio melhorado quando filtros nao encontram eventos.
8. Implementado: skeleton loading dedicado para Home, Event Detail, Profile e Manage.
9. Implementado: confirmacao antes de rejeitar candidato.
10. Implementado: badge visual para eventos cheios.
11. Implementado: indicador de vagas restantes em cards e detalhe.
12. Implementado: pagina de settings para idioma, moeda e notificacoes.
13. Implementado: botao para limpar cache offline local.
14. Implementado: melhor validacao de imagem antes do upload.
15. Implementado: crop central automatico de imagem de capa para formato 16:9.
16. Implementado: toasts padronizados para sucesso, erro e aviso.
17. Implementado: utilitario reutilizavel para normalizar mensagens de erro em falhas Supabase/UI.
18. Implementado: protecao contra candidatura no proprio evento tambem no store.
19. Parcial: validacao local e constraints SQL; validacao server-side completa fica para Edge Functions/backend.
20. Implementado: `profiles.push_subscription` no schema principal.
21. Implementado: duplo clique no mapa abre a pagina de criacao com localizacao preenchida.
22. Implementado: assets PWA (icon-192, icon-512, icon-maskable) gerados a partir de SVG mestre em [app/public/icons](app/public/icons) via [app/scripts/generate-pwa-icons.mjs](app/scripts/generate-pwa-icons.mjs).

Proximas 20 melhorias incrementais a curto prazo:

23. Adicionar shortcuts da PWA no `manifest` (criar evento, meus snacks) para arranque rapido a partir do icone instalado.
24. Mostrar bottom-sheet de detalhes ao tocar num pin do mapa, sem mudar de pagina.
25. Lembrar ultimo zoom/centro do mapa em `localStorage` por utilizador.
26. Botao "centrar no meu sitio" no mapa quando ha permissao de geolocalizacao.
27. Recolher tag de evento (ex: vegan, doce, salgado) num chip filtravel persistente na Home.
28. Ordenar resultados por proximidade, data ou vagas restantes com selector visivel.
29. Pre-preencher data minima do formulario de criar evento para hoje + 1h, para evitar criacao de eventos no passado.
30. Validar que `time` + `date` do evento nao caem no passado tambem no client antes de submeter.
31. Mostrar contagem regressiva ("daqui a 3h") nos cards de evento quando faltam menos de 24h.
32. Marcar visualmente os eventos a que o utilizador ja se candidatou na lista da Home.
33. Pagina dedicada `/applied` (ou tab no perfil) com candidaturas pendentes/aceites/rejeitadas do utilizador.
34. Permitir ao candidato cancelar a propria candidatura enquanto esta `pending`.
35. Reabrir formulario de candidatura com a mensagem anterior quando ja existe uma rejeitada e o evento ainda esta aberto.
36. Mostrar avatar e nome do host clicaveis no `EventDetail`, abrindo um modal com perfil publico resumido.
37. Adicionar partilha nativa (`navigator.share`) do link do evento com fallback para copiar URL.
38. Gerar deep links que abrem direto no evento mesmo via PWA standalone.
39. Compressao client-side de imagens (`canvas`/`createImageBitmap`) antes do upload, para reduzir tempo e cota de Storage.
40. Pre-visualizacao da imagem de capa imediatamente apos o crop 16:9, sem esperar pelo upload.
41. Estado de loading dedicado no botao de submeter formularios (criar evento, candidatura, perfil) com lock para impedir duplo submit.
42. Persistir rascunhos de criacao de evento em `localStorage` para nao perder dados se a app fechar.
43. Toggle de tema claro/escuro nas Settings, com deteccao de `prefers-color-scheme` por defeito.
44. Atualizar as descrições e referencias no site de bolos para CBD, e algo mais proximo desse conceito.
45. Corrigir erro dos números na criacao de evento, ao selecionar o dia do evento. (Os números na roda são atualizados sempre que o dia é atualizado, os dias deveriam estar fixos)
46. Corrigir o slide de escolha de hora do evento, tambem no painel de criacao de evento.
47. Validar se apenas o host consegue ver as candidaturas ao seu evento.


### Medio prazo: 20 features possiveis

1. Edge Function completa para push notification ao host quando alguem se candidata.
2. Notificacao ao candidato quando e aceite ou rejeitado.
3. Waitlist automatica para eventos cheios.
4. Auto-promocao da waitlist quando alguem cancela.
5. Perguntas personalizadas do host no formulario de candidatura.
6. Preferencias alimentares no perfil.
7. Alergias e restricoes alimentares com aviso ao host.
8. Chat entre host e participantes aceites.
9. Lista privada de participantes confirmados.
10. Check-in manual no evento.
11. Historico real de eventos frequentados.
12. Reviews pos-evento para host e participante.
13. Rating calculado a partir de reviews reais.
14. Guardar eventos favoritos.
15. Seguir hosts.
16. Recomendacoes baseadas em distancia, tags e historico.
17. Notificacoes por eventos de hosts seguidos.
18. Modo mapa/lista alternavel na descoberta.
19. Upload de multiplas imagens por evento.
20. Testes e2e para login, criar evento, candidatar e gerir candidatos.

### Longo prazo: 20 features possiveis

1. Sistema completo de moderacao de eventos e perfis.
2. Reporting de abuso, spam ou evento falso.
3. Painel admin para gerir utilizadores, eventos e reports.
4. Sistema de confianca com verificacao de hosts.
5. Eventos pagos com integracao de pagamentos.
6. Reembolsos e politica de cancelamento.
7. Convites privados por link.
8. Comunidades/grupos por bairro, cidade ou interesse.
9. Calendario integrado com Google Calendar/Apple Calendar.
10. Matching inteligente entre participantes e eventos.
11. Feed social de memorias pos-evento.
12. Fotos e comentarios depois do encontro.
13. Badges e conquistas baseados em comportamento real.
14. Programas de embaixadores/hosts premium.
15. Analytics para hosts: conversao, ocupacao e retorno de participantes.
16. Marketplace de snacks/fornecedores locais.
17. Multi-cidade com discovery por regioes.
18. Suporte nativo mobile completo via Capacitor.
19. Modo offline para rascunhos de eventos e candidaturas pendentes.
20. Arquitetura de auditoria e compliance para operacao em producao.

## Prioridades tecnicas recomendadas

## Passos manuais pendentes

Estas tarefas nao ficam completas apenas com codigo local porque exigem configuracao no Supabase, secrets, assets finais ou validacao em ambiente real.

### 1. Rever RLS de candidaturas antes de producao

1. Substituir a leitura publica de `applicants` por leitura limitada ao candidato e ao host.
2. Testar com dois utilizadores: host e participante.
3. Confirmar que um terceiro utilizador nao consegue ler candidaturas alheias.

### 2. Validar mobile nativo

1. Sincronizar Capacitor depois do build.
2. Abrir Android Studio/Xcode conforme a plataforma.
3. Testar login, mapa, criacao de evento, permissao de localizacao e camera/ficheiros.

Ordem sugerida para evoluir o projeto com menor risco:

1. Fortalecer o schema restante com indexes de leitura, RLS mais restritiva e novas tabelas futuras.
2. Implementar a Edge Function de notificacoes.
3. Restringir RLS de `applicants` para candidato e host.
4. Tipar o store Zustand e modelos de dominio.
5. Criar utilitario de erro padronizado.
6. Adicionar testes unitarios para mappers e mutations.
7. Adicionar e2e smoke tests para fluxos principais.
8. Melhorar loading, empty states e acessibilidade.
9. Separar dados remotos em hooks/data layer quando o store crescer.
10. Otimizar bundle e lazy loading de paginas pesadas.

## Checklist de desenvolvimento

Ao adicionar uma nova pagina:

- Criar pagina em [app/src/pages](app/src/pages).
- Adicionar rota em [app/src/App.tsx](app/src/App.tsx).
- Decidir se a rota e publica ou protegida.
- Adicionar strings em [app/src/i18n.ts](app/src/i18n.ts).
- Reutilizar componentes de [app/src/components](app/src/components).
- Usar selectors/actions de [app/src/store/useStore.ts](app/src/store/useStore.ts) quando fizer sentido.
- Evitar dependencias diretas de `snake_case` nas paginas.
- Validar loading, erro, estado vazio e mobile.
- Usar modais/componentes proprios para confirmacoes; nao usar `window.confirm`, `alert` ou popups nativas do browser em fluxos da app.
- Executar `npm run lint`.
- Executar `npm run build`.

Ao adicionar uma nova tabela/campo Supabase:

- Atualizar [supabase/schema.sql](supabase/schema.sql).
- Definir RLS desde o inicio.
- Atualizar mappers no store.
- Atualizar tipos/interfaces quando existirem.
- Atualizar documentacao neste README.
- Testar com utilizador dono e utilizador nao dono.

Ao alterar o service worker:

- Alterar [app/src/sw.ts](app/src/sw.ts).
- Testar com `npm run build && npm run preview`.
- Abrir DevTools, Application, Service Workers.
- Usar hard reload durante debugging.
- Limpar Cache Storage se houver comportamento stale.

## Troubleshooting rapido

### Build funciona mas a app parece desatualizada

Limpar no browser:

- Cache Storage.
- `localStorage` key `buddies-query-cache-v1`.
- `localStorage` key `buddies.locale.v1`.

### Push nao chega

- Confirmar `VITE_VAPID_PUBLIC_KEY` em `.env.local`.
- Confirmar permissao de notificacoes no browser.
- Confirmar que a app esta em `localhost` ou HTTPS.
- Confirmar coluna `profiles.push_subscription`.
- Confirmar que a Edge Function existe e esta deployed.
- Confirmar webhook `applicants INSERT`.
- Confirmar secrets VAPID no Supabase.

### Nao ha dados depois do login

- Confirmar `VITE_SUPABASE_URL`.
- Confirmar `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Confirmar trigger `handle_new_user()`.
- Confirmar RLS em [supabase/schema.sql](supabase/schema.sql).
- Ver erros no console do browser.

### Upload de imagem falha

- Confirmar bucket `event-images`.
- Confirmar permissao/policy de storage.
- Confirmar tamanho abaixo de 5 MB.
- Confirmar que o ficheiro e imagem.

## Referencias externas

- Vite: https://vite.dev
- React: https://react.dev
- React Router: https://reactrouter.com
- Zustand: https://zustand.docs.pmnd.rs
- TanStack Query: https://tanstack.com/query/latest
- Supabase: https://supabase.com/docs
- i18next: https://www.i18next.com
- Workbox: https://developer.chrome.com/docs/workbox
- vite-plugin-pwa: https://vite-pwa-org.netlify.app
- Leaflet: https://leafletjs.com
- Capacitor: https://capacitorjs.com/docs
