import { Component, useCallback, useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, LogOut, Trash2 } from 'lucide-react';
import { api, errorMessage } from '@/shared/api';
import { Modal, Loading, Button, ErrorNotice, ToothLogo } from '@/shared/ui';
import { AppShell } from '@/widgets/app-shell';
import { AuthPage } from '@/pages/auth';
import { AgendaPage } from '@/pages/agenda';
import { DashboardPage } from '@/pages/dashboard';
import { PatientsPage } from '@/pages/patients';
import { ProceduresPage } from '@/pages/procedures';
import { RecordsPage } from '@/pages/records';
import { SettingsPage } from '@/pages/settings';
import { PatientForm } from '@/features/manage-patient';
import { AppointmentForm } from '@/features/manage-appointment';
import { ProcedureForm } from '@/features/manage-procedure';
import { RecordForm } from '@/features/manage-record';
import { ContactPatient } from '@/features/contact-patient';
import './styles.css';

class ErrorBoundary extends Component {
 state={error:false};
 static getDerivedStateFromError(){return {error:true};}
 render(){return this.state.error?<main className="fatal-error"><ToothLogo size={64}/><h1>Não foi possível abrir esta tela.</h1><p>Recarregue a aplicação para tentar novamente.</p><Button onClick={()=>window.location.reload()} icon={RefreshCw}>Recarregar</Button></main>:this.props.children;}
}
function Confirmation({modal,onClose,onConfirm}) {const [busy,setBusy]=useState(false);const [error,setError]=useState('');const logout=modal.type==='logout';return <><div className={'confirmation-icon '+(logout?'':'danger')}><span>{logout?<LogOut size={28}/>:<Trash2 size={28}/>}</span></div><p className="confirmation-copy">{logout?'Você poderá entrar novamente com seu e-mail e sua senha.':modal.kind==='patients'?'Ao excluir '+modal.item.name+', o histórico clínico e as consultas vinculadas também serão excluídos. Esta ação não pode ser desfeita.':'O registro será excluído permanentemente. Deseja continuar?'}</p><ErrorNotice>{error}</ErrorNotice><div className="form-footer"><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button variant={logout?'primary':'danger'} disabled={busy} onClick={async()=>{setBusy(true);try{await onConfirm();onClose();}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}}>{busy?'Aguarde...':logout?'Sair da conta':'Excluir registro'}</Button></div></>;}
function Application() {
 const [data,setData]=useState(null);const [loading,setLoading]=useState(true);const [loadError,setLoadError]=useState('');const [path,setPath]=useState(window.location.hash.slice(1)||'agenda');const [modal,setModal]=useState(null);const [toast,setToast]=useState('');
 const refresh=useCallback(async()=>{try{const response=await api.get('/bootstrap');setData(response.data);setLoadError('');return response.data;}catch(e){if(e.response?.status===401){setData(null);setModal(null);return null;}setLoadError(errorMessage(e));throw e;}},[]);
 useEffect(()=>{refresh().catch(()=>{}).finally(()=>setLoading(false));const listener=()=>setPath(window.location.hash.slice(1)||'agenda');window.addEventListener('hashchange',listener);return()=>window.removeEventListener('hashchange',listener);},[refresh]);
 useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),5000);return()=>clearTimeout(timer);},[toast]);
 function navigate(route){window.location.hash=route;}
 const route=path.split('/')[0];
 async function save(kind,item){const {id,...body}=item;await (id?api.put('/'+kind+'/'+id,body):api.post('/'+kind,body));await refresh();setToast(id?'Alterações salvas com sucesso.':kind==='appointments'?'Consulta agendada com sucesso.':'Registro salvo com sucesso.');}
 async function authenticated(){setLoading(true);navigate('agenda');try{await refresh();}catch{}finally{setLoading(false);}}
 const common={data,onModal:setModal,onNavigate:navigate};
 let page;
 switch(route){case 'dashboard':page=<DashboardPage {...common}/>;break;case 'pacientes':page=<PatientsPage {...common}/>;break;case 'procedimentos':page=<ProceduresPage {...common}/>;break;case 'prontuarios':page=path.split('/')[1]?<RecordsPage {...common} patientId={path.split('/')[1]}/>:<PatientsPage {...common} recordsOnly/>;break;case 'configuracoes':page=<SettingsPage data={data} onUpdated={refresh} onNotify={setToast}/>;break;default:page=<AgendaPage {...common}/>;}
 if(loading)return <Loading/>;
 if(!data&&loadError)return <main className="fatal-error"><ToothLogo size={64}/><h1>Vamos reconectar sua clínica.</h1><ErrorNotice>{loadError}</ErrorNotice><Button icon={RefreshCw} onClick={()=>{setLoading(true);refresh().catch(()=>{}).finally(()=>setLoading(false));}}>Tentar novamente</Button></main>;
 if(!data)return <AuthPage onAuthenticated={authenticated}/>;
 const titles={patient:modal?.item?'Editar paciente':'Novo paciente',procedure:modal?.item?'Editar procedimento':'Novo procedimento',appointment:modal?.item?'Detalhes da consulta':'Novo agendamento',record:'Novo atendimento',delete:'Confirmar exclusão',logout:'Sair da conta?',contact:'Contatar paciente'};
 return <><a className="skip-link" href="#main-content" onClick={event=>{event.preventDefault();document.getElementById('main-content')?.focus();}}>Pular para o conteúdo</a><AppShell user={data.user} settings={data.settings} route={route} onNavigate={navigate} onLogout={()=>setModal({type:'logout'})}>{loadError&&<ErrorNotice>{loadError}</ErrorNotice>}{page}</AppShell>{toast&&<div role="status" className="toast"><CheckCircle2 size={21}/>{toast}<button onClick={()=>setToast('')} aria-label="Fechar notificação">×</button></div>}{modal&&<Modal key={modal.type+(modal.item?.id||'')} title={titles[modal.type]} description={modal.type==='appointment'?'Organize os detalhes do atendimento.':modal.type==='patient'?'Um novo sorriso para cuidar.':undefined} wide={['appointment','patient'].includes(modal.type)} onClose={()=>setModal(null)}>{modal.type==='patient'&&<PatientForm patient={modal.item} onSave={save} onCancel={()=>setModal(null)}/>} {modal.type==='procedure'&&<ProcedureForm procedure={modal.item} onSave={save} onCancel={()=>setModal(null)}/>} {modal.type==='appointment'&&<AppointmentForm appointment={modal.item} initialDate={modal.date} initialTime={modal.time} patients={data.patients} procedures={data.procedures} settings={data.settings} user={data.user} onSave={save} onCancel={()=>setModal(null)} onDelete={item=>setModal({type:'delete',kind:'appointments',item})}/>} {modal.type==='record'&&<RecordForm patientId={modal.patientId} tooth={modal.tooth} onSave={save} onCancel={()=>setModal(null)}/>} {modal.type==='contact'&&<ContactPatient patient={modal.item}/>} {['delete','logout'].includes(modal.type)&&<Confirmation modal={modal} onClose={()=>setModal(null)} onConfirm={async()=>{if(modal.type==='logout'){await api.post('/auth/logout');setData(null);navigate('login');}else{await api.delete('/'+modal.kind+'/'+modal.item.id);await refresh();setToast('Registro excluído.');}}}/>}</Modal>}</>;
}
export function App(){return <ErrorBoundary><Application/></ErrorBoundary>;}
