// clase molde para los productos
class Producto {
    constructor(id, pestanas, tipo, modelo, precio, imagen = false) {
        this.id = id;
        this.pestanas = pestanas;
        this.tipo = tipo;
        this.modelo = modelo;
        this.precio = precio;
        this.imagen = imagen;
    }
}

// base de datos simulada
class BaseDeDatos {
    constructor() {
        this.productos = [];
    }

    async traerRegistros() {
        const response = await fetch("../json/productos.json")
        this.productos = await response.json();
        return this.productos;
    }

    registroPorId(id) {
        return this.productos.find((producto) => producto.id === id);
    }

    registrosPorTipo(palabra) {
        return this.productos.filter((producto) => producto.tipo.toLowerCase().includes(palabra));
    }

    registrosPorPestanas(pestanas) {
        return this.productos.filter((producto) => producto.pestanas.toLowerCase() === pestanas.toLowerCase());
    }
}
// objeto de la base de datos
const bd = new BaseDeDatos();

// elementos
const divProductos = document.querySelector("#productos");
const divCarrito = document.querySelector("#carrito");
const spanCantidadProductos = document.querySelector("#cantidadProductos");
const spanTotalCarrito = document.querySelector("#totalCarrito");
const inputBuscar = document.querySelector("#inputBuscar");
const botonCarrito = document.querySelector("section h2"); 
const botonComprar = document.querySelector("#botonComprar");
const botonesPestanas = document.querySelectorAll(".btnPestanas");



// Agregar el evento click al botón del carrito
botonCarrito.addEventListener("click", () => {
    document.querySelector("section").classList.toggle("ocultar");
});


// botones para filtrar productos por tipo en las pestañas
botonesPestanas.forEach((boton) => {
    boton.addEventListener("click", (event) => {
        event.preventDefault();
        quitarClase();
        boton.classList.add("active");
        const productosPorPestanas = bd.registrosPorPestanas(boton.innerText);
        cargarProductos(productosPorPestanas);
    });
});

const botonTodos = document.querySelector("#btnTodos");
botonTodos.addEventListener("click", (event) => {
    event.preventDefault();
    quitarClase();
    botonTodos.classList.add("seleccionado");
    cargarProductos(bd.productos);
});

function quitarClase() {
    const botonesPestanas = document.querySelectorAll("btnPestanas");
    botonesPestanas.forEach((boton) => {
        boton.classList.remove("active");
    });
}

// llamamos a la función
bd.traerRegistros().then((productos) => cargarProductos(productos));

// productos renderizados en HTML
function cargarProductos(productos) {
    divProductos.innerHTML = "";
    for (const producto of productos) {
        divProductos.innerHTML += `
          <div class="producto">
              <h4>${producto.tipo}</h4>
              <p class="modelo">${producto.modelo}</p>
              <div class="imagen">
                <img src="images/${producto.imagen}"/>
              </div>
              <p class="precio">$${producto.precio}</p>
              <a href="#" class="btnAgregar" data-id="${producto.id}">Agregar al carrito</a>
          </div>
      `;
    }

    // botones "agregar al carrito"
    const botonesAgregar = document.querySelectorAll(".btnAgregar");
    for (const boton of botonesAgregar) {
        boton.addEventListener("click", (event) => {
            event.preventDefault();
            const id = Number(boton.dataset.id);
            const producto = bd.registroPorId(id);
            carrito.agregar(producto);
        });
    }
}

// carrito de compras
class Carrito {
    constructor() {
        const carritoStorage = JSON.parse(localStorage.getItem("carrito"));
        this.carrito = carritoStorage || [];
        this.total = 0;
        this.totalProductos = 0;
        this.listar();
    }

    // método para agregar producto al carrito
    agregar(producto) {
        const productoEnCarrito = this.estaEnCarrito(producto);
        if (productoEnCarrito) {
            productoEnCarrito.cantidad++;
        } else {
            this.carrito.push({ ...producto, cantidad: 1 });
        }
        localStorage.setItem("carrito", JSON.stringify(this.carrito));
        this.listar();
        // toastify
        Toastify({
            text: "Éste producto fue agregado al carrito",
            duration: 3000,
            gravity: "bottom", 
            position: "center", 
            stopOnFocus: true,
            style: {
                background: "#72c453",
                color: "#010101"
            },
        }).showToast();
    }

    // verificamos si el producto esta en el carrito
    estaEnCarrito({ id }) {
        return this.carrito.find((producto) => producto.id === id);
    }

    // método para actualizar carrito en HTML
    listar() {
        this.total = 0;
        this.totalProductos = 0;
        divCarrito.innerHTML = "";
        for (const producto of this.carrito) {
            divCarrito.innerHTML += `
                <div class="productoCarrito">
                    <h5>${producto.modelo}</h5>
                    <p>$${producto.precio}</p>
                    <p>Cantidad: ${producto.cantidad}</p>
                    <a href="#" data-id="${producto.id}" class="btnQuitar">Quitar del carrito</a>
                </div>
            `;
            // actualizamos los totales
            this.total += producto.precio * producto.cantidad;
            this.totalProductos += producto.cantidad;
        }
        // oculto el boton comprar si no hay producto
        // tambien puede decir "Tu carrito esta vaciío y un icon de shoop"
        if (this.totalProductos > 0) {
            botonComprar.classList.remove("oculto");
        } else {
            botonComprar.classList.add("oculto");
        }
        // botones de quitar
        const botonesQuitar = document.querySelectorAll(".btnQuitar");
        for (const boton of botonesQuitar) {
            boton.onclick = (event) => {
                event.preventDefault();
                this.quitar(Number(boton.dataset.id));
            };
        }
        // Actualizamos variables carrito
        spanCantidadProductos.innerText = this.totalProductos;
        spanTotalCarrito.innerText = this.total;
    }
    // método para quitar prodoctos del carrito
    quitar(id) {
        const indice = this.carrito.findIndex((producto) => producto.id === id);
        if (this.carrito[indice].cantidad > 1) {
            this.carrito[indice].cantidad--;
        } else {
            this.carrito.splice(indice, 1);
        }
        // actualizo Storage
        localStorage.setItem("carrito", JSON.stringify(this.carrito));
        // actualizo carrito en HTML
        this.listar();
    }

    // método para vaciar el carrito
    vaciar() {
        this.carrito = [];
        localStorage.removeItem("carrito");
        this.listar();
    }
}

// Evento buscador
inputBuscar.addEventListener("keyup", (event) => {
    event.preventDefault();
    const palabra = inputBuscar.value;
    const productos = bd.registrosPorTipo(palabra.toLowerCase());
    cargarProductos(productos);
});



// Evento click del botón "Comprar"
botonComprar.addEventListener("click", () => {
    // Aquí colocamos el código del SweetAlert
    Swal.fire({
      title: '¿Finalizar compra?',
      text: '¡Puedes seguir agregando productos!',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Seguir comprando',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: '¡Pedido confirmado!',
          text: '¡Muchas gracias por su compra!',
          icon: 'success'
        });
        carrito.vaciar();
      }
    });
  });
  
  

// Objeto carrito || Siempre ultimo para asegurarnos 
// que TODO este declarado e inicializado
const carrito = new Carrito();