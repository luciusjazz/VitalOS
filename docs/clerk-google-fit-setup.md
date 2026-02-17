# Configuração do Clerk + Google Fit 🛡️

Para que o botão "Sync Fit" funcione, o Clerk precisa pedir permissão ao Google para ler os dados de saúde do usuário.

## Passo 1: Google Cloud Console ☁️
1.  Acesse [console.cloud.google.com](https://console.cloud.google.com/).
2.  Selecione seu projeto.
3.  Vá em **APIs & Services > OAuth consent screen**.
    *   **User Type:** Escolha **External** (Externo).
    *   Clique em **Create**.
    *   **App Name:** VitalOS.
    *   **User Support Email:** Seu email.
    *   **Developer Contact:** Seu email.
    *   **Save and Continue** (pode pular Scopes por enquanto).
    *   **Test Users:** ⚠️ **MUITO IMPORTANTE!** Adicione o SEU email aqui. Como o app não está verificado, só emails na lista podem fazer login.
4.  Agora sim, vá em **Credentials** > **+ CREATE CREDENTIALS** > **OAuth client ID**.
5.  **Application Type:** Web application.
6.  **Authorized redirect URIs:**
    *   Você precisa pegar essa URL no Clerk (passo abaixo).

## Passo 2: Clerk Dashboard 🔒
1.  Acesse [dashboard.clerk.com](https://dashboard.clerk.com/).
2.  Selecione seu app **VitalOS**.
3.  No menu lateral, vá em **User Authentication > Social Connections**.
4.  Encontre o **Google** e clique na engrenagem ⚙️ (Configure).
5.  **Habilite** "Use custom credentials" (se não estiver).
6.  Copie o **Authorized redirect URI** que o Clerk mostra aqui.
    *   Cole lá no Google Cloud Console (Passo 1.6).
7.  Copie o **Client ID** e **Client Secret** do Google Cloud.
    *   Cole aqui no Clerk.

## Passo 3: Adicionar Escopos (Scopes) ⚡ IMPORTANTE
Ainda nas configurações do Google no Clerk, procure a seção **Scopes** (pode estar em "Advanced" ou apenas rolando para baixo).

Adicione estes 3 escopos (separados por espaço ou um por linha):

```text
https://www.googleapis.com/auth/fitness.activity.read
https://www.googleapis.com/auth/fitness.body.read
https://www.googleapis.com/auth/fitness.nutrition.read
```

> **Nota:** Sem isso, o Google Fit vai dar erro de "sem permissão".

## Passo 4: Salvar
1.  Salve no Google Cloud.
2.  Salve no Clerk.

## Passo 5: Testar
1.  No VitalOS, faça **Logout**.
2.  Faça **Login com Google** novamente.
    *   O Google deve mostrar uma tela: *"VitalOS quer acessar seus dados de Atividade Física"*.
3.  Aceite as permissões.
4.  Vá no Dashboard e clique em **Sync Fit**.
