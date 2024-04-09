// DECLARO MIS CONSTANTES
const nombre = document.querySelector("#nombre")
const apellido = document.querySelector("#apellido")
const email = document.querySelector("#email")
const tipo = document.querySelector("#tipo")
const descripcion = document.querySelector("#descripcion")
const llegada = document.querySelector("#llegada")
const salida = document.querySelector("#salida")
const dias = document.querySelector("#dias")
const btnCotizar = document.querySelector("#btnCotizar")
const btnReservar = document.querySelector("#btnReservar")
const btnEnviar = document.querySelector("#btnEnviar")
const total = document.querySelector("span.precioTotal")
const btnPagar = document.querySelector("#btnPagar")
const btnCancelar = document.querySelector("#btnCancelar")



const habitaciones =
[
    {
        id:1,
        tipo:"Simple",
        descripcion:"Simple ($5000)",
        precio: 5000
    },
    {
        id:2,
        tipo:"Doble",
        descripcion:"Doble ($8000)",
        precio: 8000
    },
    {
        id:3,
        tipo:"Triple",
        descripcion:"Triple ($11000)",
        precio: 11000
    }
]

// CARGO LAS OPCIONES DEL SELECT
const opciones = (select, array)=> {
    if(array.length > 0){
        array.forEach(elemento => {
            select.innerHTML += `<option class="option" id="${elemento.id} "value="${elemento.precio}">${elemento.descripcion}</option>`
        })
    }
}
opciones(descripcion,habitaciones)

// DATOS PARA USAR LIBRERIA LUXON
const DateTime = luxon.DateTime
const fecha = {day: 8, month: 12, year: 2022}
const zona = {zone: 'America/Buenos_Aires', numberingSystem: 'latn'}
const dt = DateTime.fromObject(fecha, zona)

// CALCULO CANTIDAD DE DIAS
const cantidadDias = ()=>{
    const DT = luxon.DateTime
    const inicial = DT.fromISO(llegada.value);
    const final = DT.fromISO(salida.value);
    if(inicial >= final){
        return false
    } else if(llegada.value === "" || salida.value === ""){
        return false
    } else if(llegada.value === "" && salida.value === ""){
        return false
    } else{
        let dias = final.diff(inicial, ['days']).toObject()
        return dias
    }
}



// CALCULO EL PRECIO TOTAL DE LA ESTADIA
const estadia = ()=>{
    let eleccion = descripcion.value
    let totalPago = cantidadDias().days * eleccion
    return totalPago
}


let reserva = false

// OBTENGO LA OPCION DEL SELECT Y LA GUARDO EN RESERVA
const obtenerOption = ()=>{
    const options = document.querySelectorAll(".option")
    for(const option of options){
        option.addEventListener("click", ()=>{
            habitaciones.find((habitacion) =>{
                if(habitacion.id == option.id){
                    reserva = habitacion
                }
            })
        })
    }
}
obtenerOption()

// AGREGO UNA CLASE PARA USARLA EN LA COTIZACION
class cotizacion {
    constructor(precio){
        this.precio = parseInt(precio)
    }
    cotizar() {
        let importeTotal = (cantidadDias().days * this.precio)
        return importeTotal
    }
}

// CONFIGURO ALGUNAS ALERTAS
const alertaFechas = ()=> {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Ingrese las fechas correctamente'
    })
}

const alertaHabitacion = ()=> {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Seleccione la habitacion que desea reservar'
    })
}

const alertaReserva = ()=> {
    Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Se ha guardado su reserva en MI RESERVA',
        showConfirmButton: false,
        timer: 1500
    })
}


const realizarCotizacion = ()=> {
    if(reserva && cantidadDias() != false){
        const habitacion = new cotizacion(descripcion.value)
        total.innerText = habitacion.cotizar()
        btnCotizar.innerText = "Cotizar"
    } else if(cantidadDias() === false){
        alertaFechas()
    } else if(reserva == false){
        alertaHabitacion()
    }
}


// FUNCION PARA OBTENER EL TIPO DE HABITACION QUE SE ESTA RESERVANDO
const obtenerTipo = ()=> {
    if(reserva){
        return reserva.tipo
    }
}



