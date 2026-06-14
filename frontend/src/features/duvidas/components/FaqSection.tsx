import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { faqsApi, type FaqItem } from '../api/faqs';

export function FaqSection() {
  const [tabAtual, setTabAtual] = useState(0);
  const [expandido, setExpandido] = useState<string | false>(false);

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: faqsApi.listar,
  });

  // Agrupa os FAQs por módulo
  const groupedFaqs = useMemo(() => {
    if (!faqs || faqs.length === 0) return [];

    const map = new Map<string, { modulo: string; cor: string; itens: FaqItem[] }>();

    faqs.forEach((faq) => {
      if (!map.has(faq.modulo)) {
        map.set(faq.modulo, {
          modulo: faq.modulo,
          cor: faq.cor,
          itens: [],
        });
      }
      map.get(faq.modulo)!.itens.push(faq);
    });

    return Array.from(map.values());
  }, [faqs]);

  if (isLoading) {
    return <Typography color="text.secondary">Carregando perguntas frequentes...</Typography>;
  }

  if (groupedFaqs.length === 0) {
    return (
      <Typography color="text.secondary">
        Nenhuma pergunta frequente cadastrada no momento.
      </Typography>
    );
  }

  // Garante que tabAtual não exceda o tamanho (caso apaguem todos de um módulo)
  const currentTabIndex = tabAtual >= groupedFaqs.length ? 0 : tabAtual;
  const modulo = groupedFaqs[currentTabIndex];

  return (
    <Box>
      <Tabs
        value={currentTabIndex}
        onChange={(_, v) => {
          setTabAtual(v);
          setExpandido(false);
        }}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {groupedFaqs.map((m, i) => (
          <Tab
            key={m.modulo}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {m.modulo}
              </Box>
            }
          />
        ))}
      </Tabs>

      {modulo && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Chip label={modulo.modulo} color={modulo.cor as any} size="small" />
          </Box>

          {modulo.itens.map((item, idx) => (
            <Accordion
              key={item.id}
              expanded={expandido === `${currentTabIndex}-${idx}`}
              onChange={(_, isOpen) => setExpandido(isOpen ? `${currentTabIndex}-${idx}` : false)}
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px !important',
                mb: 1,
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>{item.pergunta}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {item.resposta}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      )}
    </Box>
  );
}
