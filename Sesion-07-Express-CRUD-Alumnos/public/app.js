/**
 * app.js — Lógica del sitio (Fetch + Dialogs)
 * Tarea Sesión 7 · Desarrollo Web · UMG
 */

const API = '/alumnos';
const API_KEY = 'umg-2026'; // debe coincidir con config.env

// Helper ya resuelto: cabeceras para las peticiones
const cabeceras = (conJson = true) => ({
    ...(conJson ? { 'Content-Type': 'application/json' } : {}),
    'x-api-key': API_KEY,
});

// Referencias del DOM (ya resueltas)
const tabla = document.querySelector('#tablaAlumnos tbody');
const mensaje = document.querySelector('#mensaje');
const dialogoForm = document.querySelector('#dialogoForm');
const dialogoEliminar = document.querySelector('#dialogoEliminar');
const form = document.querySelector('#formAlumno');
const tituloForm = document.querySelector('#tituloForm');
const nombreEliminar = document.querySelector('#nombreEliminar');

let idEnEdicion = null;        // null = crear | string = editar
let idAEliminar = null;

async function cargarAlumnos() {
    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error('Error al cargar');
        const alumnos = await res.json();
        tabla.innerHTML = '';
        alumnos.forEach((alumno, index) => {
            const tr = document.createElement('tr');
            const tdNum = document.createElement('td');
            tdNum.textContent = String(index + 1);
            const tdNombre = document.createElement('td');
            tdNombre.textContent = alumno.nombre;
            const tdApellido = document.createElement('td');
            tdApellido.textContent = alumno.apellido;
            const tdEmail = document.createElement('td');
            tdEmail.textContent = alumno.email;
            const tdEdad = document.createElement('td');
            tdEdad.textContent = alumno.edad ?? '';
            const tdAcciones = document.createElement('td');
            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.type = 'button';
            btnEditar.addEventListener('click', () => abrirDialogoEditar(alumno.id));
            const btnEliminar = document.createElement('button');
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.type = 'button';
            btnEliminar.addEventListener('click', () => eliminarAlumno(alumno.id));
            tdAcciones.appendChild(btnEditar);
            tdAcciones.appendChild(btnEliminar);
            tr.appendChild(tdNum);
            tr.appendChild(tdNombre);
            tr.appendChild(tdApellido);
            tr.appendChild(tdEmail);
            tr.appendChild(tdEdad);
            tr.appendChild(tdAcciones);
            tabla.appendChild(tr);
        });
    } catch {
        mostrarMensaje('Error al cargar alumnos', 'error');
    }
}

function abrirDialogoNuevo() {
    idEnEdicion = null;
    tituloForm.textContent = 'Nuevo alumno';
    form.reset();
    dialogoForm.showModal();
}

async function abrirDialogoEditar(id) {
    try {
        const res = await fetch(`${API}/${id}`);
        if (!res.ok) throw new Error('No encontrado');
        const alumno = await res.json();
        idEnEdicion = id;
        tituloForm.textContent = 'Editar alumno';
        form.querySelector('#nombre').value = alumno.nombre ?? '';
        form.querySelector('#apellido').value = alumno.apellido ?? '';
        form.querySelector('#email').value = alumno.email ?? '';
        form.querySelector('#edad').value = alumno.edad ?? '';
        dialogoForm.showModal();
    } catch {
        mostrarMensaje('Error al cargar alumno', 'error');
    }
}

async function guardarAlumno(event) {
    event.preventDefault();
    const nombre = form.querySelector('#nombre').value.trim();
    const apellido = form.querySelector('#apellido').value.trim();
    const email = form.querySelector('#email').value.trim();
    const edadValor = form.querySelector('#edad').value.trim();
    const datos = { nombre, apellido, email };
    if (edadValor !== '') datos.edad = Number(edadValor);
    try {
        let res;
        if (idEnEdicion === null) {
            res = await fetch(API, { method: 'POST', headers: cabeceras(), body: JSON.stringify(datos) });
        } else {
            res = await fetch(`${API}/${idEnEdicion}`, { method: 'PUT', headers: cabeceras(), body: JSON.stringify(datos) });
        }
        if (!res.ok) throw new Error('Error al guardar');
        dialogoForm.close();
        await cargarAlumnos();
        mostrarMensaje(idEnEdicion === null ? 'Alumno creado' : 'Alumno actualizado', 'ok');
    } catch {
        mostrarMensaje('Error al guardar alumno', 'error');
    }
}

function eliminarAlumno(id) {
    idAEliminar = id;
    nombreEliminar.textContent = id;
    fetch(`${API}/${id}`).then(r => r.ok ? r.json() : null).then(alumno => {
        if (alumno && alumno.nombre) nombreEliminar.textContent = `${alumno.nombre} ${alumno.apellido ?? ''}`.trim();
    }).catch(() => {});
    dialogoEliminar.showModal();
}

function mostrarMensaje(texto, tipo = 'ok') {
    mensaje.textContent = texto;
    mensaje.className = tipo;
}

// ============================================================
// Conexión de eventos
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#btnNuevo').addEventListener('click', abrirDialogoNuevo);
    form.addEventListener('submit', guardarAlumno);
    document.querySelector('#btnCancelar').addEventListener('click', () => dialogoForm.close());
    document.querySelector('#btnCancelarEliminar').addEventListener('click', () => dialogoEliminar.close());
    document.querySelector('#btnConfirmarEliminar').addEventListener('click', async () => {
        try {
            const res = await fetch(`${API}/${idAEliminar}`, { method: 'DELETE', headers: cabeceras(false) });
            if (!res.ok) throw new Error('Error al eliminar');
            dialogoEliminar.close();
            await cargarAlumnos();
            mostrarMensaje('Alumno eliminado', 'ok');
        } catch {
            mostrarMensaje('Error al eliminar alumno', 'error');
        }
    });
    cargarAlumnos();
});