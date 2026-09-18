/**
 * app.js — Servidor Express (API REST + sitio estático)
 * Tarea Sesión 7 · Desarrollo Web · UMG
 *
 * Los tests de `tests/api.test.js` describen exactamente el contrato
 * que debe cumplir cada endpoint (son tu guía).
 */

import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// __dirname en ES Modules
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

// ============================================================
// MIDDLEWARES
// ============================================================

/**
 * "Autenticación falsa": exige el header `x-api-key`.
 *
 
 *
 * @type {import('express').RequestHandler}
 */
export function autenticacionFalsa(req, res, next) {
   const clave = req.get('x-api-key');
   const esperada = process.env.API_KEY || 'umg-2026';
   if (clave !== esperada) return res.status(401).json({ error: 'No autorizado' });
   next();
}
/**
 
 *
 * @type {import('express').RequestHandler}
 */
export function validarAlumno(req, res, next) {
const { nombre, apellido, email, edad } = req.body ?? {};
if (typeof nombre !== 'string' || nombre.trim() === '') return res.status(400).json({ error: 'Nombre rquerido' });
if (typeof apellido !== 'string' || apellido.trim() === '') return res.status(400).json({ error: 'Apellido requerido' });
if (typeof email !== 'string' || email.trim() === ''|| !email.includes('@')) return res.status(400).json({ error: 'Email inválido' });
if (edad !== undefined && edad !==null && edad !== ''){
const valor = typeof edad === 'number' ? edad : Number(edad);
if (typeof valor !== 'number' || isNaN(valor) || valor < 0) return res.status(400).json({ error: 'Edad inválida' });
}
next();
}

// ============================================================
// APP
// ============================================================

/**
 * Crea la app de Express con sus rutas.
 * Recibe el repositorio por parámetro (inyección de dependencias).
 *
 * @param {import('./repositorio.js').RepositorioAlumnos} repositorio
 * @returns {import('express').Express}
 */
export function crearApp(repositorio) {
    const app = express();

    // Middlewares base
    app.use(express.json());

    // Sitio web estático (public/index.html, styles.css, app.js)
    app.use(express.static(join(__dirname, '..', 'public')));


    app.get('/alumnos', (req, res) => {
res.json(repositorio.listar());       });    

    app.get('/alumnos/:id', (req, res) => {
        const alumno = repositorio.obtener(req.params.id);
        if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' });
        res.json(alumno);
    });

    app.post('/alumnos', autenticacionFalsa, validarAlumno, (req, res) => {
const creado = repositorio.crear(req.body);
        res.status(201).json(creado);
    });

    app.put('/alumnos/:id', autenticacionFalsa, validarAlumno, (req, res) => {
        const actualizado = repositorio.actualizar(req.params.id, req.body);
        if (!actualizado) return res.status(404).json({ error: 'Alumno no encontrado' });
        res.json(actualizado);
    });

    app.delete('/alumnos/:id', autenticacionFalsa, (req, res) => {
const ok = repositorio.eliminar(req.params.id);
        if (!ok) return res.status(404).json({ error: 'Alumno no encontrado' });
        res.status(204).end();
    });

    return app;
}
