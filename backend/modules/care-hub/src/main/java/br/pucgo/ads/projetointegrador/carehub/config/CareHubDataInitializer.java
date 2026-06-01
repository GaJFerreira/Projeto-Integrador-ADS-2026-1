package br.pucgo.ads.projetointegrador.carehub.config;

import br.pucgo.ads.projetointegrador.carehub.entity.Agendamento;
import br.pucgo.ads.projetointegrador.carehub.entity.Cliente;
import br.pucgo.ads.projetointegrador.carehub.entity.Cuidador;
import br.pucgo.ads.projetointegrador.carehub.entity.Mensagem;
import br.pucgo.ads.projetointegrador.carehub.entity.TipoAtendimento;
import br.pucgo.ads.projetointegrador.carehub.repository.AgendamentoRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.CareHubMensagemRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.ClienteRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.CuidadorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "carehub.seed", name = "enabled", havingValue = "true")
public class CareHubDataInitializer implements CommandLineRunner {

    private final AgendamentoRepository agendamentoRepository;
    private final CareHubMensagemRepository mensagemRepository;
    private final CuidadorRepository cuidadorRepository;
    private final ClienteRepository clienteRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            corrigirHorariosNulosLegado();
            criarDadosExemploSeNecessario();
        } catch (Exception e) {
            log.warn("CareHubDataInitializer ignorado por falha não crítica: {}", e.getMessage());
        }
    }

    private void corrigirHorariosNulosLegado() {
        // Backfill defensivo para ambientes legados: só afeta linhas com horário nulo.
        jdbcTemplate.update(
                "UPDATE care_hub.ch_agendamento " +
                        "SET data_hora_inicio = COALESCE(data_hora_inicio, NOW() + INTERVAL '1 day' + INTERVAL '9 hour'), " +
                        "    data_hora_fim = COALESCE(data_hora_fim, NOW() + INTERVAL '1 day' + INTERVAL '11 hour') " +
                        "WHERE data_hora_inicio IS NULL OR data_hora_fim IS NULL");

        jdbcTemplate.update(
                "UPDATE care_hub.ch_mensagem " +
                        "SET data_envio = COALESCE(data_envio, NOW()) " +
                        "WHERE data_envio IS NULL");
    }

    private void criarDadosExemploSeNecessario() {
        if (agendamentoRepository.count() > 0 && mensagemRepository.count() > 0) {
            return;
        }

        List<Cuidador> cuidadores = cuidadorRepository.findByDeletedAtIsNull();
        List<Cliente> clientes = clienteRepository.findByDeletedAtIsNull();
        if (cuidadores.isEmpty() || clientes.isEmpty()) {
            log.info("CareHubDataInitializer: sem cliente/cuidador suficientes para seed.");
            return;
        }

        Cuidador cuidador = cuidadores.get(0);
        Cliente cliente = clientes.get(0);

        if (agendamentoRepository.count() == 0) {
            OffsetDateTime base = OffsetDateTime.now(ZoneOffset.UTC)
                    .withHour(9).withMinute(0).withSecond(0).withNano(0);

            Agendamento a1 = new Agendamento();
            a1.setCuidador(cuidador);
            a1.setCliente(cliente);
            a1.setDataHoraInicio(base.plusDays(1));              // amanhã 09:00
            a1.setDataHoraFim(base.plusDays(1).plusHours(2));    // amanhã 11:00
            a1.setStatus(Agendamento.StatusAgendamento.CONFIRMADO);
            a1.setTipoAtendimento(TipoAtendimento.DOMICILIO);
            a1.setObservacoes("Atendimento de exemplo (manhã).");

            Agendamento a2 = new Agendamento();
            a2.setCuidador(cuidador);
            a2.setCliente(cliente);
            a2.setDataHoraInicio(base.plusDays(2).withHour(14)); // +2 dias 14:00
            a2.setDataHoraFim(base.plusDays(2).withHour(16));    // +2 dias 16:00
            a2.setStatus(Agendamento.StatusAgendamento.PENDENTE);
            a2.setTipoAtendimento(TipoAtendimento.ACOMPANHAMENTO);
            a2.setObservacoes("Atendimento de exemplo (tarde).");

            agendamentoRepository.saveAll(List.of(a1, a2));
            log.info("CareHubDataInitializer: agendamentos de exemplo criados.");
        }

        if (mensagemRepository.count() == 0) {
            Mensagem m1 = new Mensagem();
            m1.setRemetenteId(cliente.getId());
            m1.setDestinatarioId(cuidador.getId());
            m1.setConteudo("Olá! Podemos confirmar o atendimento de amanhã às 9h?");
            m1.setLida(false);

            Mensagem m2 = new Mensagem();
            m2.setRemetenteId(cuidador.getId());
            m2.setDestinatarioId(cliente.getId());
            m2.setConteudo("Olá! Confirmado, estarei no local às 9h.");
            m2.setLida(false);

            mensagemRepository.saveAll(List.of(m1, m2));
            log.info("CareHubDataInitializer: mensagens de exemplo criadas.");
        }
    }
}
