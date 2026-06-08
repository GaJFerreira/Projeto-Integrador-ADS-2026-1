import { useState, useCallback, useEffect } from 'react';
import { iotApi } from '../api';
import type { DispositivoIoTResponseDTO, DispositivoIoTCreateRequestDTO } from '../types';

export function useDevices() {
  const [devices, setDevices] = useState<DispositivoIoTResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await iotApi.listarDispositivos();
      setDevices(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao buscar dispositivos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const addDevice = async (dto: DispositivoIoTCreateRequestDTO): Promise<DispositivoIoTResponseDTO> => {
    setError(null);
    try {
      const newDevice = await iotApi.cadastrarDispositivo(dto);
      // Atualiza a lista na tela com o novo dispositivo recém cadastrado
      setDevices((prev) => [...prev, newDevice]);
      return newDevice;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao cadastrar dispositivo';
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    devices,
    loading,
    error,
    fetchDevices,
    addDevice,
  };
}
