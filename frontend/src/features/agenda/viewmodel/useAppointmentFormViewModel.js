import { useState } from 'react';
import { useMutationFormViewModel } from '@/shared/viewmodel/useMutationFormViewModel';

export function useAppointmentFormViewModel(props) {
  const [procedureId, setProcedureId] = useState(props.appointment?.procedureId || '');
  const form = useMutationFormViewModel({ ...props, kind: 'appointments' });
  const procedure = props.procedures.find(item => item.id === procedureId);
  return { ...form, procedure, procedureId, setProcedureId };
}
