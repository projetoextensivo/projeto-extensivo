package br.com.odontoagenda.config;
import java.util.*;
import br.com.odontoagenda.repository.ClinicRepository;
import br.com.odontoagenda.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;
import org.springframework.core.io.ClassPathResource;
@Configuration
public class SeedConfig {
 @Bean CommandLineRunner seed(ClinicRepository repo,AuthService auth,ObjectMapper mapper,@Value("${clinic.admin.email}") String email,@Value("${clinic.admin.password}") String password,@Value("${clinic.demo}") boolean demo){return args->{
  if(repo.find("settings","clinic")==null){Map<String,Object> settings=new HashMap<>();settings.put("id","clinic");settings.put("clinicName","OdontoAgenda");settings.put("phone","");settings.put("email","");settings.put("address","");settings.put("openTime","08:00");settings.put("closeTime","18:00");settings.put("dentists",List.of("Lucas Maximo","Ketellyn Santos"));settings.put("demo",demo);repo.save("settings",settings);
   if(demo){var data=mapper.readTree(new ClassPathResource("demo.json").getInputStream());for(String kind:List.of("patients","procedures","appointments","records"))for(var node:data.get(kind)){Map<String,Object> item=mapper.convertValue(node,new com.fasterxml.jackson.core.type.TypeReference<Map<String,Object>>(){});repo.save(kind,item);}}
  }
  if(!email.isBlank()&&repo.user(email.toLowerCase(Locale.ROOT))==null){if(password.length()<8||password.length()>72)throw new IllegalStateException("Defina ADMIN_PASSWORD com 8 a 72 caracteres.");repo.addUser(new HashMap<>(Map.of("id",UUID.randomUUID().toString(),"name","Administradora","email",email.toLowerCase(Locale.ROOT),"role","Administrador","password",auth.encode(password))));}
  if(demo&&repo.user("demo@odontoagenda.com")==null)repo.addUser(new HashMap<>(Map.of("id","demo","name","Lucas Maximo","email","demo@odontoagenda.com","role","Administrador","password",auth.encode("Odonto@2026"))));
 };}
}
