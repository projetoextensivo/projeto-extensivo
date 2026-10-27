package br.com.odontoagenda.api;
public class ApiException extends RuntimeException {
 public final int status;
 public ApiException(String message){this(message,400);}
 public ApiException(String message,int status){super(message);this.status=status;}
}
