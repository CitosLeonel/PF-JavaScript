
// Con esta clase simulamos una base de datos, 
// donde cargaremos todos los productos de nuestro e-commerce
class BaseDeDatos {
    constructor() {
        this.productos = [];
        // Aquí van todos los productos que tengamos
        this.agregarRegistro(1, "motovehiculo", "HIGH SPEED LMJR VESPA 3000W", 2030000, "vespa.png");
        this.agregarRegistro(2, "motovehiculo", "LEO 2000W", 746200, "leo.png");
        this.agregarRegistro(3, "motovehiculo", "HAWK 3000W", 1117000, "hawk.png");
        this.agregarRegistro(4, "motovehiculo", "MIKU SUPER 3000W", 2132200, "miku.png");
        this.agregarRegistro(5, "monopatin", "X5 ECO 350W", 224000, "x5.png");
        this.agregarRegistro(6, "monopatin", "X9 PLUS 500W", 476000, "x9.png");
        this.agregarRegistro(7, "monopatin", "VELOCIFERO HB 1600W", 616000, "velocifero.png");
        this.agregarRegistro(8, "monopatin", "SPY RACING 1500W", 756000, "spy.png");
        this.agregarRegistro(9, "cuatriciclo", "ELECTRIC ATV 1500", 8682000, "atv.png");
        this.agregarRegistro(10, "bicicleta", "BICICLETA RAY-HS", 837200, "rayHs.png");
        this.agregarRegistro(11, "triciclo", "ABSOLUTE GT 500W", 798000, "absoluteGT.png");
        this.agregarRegistro(12, "utilitario", "KING KONG 1500W", 2273600, "kingKong.png");

    }

    // Método que crea el objeto producto y lo almacena en el array con un push
    agregarRegistro(id, tipo, modelo, precio, imagen) {
        const producto = new Producto(id, tipo, modelo, precio, imagen);
        this.productos.push(producto);
    }
    // Nos retorna el array con los productos
    traerRegistros() {
        return this.productos;
    }
    // Busca un producto por id, si lo encuentralo retorna en forma de objeto
    registroPorId(id) {
        return this.productos.find((producto) => producto.id === id);
    }

    registrosPorTipo(palabra) {
        return this.productos.filter((producto) => producto.tipo.toLowerCase().includes(palabra));
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
            this.carrito[indice].contidad--;
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
                    <a href="#" data-id="${producto.id}" class="btn.Quitar">Quitar del carrito</a>
                </div>
            `;
            // Actualizamos totales:
            this.total += producto.precio * producto.cantidad;
            this.totalProductos += producto.cantidad;
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
    constructor(id, tipo, modelo, precio, imagen = false) {
        this.id = id;
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
const botonCarrito = document.querySelector("section h3");


// Llamamos a la función
cargarProductos(bd.traerRegistros());

// Muestra registros de la base de datos en el HTML
function cargarProductos(productos) {
    divProductos.innerHTML = "";
    // Recorremos todos los productos y lo agregamos al div #productos
    for (const producto of productos) {
        // A cada div lo agregamos un botón de Agregar al carrito, y a ese botón le pasamos
        // el atributo data-id, con el id del producto. Eso después nos va a ser muy útil
        // para saber desde que producto estamos haciendo click
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
    document.querySelector("section").classList.toggle("mostrar");
});

// Objeto carrito || Siempre ultimo para asegurarnos 
// que TODO este declarado e inicializado
const carrito = new Carrito();
