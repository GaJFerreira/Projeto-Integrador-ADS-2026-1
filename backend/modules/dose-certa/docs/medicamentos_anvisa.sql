INSERT INTO medicamentos_anvisa (
    id,
    categoria_regulatoria,
    classe_terapeutica,
    data_finalizacao_processo,
    data_vencimento_registro,
    empresa_detentora_registro,
    nome_produto,
    numero_processo,
    numero_registro_produto,
    principio_ativo,
    situacao_registro,
    tipo_produto,
    farmacia_popular

)
VALUES
(1,  'Medicamento', 'Analgésico', NULL, NULL, 'EMS', 'Dipirona 500mg', NULL, NULL, 'Dipirona monoidratada', 'Ativo', 'Medicamento', FALSE),
(2,  'Medicamento', 'Analgésico', NULL, NULL, 'Medley', 'Paracetamol 750mg', NULL, NULL, 'Paracetamol', 'Ativo', 'Medicamento', FALSE),
(3,  'Medicamento', 'Antibiótico', NULL, NULL, 'EMS', 'Amoxicilina 500mg', NULL, NULL, 'Amoxicilina', 'Ativo', 'Medicamento', FALSE),
(4,  'Medicamento', 'Anti-inflamatório', NULL, NULL, 'Bayer', 'Ibuprofeno 600mg', NULL, NULL, 'Ibuprofeno', 'Ativo', 'Medicamento', FALSE),
(5,  'Medicamento', 'Antiulceroso', NULL, NULL, 'AstraZeneca', 'Omeprazol 20mg', NULL, NULL, 'Omeprazol', 'Ativo', 'Medicamento', FALSE),

(6,  'Medicamento', 'Antialérgico', NULL, NULL, 'Sanofi', 'Loratadina 10mg', NULL, NULL, 'Loratadina', 'Ativo', 'Medicamento', TRUE),
(7,  'Medicamento', 'Antibiótico', NULL, NULL, 'EMS', 'Azitromicina 500mg', NULL, NULL, 'Azitromicina', 'Ativo', 'Medicamento', FALSE),
(8,  'Medicamento', 'Antidiabético', NULL, NULL, 'Novo Nordisk', 'Metformina 850mg', NULL, NULL, 'Cloridrato de metformina', 'Ativo', 'Medicamento', TRUE),
(9,  'Medicamento', 'Ansiolítico', NULL, NULL, 'Roche', 'Diazepam 10mg', NULL, NULL, 'Diazepam', 'Ativo', 'Medicamento', FALSE),
(10, 'Medicamento', 'Antidepressivo', NULL, NULL, 'Pfizer', 'Sertralina 50mg', NULL, NULL, 'Sertralina', 'Ativo', 'Medicamento', FALSE),

(11, 'Medicamento', 'Anti-hipertensivo', NULL, NULL, 'EMS', 'Losartana 50mg', NULL, NULL, 'Losartana potássica', 'Ativo', 'Medicamento', TRUE),
(12, 'Medicamento', 'Anti-hipertensivo', NULL, NULL, 'Bayer', 'Captopril 25mg', NULL, NULL, 'Captopril', 'Ativo', 'Medicamento', TRUE),
(13, 'Medicamento', 'Broncodilatador', NULL, NULL, 'GSK', 'Salbutamol aerosol', NULL, NULL, 'Salbutamol', 'Ativo', 'Medicamento', TRUE),
(14, 'Medicamento', 'Antifúngico', NULL, NULL, 'EMS', 'Fluconazol 150mg', NULL, NULL, 'Fluconazol', 'Ativo', 'Medicamento', FALSE),
(15, 'Medicamento', 'Antiviral', NULL, NULL, 'Gilead', 'Aciclovir 200mg', NULL, NULL, 'Aciclovir', 'Ativo', 'Medicamento', FALSE),

(16, 'Medicamento', 'Anti-inflamatório', NULL, NULL, 'Novartis', 'Diclofenaco 50mg', NULL, NULL, 'Diclofenaco sódico', 'Ativo', 'Medicamento', FALSE),
(17, 'Medicamento', 'Analgésico', NULL, NULL, 'EMS', 'Nimesulida 100mg', NULL, NULL, 'Nimesulida', 'Ativo', 'Medicamento', FALSE),
(18, 'Medicamento', 'Antiemético', NULL, NULL, 'Sanofi', 'Dramin 50mg', NULL, NULL, 'Dimenidrinato', 'Ativo', 'Medicamento', FALSE),
(19, 'Medicamento', 'Antiparasitário', NULL, NULL, 'Merck', 'Albendazol 400mg', NULL, NULL, 'Albendazol', 'Ativo', 'Medicamento', FALSE),
(20, 'Medicamento', 'Antiparasitário', NULL, NULL, 'EMS', 'Ivermectina 6mg', NULL, NULL, 'Ivermectina', 'Ativo', 'Medicamento', FALSE),

(21, 'Medicamento', 'Anticoncepcional', NULL, NULL, 'Bayer', 'Yasmin', NULL, NULL, 'Drospirenona + Etinilestradiol', 'Ativo', 'Medicamento', FALSE),
(22, 'Medicamento', 'Anticoncepcional', NULL, NULL, 'Pfizer', 'Microvlar', NULL, NULL, 'Levonorgestrel + Etinilestradiol', 'Ativo', 'Medicamento', TRUE),
(23, 'Medicamento', 'Antipsicótico', NULL, NULL, 'Janssen', 'Risperidona 2mg', NULL, NULL, 'Risperidona', 'Ativo', 'Medicamento', FALSE),
(24, 'Medicamento', 'Estatina', NULL, NULL, 'Pfizer', 'Sinvastatina 20mg', NULL, NULL, 'Sinvastatina', 'Ativo', 'Medicamento', TRUE),
(25, 'Medicamento', 'Anticoagulante', NULL, NULL, 'Boehringer', 'Rivaroxabana 20mg', NULL, NULL, 'Rivaroxabana', 'Ativo', 'Medicamento', FALSE),

(26, 'Medicamento', 'Hormonal', NULL, NULL, 'AbbVie', 'Levotiroxina 50mcg', NULL, NULL, 'Levotiroxina sódica', 'Ativo', 'Medicamento', FALSE),
(27, 'Medicamento', 'Gastroprotetor', NULL, NULL, 'AstraZeneca', 'Pantoprazol 40mg', NULL, NULL, 'Pantoprazol', 'Ativo', 'Medicamento', FALSE),
(28, 'Medicamento', 'Anti-inflamatório', NULL, NULL, 'EMS', 'Prednisona 20mg', NULL, NULL, 'Prednisona', 'Ativo', 'Medicamento', FALSE),
(29, 'Medicamento', 'Analgésico', NULL, NULL, 'Takeda', 'Tramadol 50mg', NULL, NULL, 'Tramadol', 'Ativo', 'Medicamento', FALSE),
(30, 'Medicamento', 'Antibiótico', NULL, NULL, 'EMS', 'Cefalexina 500mg', NULL, NULL, 'Cefalexina', 'Ativo', 'Medicamento', FALSE);