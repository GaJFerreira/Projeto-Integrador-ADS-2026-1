package br.pucgo.ads.projetointegrador.dosecerta.service;


import org.springframework.stereotype.Service;

@Service
public class NotificacaoService {

    public void enviarEmail(String para, String assunto, String mensagem) {
        System.out.println("📧 Enviando email para " + para + " — " + assunto);
        System.out.println(mensagem);
    }

    public void enviarSms(String numero, String mensagem) {
        System.out.println("📨 Enviando SMS para " + numero + " — " + mensagem);
    }

    public void enviarWhatsapp(String numero, String mensagem) {
        System.out.println("💬 Enviando WhatsApp para " + numero + " — " + mensagem);
    }
}
