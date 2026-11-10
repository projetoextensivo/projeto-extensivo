package br.com.odontoagenda.service;
import java.util.*;
import br.com.odontoagenda.api.ApiException;
import br.com.odontoagenda.repository.ClinicRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
@Service
public class AuthService {
 private final ClinicRepository repo; private final BCryptPasswordEncoder encoder=new BCryptPasswordEncoder();
 public AuthService(ClinicRepository repo){this.repo=repo;}
 public String encode(String password){return encoder.encode(password);}
 public boolean matches(String raw,String encoded){return encoder.matches(raw,encoded);}
 public Map<String,Object> publicUser(Map<String,Object> u){Map<String,Object> p=new HashMap<>(u);p.remove("password");return p;}
 public Map<String,Object> current(HttpServletRequest req){var session=req.getSession(false);if(session==null||session.getAttribute("email")==null)throw new ApiException("Entre na sua conta para continuar.",401);var u=repo.user(session.getAttribute("email").toString());if(u==null)throw new ApiException("Entre na sua conta para continuar.",401);return u;}
 public boolean admin(Map<String,Object> u){return "Administrador".equals(u.get("role"));}
 public void requireAdmin(Map<String,Object> u){if(!admin(u))throw new ApiException("Acesso exclusivo da administradora.",403);}
 public Map<String,Object> login(Map<String,Object> b,HttpServletRequest req){var u=repo.user(text(b,"email").toLowerCase(Locale.ROOT));if(u==null||!matches(text(b,"password"),u.get("password").toString()))throw new ApiException("E-mail ou senha incorretos.",401);if(req.getSession(false)!=null)req.getSession(false).invalidate();req.getSession(true).setAttribute("email",u.get("email"));req.getSession().setMaxInactiveInterval(Boolean.FALSE.equals(b.get("remember"))?43200:604800);return publicUser(u);}
 public Map<String,Object> register(Map<String,Object> b,HttpServletRequest req){String email=text(b,"email").toLowerCase(Locale.ROOT),password=text(b,"password");if(!text(b,"role").isEmpty()&&!List.of("Secretária","Recepcionista").contains(text(b,"role")))throw new ApiException("O cadastro público permite apenas secretárias.",403);if(text(b,"name").length()<3||!email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+")||password.length()<8||password.length()>72||!password.equals(text(b,"confirmPassword"))||!Boolean.TRUE.equals(b.get("terms")))throw new ApiException("Confira nome, e-mail, senha, confirmação e aceite dos termos.");if(repo.user(email)!=null)throw new ApiException("Este e-mail já possui uma conta.",409);repo.addUser(new HashMap<>(Map.of("id",UUID.randomUUID().toString(),"email",email,"name",text(b,"name"),"role","Secretária","password",encode(password))));return login(b,req);}
 public Map<String,Object> account(Map<String,Object> b,Map<String,Object> u){if(text(b,"name").isEmpty())throw new ApiException("Informe seu nome.");if(!text(b,"newPassword").isEmpty()){if(!matches(text(b,"currentPassword"),text(u,"password")))throw new ApiException("A senha atual está incorreta.");if(text(b,"newPassword").length()<8||text(b,"newPassword").length()>72)throw new ApiException("Use uma senha com 8 a 72 caracteres.");u.put("password",encode(text(b,"newPassword")));}u.put("name",text(b,"name"));repo.updateUser(u);return publicUser(u);}
 public static String text(Map<String,Object> b,String key){return Objects.toString(b.get(key),"").trim();}
}
