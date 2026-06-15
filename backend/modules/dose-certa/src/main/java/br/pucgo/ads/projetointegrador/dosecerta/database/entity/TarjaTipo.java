package br.pucgo.ads.projetointegrador.dosecerta.database.entity;

public enum TarjaTipo {
    SEM_TARJA,
    AMARELA,
    VERMELHA,
    PRETA;

    public static TarjaTipo fromString(String value) {
        if (value == null) return SEM_TARJA;

        switch (value.trim().toLowerCase()) {
            case "sem_tarja":
            case "sem tarja":
                return SEM_TARJA;
            case "amarela":
                return AMARELA;
            case "vermelha":
                return VERMELHA;
            case "preta":
                return PRETA;
            default:
                throw new IllegalArgumentException("Tarja inválida: " + value);
        }
    }

    @Override
    public String toString() {
        return name();
    }
}
