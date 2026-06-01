export type SpeechRecognitionInstance = any;

export interface SpeechRecognitionTextEvent {
    texto: string;
    final: boolean;
}

export interface SpeechOptions {
    onText: (event: SpeechRecognitionTextEvent) => void;
    onStart: () => void;
    onEnd: () => void;
    onUnsupported: () => void;
    onError: (errorCode?: string) => void;
    silenceTimeoutMs?: number;
}

export function criarReconhecimentoVoz({
    onText,
    onStart,
    onEnd,
    onUnsupported,
    onError,
    silenceTimeoutMs = 3000,
}: SpeechOptions): SpeechRecognitionInstance | null {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
        onUnsupported();
        return null;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let silenceTimer: ReturnType<typeof window.setTimeout> | null = null;

    const clearSilenceTimer = () => {
        if (silenceTimer) {
            window.clearTimeout(silenceTimer);
            silenceTimer = null;
        }
    };

    const scheduleSilenceStop = () => {
        clearSilenceTimer();
        silenceTimer = window.setTimeout(() => {
            try {
                recognition.stop();
            } catch {
                // O navegador pode encerrar a captura antes do timer.
            }
        }, silenceTimeoutMs);
    };

    recognition.onstart = () => {
        onStart();
        scheduleSilenceStop();
    };
    recognition.onspeechstart = clearSilenceTimer;
    recognition.onspeechend = scheduleSilenceStop;
    recognition.onend = () => {
        clearSilenceTimer();
        onEnd();
    };
    recognition.onerror = (event: any) => {
        clearSilenceTimer();
        onError(event?.error);
    };
    recognition.onresult = (event: any) => {
        let textoFinal = '';
        let textoParcial = '';

        for (let index = event.resultIndex; index < event.results.length; index += 1) {
            const texto = event.results[index][0].transcript;
            if (event.results[index].isFinal) {
                textoFinal += texto;
            } else {
                textoParcial += texto;
            }
        }

        if (textoFinal.trim()) {
            onText({ texto: textoFinal.trim(), final: true });
        }

        if (textoParcial.trim()) {
            onText({ texto: textoParcial.trim(), final: false });
        }

        scheduleSilenceStop();
    };

    return recognition;
}

export function alternarReconhecimentoVoz(
    recognition: SpeechRecognitionInstance,
    gravando: boolean,
    onStartError: () => void
) {
    try {
        if (gravando) {
            recognition.stop();
        } else {
            recognition.start();
        }
    } catch {
        onStartError();
    }
}

export function iniciarReconhecimentoVoz(
    options: SpeechOptions,
    onStartError: (error?: unknown) => void
) {
    const recognition = criarReconhecimentoVoz(options);

    if (!recognition) {
        return null;
    }

    try {
        recognition.start();
        return recognition;
    } catch (error) {
        try {
            recognition.abort?.();
            recognition.stop?.();
        } catch {
            // O navegador pode recusar stop/abort quando a captura nao iniciou.
        }
        onStartError(error);
        return null;
    }
}
