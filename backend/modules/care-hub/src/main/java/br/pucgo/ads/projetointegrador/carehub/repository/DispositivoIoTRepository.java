package br.pucgo.ads.projetointegrador.carehub.repository;

import br.pucgo.ads.projetointegrador.carehub.entity.DispositivoIoT;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DispositivoIoTRepository extends JpaRepository<DispositivoIoT, Long> {
    Optional<DispositivoIoT> findByDeviceId(String deviceId);
    java.util.List<DispositivoIoT> findByCliente_Id(Long clienteId);
}
