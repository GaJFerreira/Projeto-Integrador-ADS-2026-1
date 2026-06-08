package br.pucgo.ads.projetointegrador.eldencare.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ex_dia_plano", schema = "elden_care")
public class ex_dia_plano {

    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private ex_plano plano;

    // campo TEXT no DER (ex.: "SEGUNDA-FEIRA")
    @Column(name = "data_ou_ordem")
    private String dataOuOrdem;

    @OneToMany(mappedBy = "dia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ex_item_plano> itens = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public ex_plano getPlano() { return plano; }
    public void setPlano(ex_plano plano) { this.plano = plano; }

    public String getDataOuOrdem() { return dataOuOrdem; }
    public void setDataOuOrdem(String dataOuOrdem) { this.dataOuOrdem = dataOuOrdem; }

    public List<ex_item_plano> getItens() { return itens; }
    public void setItens(List<ex_item_plano> itens) { this.itens = itens; }
}
