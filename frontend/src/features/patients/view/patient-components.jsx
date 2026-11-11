import './patient-components.css';
import { initials } from '@/shared/model';
import { Badge } from '@/shared/view';
export function PatientAvatar({patient,large=false}) {return <span className={'avatar '+(large?'large':'')} aria-hidden="true">{initials(patient?.name)}</span>;}
export function PatientIdentity({patient}) {return <div className="patient-identity"><PatientAvatar patient={patient}/><div><strong>{patient.name}</strong><small>{'Particular'}</small></div></div>;}
export function PatientSummary({patient}) {return <div className="patient-summary"><PatientAvatar patient={patient} large/><div><h2>{patient.name}</h2><Badge>{patient.status}</Badge><p>{patient.age} anos ? {'Particular'}</p></div></div>;}
