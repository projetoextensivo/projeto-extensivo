import './styles.css';
import { formatDate } from '@/shared/lib';
export function ClinicalTimeline({records,limit}) {const sorted=[...records].sort((a,b)=>b.date.localeCompare(a.date));return <div className="timeline">{sorted.slice(0,limit||sorted.length).map(record=><article key={record.id}><time>{formatDate(record.date)}</time><h4>{record.title}</h4><p>{record.notes}</p><small>{record.dentist}{record.tooth?' · Dente '+record.tooth:''}</small></article>)}</div>;}
