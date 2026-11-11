import { useState } from 'react';
import { writeClipboard } from '@/shared/services/clipboard';

export function useContactPatientViewModel(patient) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(() => `Olá, ${patient.name.split(' ')[0]}! Aqui é da Asanuma Odonto. Entramos em contato sobre seu atendimento. Podemos confirmar sua próxima consulta?`);
  async function copy() {
    try { await writeClipboard(message); setCopied(true); }
    catch { setError('Selecione e copie o texto da mensagem para enviar ao paciente.'); }
  }
  function updateMessage(value) { setMessage(value); setCopied(false); }
  return { copied, error, message, setError, copy, updateMessage };
}
