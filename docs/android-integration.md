# Integração de Saúde Android (Samsung Health / Mi Band)

Para usuários de Android (Samsung, Xiaomi, Pixel), a melhor rota para trazer dados (Passos, Peso, Sono) para o LifeOS (PWA) é via **Google Fit**.

## O Fluxo de Dados 🔄

1.  **Dispositivo (Galaxy Watch / Mi Band)** registra os dados.
2.  **App do Dispositivo (Samsung Health / Mi Fitness)** sincroniza com o celular.
3.  **Health Connect (Android)** centraliza esses dados.
4.  **Google Fit** lê do Health Connect e sobe para a nuvem.
5.  **LifeOS** consulta a API do Google Fit na nuvem.

## Passo 1: Preparar o Celular (Usuário) 📱

1.  **Instale o Google Fit** na Play Store.
2.  **Instale o "Health Connect"** (se seu Android for antigo, no Android 14 já vem nativo).
3.  **No Samsung Health:**
    - Vá em Configurações -> Health Connect.
    - Ative a permissão para "Escrever" dados (Passos, Peso, Sono).
4.  **No Google Fit:**
    - Vá em Configurações -> Sincronizar com Health Connect.
    - Ative a permissão para "Ler" dados.

*Agora, seus passos do Galaxy Watch devem aparecer no app do Google Fit.*

## Passo 2: Configurar API Google (Desenvolvedor) 👨‍💻

Precisamos criar as credenciais para o LifeOS ler essa API.

1.  Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2.  Crie um novo projeto: `vital-os-health`.
3.  No menu "APIs & Services" -> "Enable APIs":
    - Procure e ative: **Fitness API**.
4.  Em "Credentials" -> "Create Credentials" -> "OAuth Client ID":
    - **Application Type:** Web Application.
    - **Authorized JavaScript Origins:**
        - `http://localhost:3000` (Para testes)
        - `https://seu-projeto.vercel.app` (Sua URL de produção)
    - **Authorized Redirect URIs:**
        - `http://localhost:3000/api/auth/callback/google`
        - `https://seu-projeto.vercel.app/api/auth/callback/google`
5.  Copie o **Client ID** e **Client Secret**.

## Passo 3: Configurar Variáveis de Ambiente 🔐

Adicione no seu arquivo `.env.local`:

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
```

## Passo 4: Implementação no Código 💻

Vamos precisar:
1.  Adicionar "Login com Google" (já temos Clerk, mas precisamos do *escopo* do Fit).
    *   *Opção A:* Usar o Clerk para gerenciar o token do Google (mais fácil).
    *   *Opção B:* Fazer um fluxo OAuth manual só para o Fit.

**Recomendação:** Usar o Clerk.
No painel do Clerk (Dashboard -> User Authentication -> Social Connections):
1.  Habilite **Google**.
2.  Nas configurações do Google no Clerk, adicione os escopos:
    - `https://www.googleapis.com/auth/fitness.activity.read`
    - `https://www.googleapis.com/auth/fitness.body.read`
    - `https://www.googleapis.com/auth/fitness.sleep.read`

Assim, quando o usuário logar (ou reconectar) com Google, já ganhamos acesso aos dados! 🚀
