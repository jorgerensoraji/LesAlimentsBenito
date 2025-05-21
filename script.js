let productos = [];

// Cargar productos desde productos.json
fetch('productos.json')
  .then(response => response.json())
  .then(data => {
    productos = data;
    mostrarProductos();
  })
  .catch(error => {
    console.error("Error al cargar productos.json:", error);
  });

function mostrarProductos() {
  const lista = document.getElementById('productoLista');
  lista.innerHTML = '';

  productos.forEach(producto => {
    const divProducto = document.createElement('div');
    divProducto.classList.add('producto');
    divProducto.setAttribute('data-producto', producto.nombre);

    divProducto.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <div class="detalle-producto">
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion}</p>
        <input type="number" min="0.01" step="0.01" placeholder="Cantidad" class="cantidad" />
        <select class="unidad">
          <option value="kg">Kilogramos</option>
          <option value="lb">Libras</option>
          <option value="box">Cajas</option>
        </select>
        <textarea placeholder="Detalles adicionales" class="detalles"></textarea>
        <button onclick="seleccionarProducto('${producto.nombre}')">Seleccionar</button>
      </div>
    `;
    lista.appendChild(divProducto);
  });
}

function buscarProducto() {
  const searchTerm = document.getElementById('searchBar').value.toLowerCase();
  const productosElementos = document.querySelectorAll('.producto');

  productosElementos.forEach(producto => {
    const nombre = producto.getAttribute('data-producto').toLowerCase();
    producto.style.display = nombre.includes(searchTerm) ? 'flex' : 'none';
  });
}

function seleccionarProducto(nombre) {
  const producto = productos.find(p => p.nombre === nombre);
  const cantidadInput = document.querySelector(`[data-producto='${nombre}'] .cantidad`);
  const unidadInput = document.querySelector(`[data-producto='${nombre}'] .unidad`);
  const detallesInput = document.querySelector(`[data-producto='${nombre}'] .detalles`);

  if (!cantidadInput || !unidadInput || !detallesInput) {
    alert("Error interno: no se encontró un campo de entrada para el producto.");
    return;
  }

  const cantidad = parseFloat(cantidadInput.value);
  const unidad = unidadInput.value;
  const detalles = detallesInput.value.trim();

  if (!cantidad || cantidad <= 0) {
    alert("Por favor, ingresa una cantidad válida mayor a cero.");
    return;
  }

  const divSeleccionado = document.createElement('div');

  divSeleccionado.innerHTML = `
    <p><strong>${producto.nombre}</strong></p>
    <p>${cantidad} ${unidad}</p>
    <p>Detalles: ${detalles || "-"}</p>
    <button onclick="eliminarProductoSeleccionado(this)">Eliminar</button>
    <hr />
  `;

  document.getElementById('productosSeleccionados').appendChild(divSeleccionado);

  cantidadInput.value = "";
  detallesInput.value = "";
  unidadInput.selectedIndex = 0;
}

function eliminarProductoSeleccionado(button) {
  button.parentElement.remove();
}








function obtenerProductosSeleccionados() {
  const items = document.querySelectorAll('#productosSeleccionados > div');
  const productosSeleccionados = [];

  items.forEach(item => {
    const textos = item.querySelectorAll('p');
    if (textos.length < 3) return;

    // Extrae y limpia los textos de los elementos <p>
    const nombre = textos[0].innerText.trim(); // <p><strong>nombre</strong></p>
    const cantidadUnidad = textos[1].innerText.trim(); // Ej: "10 kg"
    const detallesTexto = textos[2].innerText.trim(); // Ej: "Detalles: sin piel"

    const [cantidad, unidad] = cantidadUnidad.split(" ");
    const detalles = detallesTexto.replace("Detalles: ", "").trim();

    // Validar que se obtuvo información suficiente
    if (!nombre || !cantidad || !unidad) return;

    productosSeleccionados.push({
      nombre,
      cantidad,
      unidad,
      detalles
    });
  });

  return productosSeleccionados;
}































async function generarYEnviarPDF() {
  const nombre = document.getElementById('clienteNombre').value.trim();
  const email = document.getElementById('clienteEmail').value.trim();
  const direccionEnvio = document.getElementById('direccionEnvio').value.trim();

  if (!nombre) {
    alert("Por favor, ingresa tu nombre completo.");
    return;
  }
  if (!email) {
    alert("Por favor, ingresa tu correo electrónico.");
    return;
  }

  const productosSeleccionados = obtenerProductosSeleccionados();
  if (productosSeleccionados.length === 0) {
    alert("Debes seleccionar al menos un producto.");
    return;
  }

  const fecha = new Date();
  const fechaIso = fecha.toISOString().replace(/[:.-]/g, "");
  const parte1 = fechaIso.slice(2, 8);  // desde índice 2 hasta 7 (sin incluir 7)
  const parte2 = fechaIso.slice(10, 14); // desde índice 10 hasta 11 (sin incluir 11)
  const fechaStr = parte1 + parte2;
  const nombreOrden = fechaStr;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Obtener logo y esperar a que esté cargado
  const logo = document.getElementById("logoPDF");
  if (!logo.complete) {
    await new Promise(resolve => logo.onload = resolve);
  }

  // Convertir imagen a base64
  const canvas = document.createElement("canvas");
  canvas.width = logo.naturalWidth;
  canvas.height = logo.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(logo, 0, 0);
  const logoBase64 = canvas.toDataURL("image/png");

  // Insertar imagen en el PDF
  doc.addImage(logoBase64, "PNG", 10, 10, 50, 35);

  doc.setFontSize(18);
  doc.text(`Orden de Compra: ${nombreOrden}`, 10, 50);

  doc.setFontSize(14);
  doc.text(`Nombre del cliente: ${nombre}`, 10, 60);
  doc.setFontSize(12);
  doc.text(`Correo: ${email}`, 10, 65);

  let y = 70;
  if (direccionEnvio) {
    doc.text(`Dirección de envío: ${direccionEnvio}`, 10, y);
    y += 10;
  }

  doc.setFontSize(14);
  doc.text("Productos seleccionados:", 10, y);
  y += 5;






  // Construcción de tabla
const headers = [["Producto", "Cantidad", "Precio"]];
const data = productosSeleccionados.map(p => [
  `${p.nombre}\n${p.cantidad} ${p.unidad}\nDetalles: ${p.detalles}`,
  ""
]);



  
  doc.autoTable({
    startY: y + 5,
    head: headers,
    body: data,
    theme: 'grid',
    headStyles: { fillColor: [200, 200, 200] },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    margin: { left: 10, right: 10 }
  });





  // Generar archivo PDF como blob
  const pdfBlob = doc.output('blob');

  // Preparar FormData para enviar al backend
  const formData = new FormData();
  formData.append('file', pdfBlob, `${nombreOrden}.pdf`);
  formData.append('emailCliente', email);
  formData.append('nombreCliente', nombre);
  formData.append('direccionEnvio', direccionEnvio);
  formData.append('nombreOrden', nombreOrden);

  try {
    const response = await fetch("https://lesalimentsbenito.onrender.com/upload-pdf", {
      method: "POST",
      body: formData
    });



    if (!response.ok) {
      throw new Error("Error al subir PDF al servidor");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Error desconocido del servidor");
    }

    alert("Ocurrió un error al enviar el pedido: " + error.message);
  } catch (error) {
    console.error("Error al enviar PDF:", error);
    alert("Pedido enviado exitosamente. Revisa tu correo y el de la empresa.");
  }
}
