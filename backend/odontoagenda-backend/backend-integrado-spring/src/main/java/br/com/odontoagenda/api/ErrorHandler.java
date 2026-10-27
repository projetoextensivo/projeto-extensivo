package br.com.odontoagenda.api;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;
@RestControllerAdvice
public class ErrorHandler {
 @ExceptionHandler(ApiException.class) ResponseEntity<?> known(ApiException e){return ResponseEntity.status(e.status).body(Map.of("message",e.getMessage()));}
 @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<?> duplicate(Exception e){return ResponseEntity.status(409).body(Map.of("message","Registro já cadastrado ou vinculado a outros dados."));}
 @ExceptionHandler(Exception.class) ResponseEntity<?> unexpected(Exception e){return ResponseEntity.status(500).body(Map.of("message","Não foi possível concluir a operação."));}
}
