import { useEffect, useState } from 'react';
import { apiRequest } from './client';

const initialForm = {
    marca: '',
    modelo: '',
    patente: '',
    anio: '',
    capacidad_carga: '',
};

export default function Vehiculos() {
    const [vehiculos, setVehiculos] = useState([]);
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
            const [vehiculosRes, viajesRes] = await Promise.all([
                apiRequest('/vehiculos'),
                apiRequest('/viajes').catch(() => []),
            ]);
            const vehiculosList = Array.isArray(vehiculosRes)
                ? vehiculosRes
                : vehiculosRes.vehiculos || vehiculosRes.data || [];
            const viajesList = Array.isArray(viajesRes)
                ? viajesRes
                : viajesRes.viajes || viajesRes.data || [];

            setVehiculos(vehiculosList);
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
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'patente' ? value.toUpperCase() : value,
        }));
    };

    const resetForm = () => {
        setFormData(initialForm);
        setEditingId(null);
        setFieldErrors([]);
    };

    const handleEdit = (vehiculo) => {
        setError('');
        setSuccess('');
        setFieldErrors([]);
        setEditingId(vehiculo.id);
        setFormData({
            marca: vehiculo.marca || '',
            modelo: vehiculo.modelo || '',
            patente: vehiculo.patente || '',
            anio: String(vehiculo.anio ?? ''),
            capacidad_carga: String(vehiculo.capacidad_carga ?? ''),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setFieldErrors([]);

        const marca = formData.marca.trim();
        const modelo = formData.modelo.trim();
        const patente = formData.patente.trim().toUpperCase();
        const anio = Number(formData.anio);
        const capacidadCarga = Number(formData.capacidad_carga);

        if (!marca || !modelo || !patente) {
            setError('Marca, modelo y patente son obligatorios');
            return;
        }
        if (!Number.isInteger(anio) || anio < 1950 || anio > new Date().getFullYear() + 1) {
            setError('Ingresá un año válido');
            return;
        }
        if (Number.isNaN(capacidadCarga) || capacidadCarga <= 0) {
            setError('La capacidad de carga debe ser mayor a 0 kg');
            return;
        }

        const payload = {
            marca,
            modelo,
            patente,
            anio,
            capacidad_carga: capacidadCarga,
        };

        setSaving(true);
        try {
            if (editingId) {
                await apiRequest(`/vehiculos/${editingId}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
                setSuccess('Vehículo actualizado correctamente');
            } else {
                await apiRequest('/vehiculos', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
                setSuccess('Vehículo registrado correctamente');
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
        if (!window.confirm('¿Seguro que querés eliminar este vehículo?')) return;
        setError('');
        setSuccess('');
        try {
            await apiRequest(`/vehiculos/${id}`, { method: 'DELETE' });
            if (editingId === id) resetForm();
            setSuccess('Vehículo eliminado correctamente');
            await loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const getKmAcumulados = (vehiculoId) => {
        return viajes
            .filter((v) => Number(v.vehiculo_id) === Number(vehiculoId))
            .reduce((acc, v) => acc + Number(v.kilometros || 0), 0);
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1>Flota de Vehículos</h1>
                    <p className="muted-text">Administración de unidades y capacidad de carga</p>
                </div>
                <span className="badge">{vehiculos.length} unidades</span>
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
                <h2 className="mb-1">{editingId ? 'Editar vehículo' : 'Nuevo vehículo'}</h2>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="marca">Marca</label>
                            <input
                                id="marca"
                                name="marca"
                                type="text"
                                value={formData.marca}
                                onChange={handleChange}
                                placeholder="Mercedes-Benz"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="modelo">Modelo</label>
                            <input
                                id="modelo"
                                name="modelo"
                                type="text"
                                value={formData.modelo}
                                onChange={handleChange}
                                placeholder="Actros 2651"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="patente">Patente</label>
                            <input
                                id="patente"
                                name="patente"
                                type="text"
                                maxLength={10}
                                value={formData.patente}
                                onChange={handleChange}
                                placeholder="AB123CD"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="anio">Año</label>
                            <input
                                id="anio"
                                name="anio"
                                type="number"
                                value={formData.anio}
                                onChange={handleChange}
                                placeholder="2023"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="capacidad_carga">Capacidad de carga (kg)</label>
                            <input
                                id="capacidad_carga"
                                name="capacidad_carga"
                                type="number"
                                step="0.01"
                                value={formData.capacidad_carga}
                                onChange={handleChange}
                                placeholder="25000"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar vehículo'}
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
                <h2 className="mb-1">Listado de vehículos</h2>
                {loading ? (
                    <p className="muted-text">Cargando vehículos...</p>
                ) : vehiculos.length === 0 ? (
                    <p className="muted-text">No hay vehículos registrados todavía.</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Patente</th>
                                    <th>Marca</th>
                                    <th>Modelo</th>
                                    <th>Año</th>
                                    <th>Capacidad (kg)</th>
                                    <th>Km acumulados</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehiculos.map((vehiculo) => (
                                    <tr key={vehiculo.id}>
                                        <td>
                                            <strong>{vehiculo.patente}</strong>
                                        </td>
                                        <td>{vehiculo.marca}</td>
                                        <td>{vehiculo.modelo}</td>
                                        <td>{vehiculo.anio}</td>
                                        <td>{Number(vehiculo.capacidad_carga).toLocaleString('es-AR')} kg</td>
                                        <td>{getKmAcumulados(vehiculo.id).toLocaleString('es-AR')} km</td>
                                        <td className="actions-cell">
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleEdit(vehiculo)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(vehiculo.id)}
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