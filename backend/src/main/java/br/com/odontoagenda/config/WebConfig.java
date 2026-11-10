package br.com.odontoagenda.config;
import java.util.*;
import br.com.odontoagenda.api.ApiException;
import br.com.odontoagenda.service.AuthService;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.*;
@Configuration
public class WebConfig implements WebMvcConfigurer {
 private final AuthService auth; private final String[] origins;
 public WebConfig(AuthService auth,@Value("${clinic.allowed-origins}") String origins){this.auth=auth;this.origins=origins.split(",");}
 @Override public void addCorsMappings(CorsRegistry r){r.addMapping("/api/**").allowedOrigins(origins).allowedMethods("GET","POST","PUT","DELETE","OPTIONS").allowCredentials(true);}
 @Override public void addInterceptors(InterceptorRegistry r){r.addInterceptor(new HandlerInterceptor(){
  @Override public boolean preHandle(HttpServletRequest req,HttpServletResponse res,Object handler){
   res.setHeader("X-Content-Type-Options","nosniff");res.setHeader("Cache-Control","no-store");
   if("OPTIONS".equals(req.getMethod()))return true;
   String origin=req.getHeader("Origin");if(!List.of("GET","HEAD").contains(req.getMethod())){String self=req.getScheme()+"://"+req.getHeader("Host");if((origin!=null&&!origin.equals(self)&&!Arrays.asList(origins).contains(origin))||"cross-site".equals(req.getHeader("Sec-Fetch-Site")))throw new ApiException("Origem não autorizada.",403);}
   String p=req.getRequestURI();if(p.equals("/api/health")||p.equals("/api/auth/login")||p.equals("/api/auth/register"))return true;
   var user=auth.current(req);if(p.startsWith("/api/procedures")||p.startsWith("/api/records")||p.equals("/api/dashboard")||p.equals("/api/settings")||("DELETE".equals(req.getMethod())&&p.startsWith("/api/patients")))auth.requireAdmin(user);
   return true;
  }
 }).addPathPatterns("/api/**");}
}
