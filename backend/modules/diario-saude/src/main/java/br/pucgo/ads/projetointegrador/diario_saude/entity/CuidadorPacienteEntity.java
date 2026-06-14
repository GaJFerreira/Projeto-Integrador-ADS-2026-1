package br.pucgo.ads.projetointegrador.diario_saude.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ds_cuidador_paciente", schema = "diario_saude")
public class CuidadorPacienteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cuidador_platform_id", nullable = false)
    private Long cuidadorPlatformId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private UsuarioEntity paciente;

    public CuidadorPacienteEntity() {}

    public CuidadorPacienteEntity(Long cuidadorPlatformId, UsuarioEntity paciente) {
        this.cuidadorPlatformId = cuidadorPlatformId;
        this.paciente = paciente;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCuidadorPlatformId() { return cuidadorPlatformId; }
    public void setCuidadorPlatformId(Long cuidadorPlatformId) { this.cuidadorPlatformId = cuidadorPlatformId; }

    public UsuarioEntity getPaciente() { return paciente; }
    public void setPaciente(UsuarioEntity paciente) { this.paciente = paciente; }
}
