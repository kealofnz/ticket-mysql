# Proyecto Ticket MySQL con Next.js

Este proyecto genera tickets de venta desde una base de datos MySQL usando Next.js y puede desplegarse fácilmente en Vercel.

## 📂 Estructura
- `pages/ventas/[id].js`: Página que carga la venta con ID dinámico.
- `lib/db.js`: Conexión a la base de datos.
- `.env.local`: Debes crearlo en Vercel con tus variables de conexión.

## 🔐 Variables de Entorno (en Vercel)
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

## 🚀 Deploy
1. Sube este proyecto a GitHub.
2. Importa el repo en Vercel.
3. Agrega las variables de entorno.
4. ¡Listo!

Accede a: `https://tu-app.vercel.app/ventas/123`
