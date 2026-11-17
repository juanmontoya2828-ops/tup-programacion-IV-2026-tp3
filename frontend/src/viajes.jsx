import { useEffect, useState } from 'react';
import { apiRequest } from './client';

const initialForm = {
    vehiculo_id: '',
    conductor_id: '',
    fecha_salida: '',
    fecha_llegada: '',
    origen: '',
    destino: '',
    kilometros: '',
    observaciones: '',
};

const toDateTimeInput = (value) => {
    if (!value) return '';
    return String(value).replace(' ', 'T').slice(0, 16);
};

const formatDateTime = (value) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleString('es-AR', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
};

export default function Viajes() {
    const [viajes, setViajes] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [conductores, setConductores] = useState([]);
    const [formData, setFormData] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [filterVehiculoId, setFilterVehiculoId] = useState('');
    const [filterConductorId, setFilterConductorId] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState([]);
    const [success, setSuccess] = useState('');

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [viajesRes, vehiculosRes, conductoresRes] = await Promise.all([
                apiRequest('/viajes'),
                apiRequest('/vehiculos'),
                apiRequest('/conductores'),
            ]);

            setViajes(
                Array.isArray(viajesRes) ? viajesRes : viajesRes.viajes || viajesRes.data || []
            );
            setVehiculos(
                Array.isArray(vehiculosRes)
                    ? vehiculosRes
                    : vehiculosRes.vehiculos || vehiculosRes.data || []
            );
            setConductores(
                Array.isArray(conductoresRes)
                    ? conductoresRes
                    : conductoresRes.conductores || conductoresRes.data || []
            );
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

    const handleEdit = (viaje) => {
        setError('');
        setSuccess('');
        setFieldErrors([]);
        setEditingId(viaje.id);
        setFormData({
            vehiculo_id: String(viaje.vehiculo_id ?? ''),
            conductor_id: String(viaje.conductor_id ?? ''),
            fecha_salida: toDateTimeInput(viaje.fecha_salida),
            fecha_llegada: toDateTimeInput(viaje.fecha_llegada),
            origen: viaje.origen || '',
            destino: viaje.destino || '',
            kilometros: String(viaje.kilometros ?? ''),
            observaciones: viaje.observaciones || '',
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setFieldErrors([]);

        const vehiculoId = Number(formData.vehiculo_id);
        const conductorId = Number(formData.conductor_id);
        const kilometros = Number(formData.kilometros);
        const origen = formData.origen.trim();
        const destino = formData.destino.trim();

        if (!vehiculoId || !conductorId) {
            setError('Seleccioná un vehículo y un conductor');
            return;
        }
        if (!formData.fecha_salida || !formData.fecha_llegada) {
            setError('Las fechas de salida y llegada son obligatorias');
            return;
        }
        if (formData.fecha_llegada < formData.fecha_salida) {
            setError('La fecha de llegada no puede ser anterior a la fecha de salida');
            return;
        }
        if (!origen || !destino) {
            setError('El origen y el destino son obligatorios');
            return;
        }
        if (Number.isNaN(kilometros) || kilometros <= 0) {
            setError('Los kilómetros deben ser mayores a 0');
            return;
        }

        const payload = {
            vehiculo_id: vehiculoId,
            conductor_id: conductorId,
            fecha_salida: formData.fecha_salida,
            fecha_llegada: formData.fecha_llegada,
            origen,
            destino,
            kilometros,
            observaciones: formData.observaciones.trim() || null,
        };

        setSaving(true);
        try {
            if (editingId) {
                await apiRequest(`/viajes/${editingId}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
                setSuccess('Viaje actualizado correctamente');
            } else {
                await apiRequest('/viajes', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
                setSuccess('Viaje registrado correctamente');
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
        if (!window.confirm('¿Seguro que querés eliminar este viaje?')) return;
        setError('');
        setSuccess('');
        try {
            await apiRequest(`/viajes/${id}`, { method: 'DELETE' });
            if (editingId === id) resetForm();
            setSuccess('Viaje eliminado correctamente');
            await loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const getVehiculoLabel = (viaje) => {
        if (viaje.patente) return `${viaje.patente} (${viaje.marca || ''} ${viaje.modelo || ''})`.trim();
        const found = vehiculos.find((v) => Number(v.id) === Number(viaje.vehiculo_id));
        return found ? `${found.patente} - ${found.marca} ${found.modelo}` : `ID #${viaje.vehiculo_id}`;
    };

    const getConductorLabel = (viaje) => {
        if (viaje.conductor_apellido) return `${viaje.conductor_apellido}, ${viaje.conductor_nombre}`;
        const found = conductores.find((c) => Number(c.id) === Number(viaje.conductor_id));
        return found ? `${found.apellido}, ${found.nombre}` : `ID #${viaje.conductor_id}`;
    };

    const filteredViajes = viajes.filter((viaje) => {
        if (filterVehiculoId && Number(viaje.vehiculo_id) !== Number(filterVehiculoId)) {
            return false;
        }
        if (filterConductorId && Number(viaje.conductor_id) !== Number(filterConductorId)) {
            return false;
        }
        return true;
    });

    const totalKilometros = filteredViajes.reduce(
        (acc, viaje) => acc + Number(viaje.kilometros || 0),
        0
    );

    return (
        <>
            <div className="page-header">
                <div>
                    <h1>Registro de Viajes</h1>
                    <p className="muted-text">Asignación de unidades, choferes y cálculo acumulado de kilómetros</p>
                </div>
                <span className="badge">
                    {filteredViajes.length} viajes · {totalKilometros.toLocaleString('es-AR')} km totales
                </span>
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
                <h2 className="mb-1">{editingId ? 'Editar viaje' : 'Nuevo viaje'}</h2>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="vehiculo_id">Vehículo</label>
                            <select
                                id="vehiculo_id"
                                name="vehiculo_id"
                                value={formData.vehiculo_id}
                                onChange={handleChange}
                            >
                                <option value="">Seleccionar vehículo...</option>
                                {vehiculos.map((vehiculo) => (
                                    <option key={vehiculo.id} value={vehiculo.id}>
                                        {vehiculo.patente} - {vehiculo.marca} {vehiculo.modelo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="conductor_id">Conductor</label>
                            <select
                                id="conductor_id"
                                name="conductor_id"
                                value={formData.conductor_id}
                                onChange={handleChange}
                            >
                                <option value="">Seleccionar conductor...</option>
                                {conductores.map((conductor) => (
                                    <option key={conductor.id} value={conductor.id}>
                                        {conductor.apellido}, {conductor.nombre} (DNI {conductor.numero_documento})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="fecha_salida">Fecha y hora de salida</label>
                            <input
                                id="fecha_salida"
                                name="fecha_salida"
                                type="datetime-local"
                                value={formData.fecha_salida}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="fecha_llegada">Fecha y hora de llegada</label>
                            <input
                                id="fecha_llegada"
                                name="fecha_llegada"
                                type="datetime-local"
                                value={formData.fecha_llegada}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="origen">Origen</label>
                            <input
                                id="origen"
                                name="origen"
                                type="text"
                                value={formData.origen}
                                onChange={handleChange}
                                placeholder="La Rioja"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="destino">Destino</label>
                            <input
                                id="destino"
                                name="destino"
                                type="text"
                                value={formData.destino}
                                onChange={handleChange}
                                placeholder="Córdoba"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="kilometros">Kilómetros recorridos</label>
                            <input
                                id="kilometros"
                                name="kilometros"
                                type="number"
                                step="0.01"
                                value={formData.kilometros}
                                onChange={handleChange}
                                placeholder="430.50"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="observaciones">Observaciones (opcional)</label>
                            <input
                                id="observaciones"
                                name="observaciones"
                                type="text"
                                value={formData.observaciones}
                                onChange={handleChange}
                                placeholder="Carga refrigerada sin novedades"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Registrar viaje'}
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
                <div className="page-header">
                    <h2>Historial de viajes</h2>
                    <div className="form-actions">
                        <div className="form-group">
                            <select
                                aria-label="Filtrar por vehículo"
                                value={filterVehiculoId}
                                onChange={(e) => setFilterVehiculoId(e.target.value)}
                            >
                                <option value="">Todos los vehículos</option>
                                {vehiculos.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.patente} - {v.marca}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <select
                                aria-label="Filtrar por conductor"
                                value={filterConductorId}
                                onChange={(e) => setFilterConductorId(e.target.value)}
                            >
                                <option value="">Todos los conductores</option>
                                {conductores.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.apellido}, {c.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {(filterVehiculoId || filterConductorId) && (
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                    setFilterVehiculoId('');
                                    setFilterConductorId('');
                                }}
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <p className="muted-text">Cargando viajes...</p>
                ) : filteredViajes.length === 0 ? (
                    <p className="muted-text">No se encontraron viajes para los filtros seleccionados.</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Vehículo</th>
                                    <th>Conductor</th>
                                    <th>Salida</th>
                                    <th>Llegada</th>
                                    <th>Trayecto</th>
                                    <th>Kilómetros</th>
                                    <th>Observaciones</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredViajes.map((viaje) => (
                                    <tr key={viaje.id}>
                                        <td>
                                            <strong>{getVehiculoLabel(viaje)}</strong>
                                        </td>
                                        <td>{getConductorLabel(viaje)}</td>
                                        <td>{formatDateTime(viaje.fecha_salida)}</td>
                                        <td>{formatDateTime(viaje.fecha_llegada)}</td>
                                        <td>
                                            {viaje.origen} → {viaje.destino}
                                        </td>
                                        <td>{Number(viaje.kilometros).toLocaleString('es-AR')} km</td>
                                        <td>{viaje.observaciones || '-'}</td>
                                        <td className="actions-cell">
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleEdit(viaje)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(viaje.id)}
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