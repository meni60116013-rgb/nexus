# Nexus Genesis

Reconstrucción completa e independiente del proyecto Nexus: sin Lovable,
stack propio (Vite + React + TypeScript + Tailwind), sin la SSR de TanStack
Start que causaba pantallas en blanco por variables de entorno perdidas.

## Diferencias clave vs. la versión anterior (Lovable)

- El cliente de Supabase (`src/lib/supabase.ts`) **nunca lanza una
  excepción** si faltan las variables de entorno: la app entera sigue viva y
  las pantallas que necesitan datos reales muestran un aviso, no una
  pantalla en blanco.
- Sin SSR: es una SPA pura (Vite), más simple de desplegar y depurar en
  Vercel.
- Diseño propio (paleta "plano técnico": petróleo + cian + ámbar), no la
  plantilla genérica generada por Lovable.

## Desarrollo local

```bash
npm install
cp .env.example .env   # completa con tus credenciales de Supabase
npm run dev
```

## Despliegue en Vercel

1. Sube este repo a GitHub.
2. Conéctalo en Vercel (Framework: Vite, se detecta solo).
3. En Settings → Environment Variables agrega `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_PUBLISHABLE_KEY` (Production).
4. Deploy.

Si no configuras Supabase, la app sigue funcionando igual: landing y
configurador funcionan sin base de datos; solo login/panel piden que
conectes Supabase.

