
// Con esta clase simulamos una base de datos, 
// donde cargaremos todos los productos de nuestro e-commerce
class BaseDeDatos {
    constructor() {
        this.productos = [];

    }
    // Nos retorna el array con los productos
    async traerRegistros() {
        const response = await fetch("../json/productos.json")
        this.productos = await response.json();
        return this.productos;
    }

    // Busca un producto por id, si lo encuentralo retorna en forma de objeto
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

// Carrito de compras
class Carrito {
    constructor() {
        const carritoStorage = JSON.parse(localStorage.getItem("carrito"));
        this.carrito = carritoStorage || [];
        this.total = 0;
        this.totalProductos = 0;
        this.listar();
    }
    // Para verificar si el producto esta en el carrito (utilizando desectructuración)
    estaEnCarrito({ id }) {
        return this.carrito.find((producto) => producto.id === id);
    }
    // Método agregar el producto al carrito
    agregar(producto) {
        const productoEnCarrito = this.estaEnCarrito(producto);
        if (productoEnCarrito) {
            // Sumar cantidad
            productoEnCarrito.cantidad++;
        } else {
            // Y si no esta lo agrego al carrito
            this.carrito.push({ ...producto, cantidad: 1 });
        }
        // Con esto actualizo el Storage
        localStorage.setItem("carrito", JSON.stringify(this.carrito));
        // Con esto actulizamos carrito en HTML
        this.listar();
    }

    // Método quitar
    quitar(id) {
        const indice = this.carrito.findIndex((producto) => producto.id === id);
        // si la cantidad del producto es + a 1, le resto
        if (this.carrito[indice].cantidad > 1) {
            this.carrito[indice].cantidad--;
        } else {
            // sino, significa que hay 1 solo producto, asi quye lo borro
            this.carrito.splice(indice, 1);
        }
        // actualizo el storage
        localStorage.setItem("carrito", JSON.stringify(this.botonCarrito));
        // actualizo el carrito
        this.listar();
    }

    // Metodo encargado de actualizar HTML
    listar() {
        this.total = 0;
        this.totalProductos = 0
        divCarrito.innerHTML = "";
        for (const producto of this.carrito) {
            divCarrito.innerHTML += `
                <div class="productoCarrito">
                    <h2>${producto.modelo}</h2>
                    <p>$${producto.precio}</p>
                    <p>Cantidad: ${producto.cantidad}</p>
                    <a href="#" data-id="${producto.id}" class=".btnQuitar">Quitar del carrito</a>
                </div>
            `;
            // Actualizamos totales:
            this.total += producto.precio * producto.cantidad;
            this.totalProductos += producto.cantidad;
        }
        
        // Oculto el botón Comprar si no hay productos
        if (this.totalProductos > 0) {
            botonComprar.classList.remove("oculto"); 
        } else {
            botonComprar.classList.add("oculto"); 
        }

        // Botones "quitar"
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
}

// Clase molde para los productos
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

// Objeto base de datos
const bd = new BaseDeDatos();

// Elementos para vincular
const divProductos = document.querySelector("#productos");
const divCarrito = document.querySelector("#carrito");
const spanCantidadProductos = document.querySelector("#cantidadProductos");
const spanTotalCarrito = document.querySelector("#totalCarrito");
const inputBuscar = document.querySelector("#inputBuscar");
const botonCarrito = document.querySelector("section h1");
const botonComprar = document.querySelector("#botonComprar");
const botonesPestanas = document.querySelectorAll(".btnPestanas")

// Botones para filtrar productos por tipo en las pestañas
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
    const botonesPestanas = document.querySelectorAll(".btnPestanas");
    botonesPestanas.forEach((boton) => {
        boton.classList.remove("active");
    });
}


// Llamamos a la función
bd.traerRegistros().then((productos) => cargarProductos(productos));


// Muestra registros de la base de datos en el HTML
function cargarProductos(productos) {
    divProductos.innerHTML = "";
    for (const producto of productos) {
        divProductos.innerHTML += `
          <div class="producto">
              <h2>${producto.tipo}</h2>
              <p class="modelo">${producto.modelo}</p>
              <p class="precio">$${producto.precio}</p>
              <div class="imagen">
                <img src="images/${producto.imagen}"/>
              </div>
              <a href="#" class="btnAgregar" data-id="${producto.id}">Agregar al carrito</a>
          </div>
      `;
    }
    // Botones agregar al carrito: como no sabemos cuántos productos hay en nuestra base de datos,
    // buscamos TODOS los botones que hayamos renderizado recién, y los recorremos uno por uno
    const botonesAgregar = document.querySelectorAll(".btnAgregar");
    for (const boton of botonesAgregar) {
        // Le agregamos un evento click a cada uno
        boton.addEventListener("click", (event) => {
            event.preventDefault();
            // Obtenemos el ID del producto del atributo data-id
            const id = Number(boton.dataset.id);
            // Con ese ID, consultamos a nuestra base de datos por el producto
            const producto = bd.registroPorId(id);
            // Agregamos el registro (producto) a nuestro carrito
            carrito.agregar(producto);
        });
    }
}

// Evento buscador
inputBuscar.addEventListener("keyup", (event) => {
    event.preventDefault();
    const palabra = inputBuscar.value;
    const productos = bd.registrosPorTipo(palabra.toLowerCase());
    cargarProductos(productos);
});

// Toggle para el carrito
botonCarrito.addEventListener("click", (event) => {
    document.querySelector("section").classList.toggle("ocultar");
});

// Objeto carrito || Siempre ultimo para asegurarnos 
// que TODO este declarado e inicializado
const carrito = new Carrito();
