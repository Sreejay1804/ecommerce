package com.example.customermanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.actuate.autoconfigure.wavefront.WavefrontProperties.Application;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CustomerManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}