// FUNCION PARA CARGAR LA RESERVA DINAMICAMENTE
const cargarReserva = ()=> {
    const reservaAnterior = document.querySelector(".reserva")
    if(reservaAnterior){
        reservaAnterior.remove()
    }
    alertaReserva()
    let containerReserva = document.querySelector(".containerReserva")
    let div = document.createElement("div")
    div.setAttribute("class", "reserva")
    if(reserva && cantidadDias() != false){
        const datosReserva = {
            nombre: nombre.value,
            apellido: apellido.value,
            email: email.value,
            habitacion: obtenerTipo(),
            dias: cantidadDias().days,
            precio: estadia() 
        }
        localStorage.setItem('datosReserva', JSON.stringify(datosReserva))
        div.innerHTML += `
        <div>
            <h4 class="text-center">MI RESERVA:</h4>
            <table>
                <thead>
                    <tr>
                        <th>Habitacion</th>
                        <th>Cantidad de dias</th>
                        <th>Total</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${obtenerTipo()}</td>
                        <td>${cantidadDias().days}</td>
                        <td>${estadia()}</td>
                        <td><button type="button" onclick="pagarReserva()" class=" btn-send btn btn-primary" id="btnPagar">Pagar</button></td>
                        <td><button type="button" onclick="borrarReserva()" class=" btn-delete btn btn-primary" id="btnCancelar">Cancelar</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
        `
    } else if(cantidadDias() === false){
        alertaFechas()
    } else if(reserva == false){
        alertaHabitacion()
    }
    containerReserva.appendChild(div)
    
}



// BORRO LOCALSTORAGE
const borrarLocal = () => {
    if(localStorage.getItem("datosReserva")){
        localStorage.clear()
    }
}


// FUNCION PARA PAGAR LA RESERVA
const pagarReserva = () => {
    if(reserva){
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
            confirmButton: 'btn btn-send',
            cancelButton: 'btn btn-delete'
            },
            buttonsStyling: false
        })
        swalWithBootstrapButtons.fire({
            title: 'Esta seguro de confirmar su pago?',
            text: "Este cambio no se podra revertir",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirmar pago',
            cancelButtonText: 'Cancelar pago',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                borrarLocal()
                reserva = {}
                let miReserva = document.querySelector(".reserva")
                miReserva.remove()
                document.querySelector("#llegada").value = ""
                document.querySelector("#salida").value = ""
                document.querySelector("#descripcion").value = ""
                swalWithBootstrapButtons.fire(
                'Confirmado!',
                'Su pago ha sido realizado con exito',
                'success'
            )
            } else if (
              /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
            ) {
            swalWithBootstrapButtons.fire(
                'Cancelado',
                'Su pago ha sido cancelado',
                'error'
            )
            }
        })
    } else{
        alert("Usted no tiene ninguna reserva realizada")
    }
}


// FUNCION PARA BORRAR LA RESERVA
const borrarReserva = () => {
    if(reserva){
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
            confirmButton: 'btn btn-send',
            cancelButton: 'btn btn-delete'
            },
            buttonsStyling: false
        })
        swalWithBootstrapButtons.fire({
            title: 'Esta seguro de que desea cancelar su reserva?',
            text: "Este cambio no se podra revertir",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Cancelar reserva',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                borrarLocal()
                reserva = {}
                let miReserva = document.querySelector(".reserva")
                miReserva.remove()
                document.querySelector("#llegada").value = ""
                document.querySelector("#salida").value = ""
                document.querySelector("#descripcion").value = ""
                swalWithBootstrapButtons.fire(
                'Cancelada!',
                'Su reserva ha sido cancelada',
                'error'
            )
            } else if (
              /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
            ) {
            swalWithBootstrapButtons.fire(
                'Confirmado',
                'Su reserva no ha sido cancelada',
                'success'
            )
            }
        })
    }
}

// CODIGO CON FETCH PARA LA CARGA DE COMENTARIOS
const comments = document.querySelector(".containerComments")
const URL = "../datos/comentarios.json"
let comentarios = []
let seccionComentarios = ""


const mostrarComentarios = (contenido)=> {
    const {name, body} = contenido
    return `<div>
                <h4 class="text-center">${name}</h4>
                <p class="text-center">${body}</p>
            </div>`
}



const cargarComentarios = async ()=> {
    try {
        const response = await fetch(URL)
        const datos = await response.json()
            comentarios = datos
            comentarios.forEach(elemento => {
                seccionComentarios += mostrarComentarios(elemento)
            })
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Algo salió mal en la carga de datos!'
        })
    } finally {
        comments.innerHTML = seccionComentarios
    }
    
}

cargarComentarios()


// EVENTOS
btnCotizar.addEventListener("click", realizarCotizacion)
btnReservar.addEventListener("click", cargarReserva)
