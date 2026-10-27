
package br.com.odontoagenda;
import java.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:tests;DB_CLOSE_DELAY=-1","clinic.demo=true","clinic.admin.email=","clinic.admin.password="})
@AutoConfigureMockMvc
class ClinicApiTest {
 @Autowired MockMvc mvc; @Autowired ObjectMapper json;
 @Test void rolesSchedulingAndConflicts() throws Exception {
  mvc.perform(get("/api/bootstrap")).andExpect(status().isUnauthorized());
  var login=mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("email","demo@odontoagenda.com","password","Odonto@2026")))).andExpect(status().isOk()).andReturn();
  var admin=(MockHttpSession)login.getRequest().getSession();
  mvc.perform(get("/api/procedures").session(admin)).andExpect(status().isOk());
  var signup=new HashMap<String,Object>(Map.of("name","Secretária Teste","email","secretaria@example.com","password","Senha@2026","confirmPassword","Senha@2026","terms",true,"role","Administrador"));
  mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(signup))).andExpect(status().isForbidden());
  signup.put("role","Secretária");
  var registered=mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(signup))).andExpect(status().isOk()).andReturn();
  var secretary=(MockHttpSession)registered.getRequest().getSession();
  for(String route:List.of("/api/procedures","/api/records","/api/dashboard"))mvc.perform(get(route).session(secretary)).andExpect(status().isForbidden());
  mvc.perform(put("/api/settings").session(secretary).contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isForbidden());
  mvc.perform(get("/api/bootstrap").session(secretary)).andExpect(jsonPath("$.procedures").isEmpty()).andExpect(jsonPath("$.records").isEmpty()).andExpect(jsonPath("$.appointments[0].price").doesNotExist()).andExpect(jsonPath("$.appointmentOptions[0].price").doesNotExist());
  var p=mvc.perform(post("/api/patients").session(secretary).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("name","Paciente Spring","age",30,"phone","11999998888","status","Ativo","insurance","Amil")))).andExpect(status().isCreated()).andExpect(jsonPath("$.insurance").doesNotExist()).andReturn();
  String patient=json.readTree(p.getResponse().getContentAsString()).get("id").asText();
  var appointment=new HashMap<String,Object>(Map.of("patientId",patient,"procedureId","pr1","date","2030-10-21","time","09:00","status","Confirmada","dentist","Lucas Maximo","payment","Pix"));
  var created=mvc.perform(post("/api/appointments").session(secretary).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(appointment))).andExpect(status().isCreated()).andExpect(jsonPath("$.price").doesNotExist()).andReturn();
  String id=json.readTree(created.getResponse().getContentAsString()).get("id").asText();
  mvc.perform(post("/api/appointments").session(secretary).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(appointment))).andExpect(status().isConflict());
  appointment.put("date","2030-10-22");
  mvc.perform(put("/api/appointments/"+id).session(secretary).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(appointment))).andExpect(status().isOk()).andExpect(jsonPath("$.date").value("2030-10-22"));
  appointment.put("date","2030-10-20");
  mvc.perform(put("/api/appointments/"+id).session(secretary).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(appointment))).andExpect(status().isBadRequest());
  mvc.perform(get("/api/appointments/"+id).session(secretary)).andExpect(jsonPath("$.date").value("2030-10-22"));
  mvc.perform(delete("/api/patients/"+patient).session(secretary)).andExpect(status().isForbidden());
  mvc.perform(post("/api/appointments").session(secretary).header("Origin","https://external.example").contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isForbidden());
  mvc.perform(post("/api/auth/logout").session(secretary)).andExpect(status().isOk());
 }
}
