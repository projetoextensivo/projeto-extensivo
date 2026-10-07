package br.com.dentalcare.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI dentalCareOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("DentalCare API")
                        .description("Documentação da API do sistema DentalCare")
                        .version("v1"));
    }
}
