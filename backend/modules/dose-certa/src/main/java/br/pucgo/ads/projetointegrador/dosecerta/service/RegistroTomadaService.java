package br.pucgo.ads.projetointegrador.dosecerta.service;

import br.pucgo.ads.projetointegrador.dosecerta.database.entity.Medicamento;
import br.pucgo.ads.projetointegrador.dosecerta.database.entity.MedicamentoHorario;
import br.pucgo.ads.projetointegrador.dosecerta.database.entity.RegistroTomada;
import br.pucgo.ads.projetointegrador.dosecerta.database.repository.MedicamentoHorarioRepository;
import br.pucgo.ads.projetointegrador.dosecerta.database.repository.MedicamentoRepository;
import br.pucgo.ads.projetointegrador.dosecerta.database.repository.RegistroTomadaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class RegistroTomadaService {

    private final RegistroTomadaRepository registroRepository;
    private final MedicamentoRepository medicamentoRepository;
    private final MedicamentoHorarioRepository horarioRepository;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

    public RegistroTomadaService(RegistroTomadaRepository registroRepository,
                                 MedicamentoRepository medicamentoRepository,
                                 MedicamentoHorarioRepository horarioRepository) {
        this.registroRepository = registroRepository;
        this.medicamentoRepository = medicamentoRepository;
        this.horarioRepository = horarioRepository;
    }
    @Transactional
    public void apagarHistorico(Long platformUserId) {
        registroRepository.deleteByPlatformUserId(platformUserId);
    }

    // Lista todos os registros de um medicamento
    public List<RegistroTomada> listarPorMedicamento(Long medicamentoId) {
        validarMedicamento(medicamentoId);
        return registroRepository.findByMedicamentoIdOrderByDataPrevistaAscHorarioPrevistoAsc(medicamentoId);
    }

    // Lista registros por medicamento e dia específico
    public List<RegistroTomada> listarPorMedicamentoEDia(Long medicamentoId, LocalDate data) {
        validarMedicamento(medicamentoId);
        return registroRepository.findByMedicamentoIdAndDataPrevistaOrderByHorarioPrevistoAsc(medicamentoId, data);
    }

    // Busca registro por ID
    public RegistroTomada buscarPorId(Long id) {
        return registroRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Registro de tomada não encontrado!"));
    }

    // Marca um registro como tomado ou não
    @Transactional
    public RegistroTomada marcarTomada(Long id, Boolean tomado) {
        RegistroTomada registro = buscarPorId(id);
        registro.setTomado(tomado != null ? tomado : true);
        return registroRepository.save(registro);
    }

    // Cria um novo registro de tomada a partir do medicamento e do horário
    @Transactional
    public RegistroTomada criarRegistro(Long medicamentoId, Long horarioId, LocalDate data) {
        Medicamento medicamento = validarMedicamento(medicamentoId);

        MedicamentoHorario horario = horarioRepository.findById(horarioId)
                .orElseThrow(() -> new EntityNotFoundException("Horário não encontrado!"));

        RegistroTomada registro = new RegistroTomada();
        registro.setMedicamento(medicamento);
        registro.setHorarioMedicamento(horario);
        registro.setDataPrevista(data);
        registro.setPlatformUserId(medicamento.getPlatformUserId());

        // Conversão da String para LocalTime
        if (horario.getHorario() != null) {
            registro.setHorarioPrevisto(LocalTime.parse(horario.getHorario(), formatter));
        } else {
            registro.setHorarioPrevisto(LocalTime.of(0, 0)); // fallback
        }

        registro.setTomado(false);

        return registroRepository.save(registro);
    }
    @Transactional
    public void registrarTomadaDireto(Long horarioId) {

        // Buscar o horário
        MedicamentoHorario horario = horarioRepository.findById(horarioId)
                .orElseThrow(() -> new EntityNotFoundException("Horário não encontrado!"));

        Medicamento medicamento = horario.getMedicamento();

        // Criar registro de tomada
        RegistroTomada registro = new RegistroTomada();
        registro.setMedicamento(medicamento);
        registro.setPlatformUserId(medicamento.getPlatformUserId());
        registro.setHorarioMedicamento(horario);
        registro.setDataPrevista(LocalDate.now());

        // Converter horário da String ex: "12:00"
        if (horario.getHorario() != null) {
            registro.setHorarioPrevisto(LocalTime.parse(horario.getHorario()));
        }

        // Marcar como tomado
        registro.registrarTomada(LocalTime.now());

        registroRepository.save(registro);

        // Atualiza status do horário (pra reflexo no DTO)
        horario.setTomadoHoje(true);
        horarioRepository.save(horario);
    }
    public List<RegistroTomada> listarPorUsuario(Long platformUserId) {
        return registroRepository.findByPlatformUserId(platformUserId);
    }

    // Valida se o medicamento existe
    private Medicamento validarMedicamento(Long id) {
        return medicamentoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Medicamento não encontrado!"));
    }
}
