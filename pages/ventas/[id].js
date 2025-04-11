import { getConnection } from '../../lib/db';
import { useEffect } from 'react'; // 👈 NUEVA LÍNEA

export async function getServerSideProps({ params }) {
  const id = params.id;
  const db = await getConnection();

  const [ventaRows] = await db.execute(
    "SELECT v.*, c.CLIENTE AS nombre_cliente, vd.NOMBRE AS nombre_vendedor " +
    "FROM VENTA v " +
    "LEFT JOIN CLIENTES c ON v.`ID CLIENTE` = c.`ID CLIENTE` " +
    "LEFT JOIN VENDEDORES vd ON v.`ID VENDEDOR` = vd.`ID VENDEDOR` " +
    "WHERE v.`ID VENTA` = ?",
    [id]
  );

  const [detalleRows] = await db.execute(
    "SELECT dv.*, p.`NOMBRE PRODUCTO` " +
    "FROM `DETALLE VENTA` dv " +
    "LEFT JOIN PRODUCTO p ON dv.`ID_PRODUCTO` = p.`ID PRODUCTO` " +
    "WHERE dv.`ID VENTA` = ?",
    [id]
  );

  return {
    props: {
      venta: ventaRows[0] || null,
      detalles: detalleRows || [],
    }
  };
}

export default function Ticket({ venta, detalles }) {
  useEffect(() => {
    window.print(); // 👈 IMPRIME AL CARGAR
  }, []);

  if (!venta) return <h1>Venta no encontrada</h1>;

  return (
    <div style={{ fontFamily: 'monospace', width: '200px', margin: '0 auto' }}>
      <h3 style={{ textAlign: 'center' }}>POS SIS</h3>
      <p style={{ textAlign: 'center' }}>Gracias por su compra</p>
      <hr />
      <p><b>Cliente:</b> {venta.nombre_cliente}</p>
      <p><b>Fecha:</b> {venta['FECHA DE VENTA']}</p>
      <p><b>Vendedor:</b> {venta.nombre_vendedor}</p>
      <p><b>Forma de pago:</b> {venta['FORMA DE PAGO']}</p>
      <hr />
      <table style={{ width: '100%' }}>
        <thead>
          <tr><th>Producto</th><th>Cant</th><th>P.Unit</th><th>Total</th></tr>
        </thead>
        <tbody>
          {detalles.map((item, i) => (
            <tr key={i}>
              <td>{item['NOMBRE PRODUCTO']}</td>
              <td>{item.CANTIDAD}</td>
              <td>L{item['PRECIO UNITARIO']}</td>
              <td>L{item.CANTIDAD * item['PRECIO UNITARIO']}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />
      <p><b>Descuento:</b> L{venta.DESCUENTO}</p>
      <p><b>TOTAL:</b> L{venta.TOTAL || detalles.reduce((a, b) => a + (b.CANTIDAD * b['PRECIO UNITARIO']), 0)}</p>
      <hr />
      <p style={{ textAlign: 'center' }}>¡Vuelva pronto!</p>
    </div>
  );
}
