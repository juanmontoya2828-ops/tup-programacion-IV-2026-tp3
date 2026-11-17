import { useEffect, useState } from 'react';
import { apiRequest } from './client';

const initialForm = {
    nombre: '',
    apellido: '',
    numero_documento: '',
    numero_licencia: '',
    fecha_alta_licencia: '',
    fecha_vencimiento_licencia: '',
};

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

export default function Conductores() {
    const [conductores, setConductores] = useState([]);
    const [viajes, setViajes] = useState([]);
    const [formData, setFormData] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState([]);
    const [success, setSuccess] = useState('');

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [conductoresRes, viajesRes] = await Promise.all([
                apiRequest('/conductores'),
                apiRequest('/viajes').catch(() => []),
            ]);
            const conductoresList = Array.isArray(conductoresRes)
                ? conductoresRes
                : conductoresRes.conductores || conductoresRes.data || [];
            const viajesList = Array.isArray(viajesRes)
                ? viajesRes
                : viajesRes.viajes || viajesRes.data || [];

            setConductores(conductoresList);
            setViajes(viajesList);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData(initialForm);
        setEditingId(null);
        setFieldErrors([]);
    };

    const handleEdit = (conductor) => {
        setError('');
        setSuccess('');
        setFieldErrors([]);
        setEditingId(conductor.id);
        setFormData({
            nombre: conductor.nombre || '',
            apellido: conductor.apellido || '',
            numero_documento: conductor.numero_documento || '',
            numero_licencia: conductor.numero_licencia || '',
            fecha_alta_licencia: toDateInput(conductor.fecha_alta_licencia),
            fecha_vencimiento_licencia: toDateInput(conductor.fecha_vencimiento_licencia),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setFieldErrors([]);

        const payload = {
            nombre: formData.nombre.trim(),
            apellido: formData.apellido.trim(),
            numero_documento: formData.numero_documento.trim(),
            numero_licencia: formData.numero_licencia.trim(),
            fecha_alta_licencia: formData.fecha_alta_licencia,
            fecha_vencimiento_licencia: formData.fecha_vencimiento_licencia,
        };

        if (
            !payload.nombre ||
            !payload.apellido ||
            !payload.numero_documento ||
            !payload.numero_licencia ||
            !payload.fecha_alta_licencia ||
            !payload.fecha_vencimiento_licencia
        ) {
            setError('Todos los campos del conductor son obligatorios');
            return;
        }

        if (payload.fecha_vencimiento_licencia < payload.fecha_alta_licencia) {
            setError('La fecha de vencimiento no puede ser anterior a la fecha de alta');
            return;
        }

        setSaving(true);
        try {
            if (editingId) {
                await apiRequest(`/conductores/${editingId}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
                setSuccess('Conductor actualizado correctamente');
            } else {
                await apiRequest('/conductores', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
                setSuccess('Conductor registrado correctamente');
            }
            resetForm();
            await loadData();
        } catch (err) {
            setError(err.message);
            setFieldErrors(err.errors || []);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que querés eliminar este conductor?')) return;
        setError('');
        setSuccess('');
        try {
            await apiRequest(`/conductores/${id}`, { method: 'DELETE' });
            if (editingId === id) resetForm();
            setSuccess('Conductor eliminado correctamente');
            await loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const getKmAcumulados = (conductorId) => {
        return viajes
            .filter((v) => Number(v.conductor_id) === Number(conductorId))
            .reduce((acc, v) => acc + Number(v.kilometros || 0), 0);
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1>Gestión de Conductores</h1>
                    <p className="muted-text">Legajos de choferes, documentación y licencias habilitantes</p>
                </div>
                <span className="badge">{conductores.length} choferes</span>
            </div>

            {error && (
                <div className="alert alert-error">
                    <div>{error}</div>
                    {fieldErrors.length > 0 && (
                        <ul>
                            {fieldErrors.map((item, idx) => (
                                <li key={idx}>{item.mensaje || item.msg}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {success && <div className="alert alert-success">{success}</div>}

            <section className="card">
                <h2 className="mb-1">{editingId ? 'Editar conductor' : 'Nuevo conductor'}</h2>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre</label>
                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Carlos"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="apellido">Apellido</label>
                            <input
                                id="apellido"
                                name="apellido"
                                type="text"
                                value={formData.apellido}
                                onChange={handleChange}
                                placeholder="Gómez"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="numero_documento">Número de documento</label>
                            <input
                                id="numero_documento"
                                name="numero_documento"
                                type="text"
                                maxLength={15}
                                value={formData.numero_documento}
                                onChange={handleChange}
                                placeholder="32456789"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="numero_licencia">Número de licencia</label>
                            <input
                                id="numero_licencia"
                                name="numero_licencia"
                                type="text"
                                maxLength={30}
                                value={formData.numero_licencia}
                                onChange={handleChange}
                                placeholder="LIC-998877"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="fecha_alta_licencia">Alta de licencia</label>
                            <input
                                id="fecha_alta_licencia"
                                name="fecha_alta_licencia"
                                type="date"
                                value={formData.fecha_alta_licencia}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="fecha_vencimiento_licencia">Vencimiento de licencia</label>
                            <input
                                id="fecha_vencimiento_licencia"
                                name="fecha_vencimiento_licencia"
                                type="date"
                                value={formData.fecha_vencimiento_licencia}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar conductor'}
                        </button>
                        {editingId && (
                            <button type="button" className="btn btn-outline" onClick={resetForm}>
                                Cancelar edición
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className="card">
                <h2 className="mb-1">Listado de conductores</h2>
                {loading ? (
                    <p className="muted-text">Cargando conductores...</p>
                ) : conductores.length === 0 ? (
                    <p className="muted-text">No hay conductores registrados todavía.</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Apellido y Nombre</th>
                                    <th>Documento</th>
                                    <th>Licencia</th>
                                    <th>Alta Licencia</th>
                                    <th>Vencimiento</th>
                                    <th>Km acumulados</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conductores.map((conductor) => (
                                    <tr key={conductor.id}>
                                        <td>
                                            <strong>
                                                {conductor.apellido}, {conductor.nombre}
                                            </strong>
                                        </td>
                                        <td>{conductor.numero_documento}</td>
                                        <td>{conductor.numero_licencia}</td>
                                        <td>{toDateInput(conductor.fecha_alta_licencia)}</td>
                                        <td>{toDateInput(conductor.fecha_vencimiento_licencia)}</td>
                                        <td>{getKmAcumulados(conductor.id).toLocaleString('es-AR')} km</td>
                                        <td className="actions-cell">
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleEdit(conductor)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(conductor.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </>
    );
}