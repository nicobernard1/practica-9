class Socio {

    constructor(nombre, apellido, dni, mail, cuota, vencimiento) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.dni = dni;
        this.mail = mail;
        this.cuota = cuota;
        this.vencimiento = vencimiento;
        this.cuotaPagada = false;
    }

    pagar(formaPago) {
        if (formaPago === "efectivo") {
            this.cuota = this.cuota * 0.90;
        }
        this.cuotaPagada = true;
    }
}

const sociosIniciales = [
    new Socio("Nicolas", "Bernard", "47689974", "nnicobernard@gmail.com", 50000, "30/09/2026"),
    new Socio("Marcelo", "Gallardo", "47912018", "muñeco@gmail.com", 50000, "30/09/2026"),
    new Socio("Lionel", "Messi", "47123456", "leo@gmail.com", 50000, "30/09/2026")
];

const socios = [];
const guardados = JSON.parse(localStorage.getItem("socios"));

(guardados || sociosIniciales).forEach(({ nombre, apellido, dni, mail, cuota, vencimiento, cuotaPagada }) => {
    const socio = new Socio(nombre, apellido, dni, mail, cuota, vencimiento);
    socio.cuotaPagada = cuotaPagada;
    socios.push(socio);
});

const formulario = document.querySelector("#formulario");
const inputNombre = document.querySelector(".nombre");
const inputApellido = document.querySelector(".apellido");
const inputDni = document.querySelector(".dni");
const inputMail = document.querySelector(".mail");
const buscador = document.querySelector(".buscador");
const mensaje = document.querySelector(".mensaje");
const listaSocios = document.querySelector(".lista-socios");
const totalSocios = document.querySelector(".total-socios");
const sociosActivos = document.querySelector(".socios-activos");
const totalRecaudado = document.querySelector(".total-recaudado");
const botonAgregar = document.querySelector(".btn-agregar");

//Mensajes (se borran solos a los 5 segundos)
let timeoutMensaje;

const mostrarMensaje = (texto) => {
    clearTimeout(timeoutMensaje);
    mensaje.innerText = texto;
    timeoutMensaje = setTimeout(() => {
        mensaje.innerText = "";
    }, 5000);
};

//Agregar socio
botonAgregar.addEventListener("click", () => {
    const nombre = inputNombre.value.trim();
    const apellido = inputApellido.value.trim();
    const dni = inputDni.value.trim();
    const mail = inputMail.value.trim().toLowerCase();

    if (!/^[a-záéíóúñü ]+$/i.test(nombre + apellido) || !/^\d{8}$/.test(dni) || !/^\S+@\S+\.\S+$/.test(mail)) {
        mostrarMensaje("Datos inválidos");
        return;
    }
    if (socios.some(socio => socio.dni === dni || socio.mail === mail)) {
        mostrarMensaje("El socio ya existe");
        return;
    }

    const nuevoSocio = new Socio(nombre, apellido, dni, mail, 50000, "-");
    socios.push(nuevoSocio);

    mostrarMensaje("Socio agregado");
    localStorage.setItem("socios", JSON.stringify(socios));
    formulario.reset();
    actualizarResumen();
    mostrarSocios(socios);
});

//Resumen
const actualizarResumen = () => {
    const pagadas = socios.filter(socio => socio.cuotaPagada);
    const recaudado = pagadas.reduce((total, socio) => total + socio.cuota, 0);

    totalSocios.innerText = socios.length;
    sociosActivos.innerText = pagadas.length;
    totalRecaudado.innerText = `$${recaudado}`;
};

//Mostrar socios
const mostrarSocios = (lista) => {
    listaSocios.innerHTML = "";

    lista.forEach(socio => {
        const { nombre, apellido, dni, mail, cuota, vencimiento, cuotaPagada } = socio;

        const estado = cuotaPagada ? "Pagada" : "Pendiente";
        const pago = cuotaPagada ? "" : `
            <select class="forma${dni}">
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
            </select>
            <button class="pagar${dni}">Pagar cuota</button>
        `;

        listaSocios.innerHTML += `
            <div class="socio">
                <h3>${nombre} ${apellido}</h3>
                <p>DNI: ${dni}</p>
                <p>Mail: ${mail}</p>
                <p>Cuota: $${cuota}</p>
                <p>Vencimiento: ${vencimiento}</p>
                <p>Estado: ${estado}</p>
                ${pago}
                <button class="eliminar${dni}">Eliminar socio</button>
            </div>
        `;
    });

    lista.forEach(socio => {
        const { dni, nombre } = socio;

        document.querySelector(".pagar" + dni)?.addEventListener("click", () => {
            socio.pagar(document.querySelector(".forma" + dni).value);
            socio.vencimiento = "30/10/2026";
            localStorage.setItem("socios", JSON.stringify(socios));
            mostrarMensaje(`Cuota de ${nombre} pagada`);
            mostrarSocios(socios);
            actualizarResumen();
        });

        document.querySelector(".eliminar" + dni).addEventListener("click", () => {
            socios.splice(socios.indexOf(socio), 1);
            localStorage.setItem("socios", JSON.stringify(socios));
            mostrarMensaje(`Socio ${nombre} eliminado`);
            mostrarSocios(socios);
            actualizarResumen();
        });
    });
};

//Buscador
buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase();
    const encontrados = socios.filter(socio =>
        socio.nombre.toLowerCase().includes(texto) ||
        socio.apellido.toLowerCase().includes(texto) ||
        socio.dni.includes(texto)
    );
    mostrarSocios(encontrados);
});


actualizarResumen();
mostrarSocios(socios);

//Recordatorios
setTimeout(() => {
    let pendientes = socios.filter(socio => !socio.cuotaPagada).length;
    if (pendientes > 0) {
        mostrarMensaje(`Recordatorio: hay ${pendientes} cuotas pendientes de cobro`);
    }
}, 1000);