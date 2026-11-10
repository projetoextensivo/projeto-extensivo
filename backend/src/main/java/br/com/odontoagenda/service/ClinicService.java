package br.com.odontoagenda.service;
import java.time.*;
import java.util.*;
import br.com.odontoagenda.api.ApiException;
import br.com.odontoagenda.repository.ClinicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import static br.com.odontoagenda.service.AuthService.text;
@Service
public class ClinicService {
 private final ClinicRepository repo; private final AuthService auth;
 public ClinicService(ClinicRepository repo,AuthService auth){this.repo=repo;this.auth=auth;}
 public Map<String,Object> settings(){return repo.find("settings","clinic");}
 public Map<String,Object> required(String kind,String id){var item=repo.find(kind,id);if(item==null)throw new ApiException("Registro não encontrado.",404);return item;}
 public Map<String,Object> visible(String kind,Map<String,Object> item,boolean admin){var out=new HashMap<>(item);if(!admin&&kind.equals("appointments")){out.remove("price");out.remove("discount");}return out;}
 public Map<String,Object> bootstrap(Map<String,Object> user){boolean admin=auth.admin(user);var result=new HashMap<String,Object>();result.put("user",auth.publicUser(user));result.put("settings",settings());result.put("patients",repo.list("patients"));result.put("procedures",admin?repo.list("procedures"):List.of());result.put("appointmentOptions",repo.list("procedures").stream().map(p->Map.of("id",p.get("id"),"name",p.get("name"),"duration",p.get("duration"))).toList());result.put("appointments",repo.list("appointments").stream().map(a->visible("appointments",a,admin)).toList());result.put("records",admin?repo.list("records"):List.of());return result;}
 public List<Map<String,Object>> list(String kind,boolean admin){return repo.list(kind).stream().map(item->visible(kind,item,admin)).toList();}
 private double number(Map<String,Object> b,String key){try{double n=Double.parseDouble(text(b,key));if(!Double.isFinite(n))throw new NumberFormatException();return n;}catch(Exception e){throw new ApiException("Valor inválido: "+key);}}
 private LocalDate date(String value){try{return LocalDate.parse(value);}catch(Exception e){throw new ApiException("Informe uma data válida.");}}
 private LocalTime time(String value){if(!value.matches("([01]\\d|2[0-3]):[0-5]\\d"))throw new ApiException("Informe um horário válido.");return LocalTime.parse(value);}
 private void need(boolean valid,String message){if(!valid)throw new ApiException(message);}
 @Transactional public synchronized Map<String,Object> save(String kind,String id,Map<String,Object> b,Map<String,Object> user){
  var old=id==null?null:required(kind,id);var out=new HashMap<String,Object>();out.put("id",id==null?UUID.randomUUID().toString():id);
  switch(kind){
   case "patients"->{need(text(b,"name").length()>=3,"Informe o nome completo.");double age=number(b,"age");need(age>=0&&age<=120&&age==Math.floor(age),"Informe uma idade entre 0 e 120.");need(text(b,"phone").replaceAll("\\D","").length()>=10,"Informe telefone com DDD.");need(text(b,"email").isEmpty()||text(b,"email").matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+"),"Confira o e-mail.");need(List.of("Ativo","Inativo","Em tratamento","Retorno").contains(text(b,"status")),"Status inválido.");for(String k:List.of("name","phone","email","status","birthDate","cpf","allergies","notes"))out.put(k,text(b,k));out.put("age",(int)age);}
   case "procedures"->{auth.requireAdmin(user);need(!text(b,"name").isEmpty(),"Informe o nome.");need(List.of("Prevenção","Estética","Dentística","Endodontia","Cirurgia","Implantes","Ortodontia").contains(text(b,"category")),"Categoria inválida.");double duration=number(b,"duration"),price=number(b,"price");need(price>=0&&duration>=5&&duration<=480&&duration==Math.floor(duration),"Confira valor e duração (5 a 480 minutos).");for(String k:List.of("name","category","description"))out.put(k,text(b,k));out.put("duration",(int)duration);out.put("price",price);}
   case "appointments"->{repo.lockCalendar();
    var patient=required("patients",text(b,"patientId"));need(!"Inativo".equals(patient.get("status")),"Selecione um paciente ativo.");var procedure=required("procedures",text(b,"procedureId"));var day=date(text(b,"date"));var start=time(text(b,"time"));int duration=((Number)procedure.get("duration")).intValue();var cfg=settings();need(day.getDayOfWeek()!=DayOfWeek.SUNDAY,"A clínica não atende aos domingos.");need(((List<?>)cfg.get("dentists")).contains(text(b,"dentist")),"Selecione um dentista.");need(!start.isBefore(time(text(cfg,"openTime")))&&start.toSecondOfDay()+duration*60<=time(text(cfg,"closeTime")).toSecondOfDay(),"Escolha um horário dentro do expediente da clínica.");need(List.of("Confirmada","Aguardando","Em atendimento","Concluída","Cancelada").contains(text(b,"status")),"Status inválido.");
    if(!"Cancelada".equals(b.get("status")))for(var a:repo.list("appointments")){if(Objects.equals(a.get("id"),id)||!Objects.equals(a.get("date"),b.get("date"))||!Objects.equals(a.get("dentist"),b.get("dentist"))||"Cancelada".equals(a.get("status")))continue;var other=time(text(a,"time"));if(start.toSecondOfDay()<other.toSecondOfDay()+((Number)a.get("duration")).intValue()*60&&start.toSecondOfDay()+duration*60>other.toSecondOfDay())throw new ApiException("Este horário já está ocupado. Escolha outro horário.",409);}
    double price=old!=null&&Objects.equals(old.get("procedureId"),b.get("procedureId"))?((Number)old.get("price")).doubleValue():((Number)procedure.get("price")).doubleValue();double discount=auth.admin(user)?(text(b,"discount").isEmpty()?0:number(b,"discount")):(old==null?0:((Number)old.get("discount")).doubleValue());need(discount>=0&&discount<=price,"Confira o desconto.");need(List.of("Pix","Dinheiro","Cartão de crédito","Cartão de débito").contains(text(b,"payment")),"Selecione uma forma de pagamento.");for(String k:List.of("patientId","procedureId","date","time","status","dentist","payment","notes"))out.put(k,text(b,k));out.put("duration",duration);out.put("price",price);out.put("discount",discount);
   }
   case "records"->{auth.requireAdmin(user);required("patients",text(b,"patientId"));date(text(b,"date"));need(!text(b,"title").isEmpty()&&!text(b,"notes").isEmpty(),"Preencha título e descrição.");need(text(b,"tooth").isEmpty()||text(b,"tooth").matches("[1-4][1-8]"),"Dente inválido.");need(List.of("Sadio","Tratado","Em tratamento","Cárie","Ausente").contains(text(b,"condition")),"Condição inválida.");for(String k:List.of("patientId","date","title","notes","tooth","condition","anamnesis","category"))out.put(k,text(b,k));out.put("dentist",user.get("name"));}
   default->throw new ApiException("Recurso não encontrado.",404);
  }
  return visible(kind,repo.save(kind,out),auth.admin(user));
 }
 @Transactional public synchronized void delete(String kind,String id,Map<String,Object> user){required(kind,id);if(!kind.equals("appointments"))auth.requireAdmin(user);if(kind.equals("procedures")&&repo.list("appointments").stream().anyMatch(a->id.equals(a.get("procedureId"))))throw new ApiException("Este procedimento possui consultas vinculadas.",409);if(kind.equals("patients"))for(String related:List.of("appointments","records"))repo.list(related).stream().filter(a->id.equals(a.get("patientId"))).forEach(a->repo.delete(related,a.get("id").toString()));repo.delete(kind,id);}
 public Map<String,Object> saveSettings(Map<String,Object> b){need(!text(b,"clinicName").isEmpty(),"Informe o nome da clínica.");need(time(text(b,"openTime")).isBefore(time(text(b,"closeTime"))),"Confira o expediente.");var cfg=new HashMap<>(settings());for(String k:List.of("clinicName","phone","email","address","openTime","closeTime"))cfg.put(k,text(b,k));return repo.save("settings",cfg);}
}
