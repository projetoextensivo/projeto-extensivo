import { Component } from 'react';
import { CheckCircle2, RefreshCw, LogOut, Trash2 } from 'lucide-react';
import { Modal, Loading, Button, ErrorNotice, ToothLogo } from '@/shared/view';
import { AppShell } from '@/widgets/app-shell';
import { AuthPage } from '@/features/auth';
import { AgendaPage } from '@/features/agenda';
import { DashboardPage } from '@/features/dashboard';
import { PatientsPage } from '@/features/patients';
import { ProceduresPage } from '@/features/procedures';
import { RecordsPage } from '@/features/records';
import { SettingsPage } from '@/features/clinic-settings';
import { PatientForm } from '@/features/patients';
import { AppointmentForm } from '@/features/agenda';
import { ProcedureForm } from '@/features/procedures';
import { RecordForm } from '@/features/records';
import { ContactPatient } from '@/features/contact-patient';
import { isAdmin } from '@/shared/model';
import { useAppViewModel } from '../viewmodel/useAppViewModel.js';
import { useConfirmationViewModel } from '../viewmodel/useConfirmationViewModel.js';
import './styles.css';

class ErrorBoundary extends Component {
 state={error:false};
 static getDerivedStateFromError(){return {error:true};}
 render(){return this.state.error?<main className="fatal-error"><ToothLogo size={64}/><h1>Não foi possível abrir esta tela.</h1><p>Recarregue a aplicação para tentar novamente.</p><Button onClick={()=>window.location.reload()} icon={RefreshCw}>Recarregar</Button></main>:this.props.children;}
}
function Confirmation({modal,onClose,onConfirm}) {const {busy,error,confirm}=useConfirmationViewModel(onConfirm,onClose);const logout=modal.type==='logout';return <><div className={'confirmation-icon '+(logout?'':'danger')}><span>{logout?<LogOut size={28}/>:<Trash2 size={28}/>}</span></div><p className="confirmation-copy">{logout?'Você poderá entrar novamente com seu e-mail e sua senha.':modal.kind==='patients'?'Ao excluir '+modal.item.name+', o histórico clínico e as consultas vinculadas também serão excluídos. Esta ação não pode ser desfeita.':'O registro será excluído permanentemente. Deseja continuar?'}</p><ErrorNotice>{error}</ErrorNotice><div className="form-footer"><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button variant={logout?'primary':'danger'} disabled={busy} onClick={confirm}>{busy?'Aguarde...':logout?'Sair da conta':'Excluir registro'}</Button></div></>;}
function Application() {
 const {data,loading,setLoading,loadError,path,modal,setModal,toast,setToast,refresh,navigate,save,authenticated,route,confirmAction}=useAppViewModel();
 const common={data,onModal:setModal,onNavigate:navigate,onReschedule:async(item,date,time)=>{await save('appointments',{...item,date,time:time||item.time});}};
 let page;
 switch(route){case 'dashboard':page=<DashboardPage {...common}/>;break;case 'pacientes':page=<PatientsPage {...common}/>;break;case 'procedimentos':page=<ProceduresPage {...common}/>;break;case 'prontuarios':page=path.split('/')[1]?<RecordsPage {...common} patientId={path.split('/')[1]}/>:<PatientsPage {...common} recordsOnly/>;break;case 'configuracoes':page=<SettingsPage data={data} onUpdated={refresh} onNotify={setToast}/>;break;default:page=<AgendaPage {...common}/>;}
 if(loading)return <Loading/>;
 if(!data&&loadError)return <main className="fatal-error"><ToothLogo size={64}/><h1>Vamos reconectar sua clínica.</h1><ErrorNotice>{loadError}</ErrorNotice><Button icon={RefreshCw} onClick={()=>{setLoading(true);refresh().catch(()=>{}).finally(()=>setLoading(false));}}>Tentar novamente</Button></main>;
 if(!data)return <AuthPage onAuthenticated={authenticated}/>;
 const titles={patient:modal?.item?'Editar paciente':'Novo paciente',procedure:modal?.item?'Editar procedimento':'Novo procedimento',appointment:modal?.item?'Detalhes da consulta':'Novo agendamento',record:'Novo atendimento',delete:'Confirmar exclusão',logout:'Sair da conta?',contact:'Contatar paciente'};
 return <><a className="skip-link" href="#main-content" onClick={event=>{event.preventDefault();document.getElementById('main-content')?.focus();}}>Pular para o conteúdo</a><AppShell user={data.user} settings={data.settings} route={route} onNavigate={navigate} onLogout={()=>setModal({type:'logout'})}>{loadError&&<ErrorNotice>{loadError}</ErrorNotice>}{page}</AppShell>{toast&&<div role="status" className="toast"><CheckCircle2 size={21}/>{toast}<button onClick={()=>setToast('')} aria-label="Fechar notificação">×</button></div>}{modal&&<Modal key={modal.type+(modal.item?.id||'')} title={titles[modal.type]} description={modal.type==='appointment'?'Organize os detalhes do atendimento.':modal.type==='patient'?'Um novo sorriso para cuidar.':undefined} wide={['appointment','patient'].includes(modal.type)} onClose={()=>setModal(null)}>{modal.type==='patient'&&<PatientForm patient={modal.item} onSave={save} onCancel={()=>setModal(null)}/>} {modal.type==='procedure'&&<ProcedureForm procedure={modal.item} onSave={save} onCancel={()=>setModal(null)}/>} {modal.type==='appointment'&&<AppointmentForm appointment={modal.item} initialDate={modal.date} initialTime={modal.time} patients={data.patients} procedures={isAdmin(data.user)?data.procedures:data.appointmentOptions} settings={data.settings} user={data.user} onSave={save} onCancel={()=>setModal(null)} onDelete={item=>setModal({type:'delete',kind:'appointments',item})}/>} {modal.type==='record'&&<RecordForm patientId={modal.patientId} tooth={modal.tooth} onSave={save} onCancel={()=>setModal(null)}/>} {modal.type==='contact'&&<ContactPatient patient={modal.item}/>} {['delete','logout'].includes(modal.type)&&<Confirmation modal={modal} onClose={()=>setModal(null)} onConfirm={()=>confirmAction(modal)}/>}</Modal>}</>;
}
export function App(){return <ErrorBoundary><Application/></ErrorBoundary>;}
