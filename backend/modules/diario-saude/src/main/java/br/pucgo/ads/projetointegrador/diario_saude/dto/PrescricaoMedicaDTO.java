package br.pucgo.ads.projetointegrador.diario_saude.dto;

import java.util.List;
import java.util.stream.Collectors;
import br.pucgo.ads.projetointegrador.diario_saude.entity.PrescricaoMedicaEntity;

public class PrescricaoMedicaDTO {

    private long id_prescricao;
    private String data_prescricao;
    private String observacoes;

    private long id_medico;

    private long id_usuario;

    private List<PrescricaoMedicamentoDTO> medicamentos;
    private List<PrescricaoExameDTO> exames;
    private List<ExercicioRecomendadoDTO> exerciciosRecomendados;

    public PrescricaoMedicaDTO(PrescricaoMedicaEntity entity) {
        this.id_prescricao = entity.getId_prescricao();
        this.data_prescricao = entity.getData_prescricao();
        this.observacoes = entity.getObservacoes();

        this.id_medico = entity.getMedicoId() != null ? entity.getMedicoId() : 0L;

        this.id_usuario = entity.getUsuario().getId_usuario();

        this.medicamentos = entity.getPrescricoesMedicamentos() == null ? List.of()
                : entity.getPrescricoesMedicamentos()
                        .stream()
                        .map(pm -> new PrescricaoMedicamentoDTO(pm))
                        .collect(Collectors.toList());

        this.exames = entity.getPrescricoesExames() == null ? List.of()
                : entity.getPrescricoesExames()
                        .stream()
                        .map(PrescricaoExameDTO::new)
                        .collect(Collectors.toList());

        this.exerciciosRecomendados = entity.getExerciciosRecomendados() == null ? List.of()
                : entity.getExerciciosRecomendados()
                        .stream()
                        .map(er -> new ExercicioRecomendadoDTO(er))
                        .collect(Collectors.toList());
    }

    public PrescricaoMedicaDTO() {
    }

    public long getId_prescricao() { return id_prescricao; }
    public void setId_prescricao(long id) { this.id_prescricao = id; }

    public String getData_prescricao() { return data_prescricao; }
    public void setData_prescricao(String data) { this.data_prescricao = data; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public long getId_medico() { return id_medico; }
    public void setId_medico(long id_medico) { this.id_medico = id_medico; }

    public long getId_usuario() { return id_usuario; }
    public void setId_usuario(long id_usuario) { this.id_usuario = id_usuario; }

    public List<PrescricaoMedicamentoDTO> getMedicamentos() { return medicamentos; }
    public void setMedicamentos(List<PrescricaoMedicamentoDTO> medicamentos) { this.medicamentos = medicamentos; }

    public List<ExercicioRecomendadoDTO> getExerciciosRecomendados() { return exerciciosRecomendados; }
    public void setExerciciosRecomendados(List<ExercicioRecomendadoDTO> exerciciosRecomendados) { this.exerciciosRecomendados = exerciciosRecomendados; }

    public List<PrescricaoExameDTO> getExames() { return exames; }
    public void setExames(List<PrescricaoExameDTO> exames) { this.exames = exames; }
}
