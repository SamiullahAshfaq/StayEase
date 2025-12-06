package com.stayease;

import com.stayease.security.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class StayeaseApplication {

	public static void main(String[] args) {
		SpringApplication.run(StayeaseApplication.class, args);
	}

}
