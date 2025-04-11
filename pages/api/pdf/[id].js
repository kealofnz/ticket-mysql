import { getConnection } from '../../../lib/db';
import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).send('Falta el ID de venta');

  const db = await getConnection();

  const [ventaData] = await db.execute(
    "SELECT v.*, c.CLIENTE AS nombre_cliente, c.DIRECCION, c.TELEFONO, " +
    "vd.NOMBRE AS nombre_vendedor " +
    "FROM `VENTA` v " +
    "LEFT JOIN `CLIENTES` c ON v.`ID CLIENTE` = c.`ID CLIENTE` " +
    "LEFT JOIN `VENDEDORES` vd ON v.`ID VENDEDOR` = vd.`ID VENDEDOR` " +
    "WHERE v.`ID VENTA` = ?", [id]);

  if (ventaData.length === 0) {
    return res.status(404).send('Venta no encontrada');
  }
  const venta = ventaData[0];

  const [detalles] = await db.execute(
    "SELECT dv.*, p.`NOMBRE PRODUCTO` FROM `DETALLE VENTA` dv " +
    "LEFT JOIN `PRODUCTO` p ON dv.`ID_PRODUCTO` = p.`ID PRODUCTO` " +
    "WHERE dv.`ID VENTA` = ?", [id]);

  const html = `
  <html>
  <head>
    <style>
      body { font-family: monospace; font-size: 12px; width: 58mm; margin: auto; }
      .center { text-align: center; }
      .line { border-top: 1px dashed #000; margin: 5px 0; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 2px 0; }
      .right { text-align: right; }
    </style>
  </head>
  <body>
    <div class="center">
      <h2>FACTURA</h2>
      <p>Gracias por su compra</p>
    </div>
    <div class="line"></div>
    <p><b>Cliente:</b> ${venta.nombre_cliente}</p>
    <p><b>Tel:</b> ${venta.TELEFONO || ''}</p>
    <p><b>Dirección:</b> ${venta.DIRECCION || ''}</p>
    <p><b>Vendedor:</b> ${venta.nombre_vendedor}</p>
    <p><b>Fecha:</b> ${venta['FECHA DE VENTA']}</p>
    <p><b>Pago:</b> ${venta['FORMA DE PAGO']}</p>
    <div class="line"></div>
    <table>
      ${detalles.map(item => `
        <tr>
          <td colspan="3">${item['NOMBRE PRODUCTO']}</td>
        </tr>
        <tr>
          <td>${item.CANTIDAD} x L${item['PRECIO UNITARIO']}</td>
          <td class="right" colspan="2">L${(item.CANTIDAD * item['PRECIO UNITARIO']).toFixed(2)}</td>
        </tr>
      `).join('')}
    </table>
    <div class="line"></div>
    <p class="right"><b>Descuento:</b> L${venta.DESCUENTO || 0}</p>
    <p class="right"><b>Total:</b> L${venta.TOTAL || detalles.reduce((acc, cur) => acc + cur.CANTIDAD * cur['PRECIO UNITARIO'], 0).toFixed(2)}</p>
    <div class="line"></div>
    <div class="center"><p>¡Vuelva pronto!</p></div>
  </body>
  </html>
  `;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({
    format: 'A4',
    width: '58mm',
    printBackground: true,
    margin: { top: '10px', bottom: '10px', left: '5px', right: '5px' }
  });

  await browser.close();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=ticket-${id}.pdf`);
  res.send(pdf);
}
