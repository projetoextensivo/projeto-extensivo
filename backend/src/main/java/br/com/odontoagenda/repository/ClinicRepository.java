package br.com.odontoagenda.repository;
import java.util.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
@Repository
public class ClinicRepository {
 private final JdbcTemplate jdbc; private final ObjectMapper mapper;
 public ClinicRepository(JdbcTemplate jdbc,ObjectMapper mapper){this.jdbc=jdbc;this.mapper=mapper;}
 private Map<String,Object> decode(String value){try{return mapper.readValue(value,new TypeReference<Map<String,Object>>(){});}catch(Exception e){throw new IllegalStateException(e);}}
 public List<Map<String,Object>> list(String kind){return jdbc.query("SELECT payload FROM clinic_entities WHERE kind=? ORDER BY id",(rs,n)->decode(rs.getString(1)),kind);}
 public Map<String,Object> find(String kind,String id){return list(kind).stream().filter(x->id.equals(x.get("id"))).findFirst().orElse(null);}
 public Map<String,Object> save(String kind,Map<String,Object> item){try{jdbc.update("MERGE INTO clinic_entities (kind,id,payload) KEY(kind,id) VALUES (?,?,?)",kind,item.get("id"),mapper.writeValueAsString(item));return item;}catch(com.fasterxml.jackson.core.JsonProcessingException e){throw new IllegalStateException(e);}}
 public void lockCalendar(){jdbc.queryForList("SELECT id FROM clinic_entities WHERE kind='settings' AND id='clinic' FOR UPDATE");}
 public void delete(String kind,String id){jdbc.update("DELETE FROM clinic_entities WHERE kind=? AND id=?",kind,id);}
 public Map<String,Object> user(String email){return jdbc.query("SELECT * FROM clinic_users WHERE email=?",(rs,n)->{Map<String,Object> u=new HashMap<>();for(String k:List.of("id","email","name","role","password"))u.put(k,rs.getString(k));return u;},email).stream().findFirst().orElse(null);}
 public void addUser(Map<String,Object> u){jdbc.update("INSERT INTO clinic_users(id,email,name,role,password) VALUES(?,?,?,?,?)",u.get("id"),u.get("email"),u.get("name"),u.get("role"),u.get("password"));}
 public void updateUser(Map<String,Object> u){jdbc.update("UPDATE clinic_users SET name=?,password=? WHERE id=?",u.get("name"),u.get("password"),u.get("id"));}
}
