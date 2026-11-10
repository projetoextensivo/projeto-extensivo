package br.com.odontoagenda.api;
import java.util.*;
import br.com.odontoagenda.service.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api")
public class ClinicController {
 private final AuthService auth;private final ClinicService clinic;
 public ClinicController(AuthService auth,ClinicService clinic){this.auth=auth;this.clinic=clinic;}
 @GetMapping("/health") public Object health(){return Map.of("ok",true);}
 @PostMapping("/auth/login") public Object login(@RequestBody Map<String,Object> b,HttpServletRequest r){return auth.login(b,r);}
 @PostMapping("/auth/register") public Object register(@RequestBody Map<String,Object> b,HttpServletRequest r){return auth.register(b,r);}
 @GetMapping("/auth/me") public Object me(HttpServletRequest r){return auth.publicUser(auth.current(r));}
 @PostMapping("/auth/logout") public Object logout(HttpServletRequest r){r.getSession().invalidate();return Map.of("ok",true);}
 @GetMapping("/bootstrap") public Object bootstrap(HttpServletRequest r){return clinic.bootstrap(auth.current(r));}
 @PutMapping("/account") public Object account(@RequestBody Map<String,Object> b,HttpServletRequest r){return auth.account(b,auth.current(r));}
 @PutMapping("/settings") public Object settings(@RequestBody Map<String,Object> b){return clinic.saveSettings(b);}
 @GetMapping("/{kind:patients|procedures|appointments|records}") public Object list(@PathVariable String kind,HttpServletRequest r){return clinic.list(kind,auth.admin(auth.current(r)));}
 @GetMapping("/{kind:patients|procedures|appointments|records}/{id}") public Object get(@PathVariable String kind,@PathVariable String id,HttpServletRequest r){return clinic.visible(kind,clinic.required(kind,id),auth.admin(auth.current(r)));}
 @PostMapping("/{kind:patients|procedures|appointments|records}") public Object create(@PathVariable String kind,@RequestBody Map<String,Object> b,HttpServletRequest r){return ResponseEntity.status(201).body(clinic.save(kind,null,b,auth.current(r)));}
 @PutMapping("/{kind:patients|procedures|appointments|records}/{id}") public Object update(@PathVariable String kind,@PathVariable String id,@RequestBody Map<String,Object> b,HttpServletRequest r){return clinic.save(kind,id,b,auth.current(r));}
 @DeleteMapping("/{kind:patients|procedures|appointments|records}/{id}") public Object delete(@PathVariable String kind,@PathVariable String id,HttpServletRequest r){clinic.delete(kind,id,auth.current(r));return Map.of("ok",true);}
}
