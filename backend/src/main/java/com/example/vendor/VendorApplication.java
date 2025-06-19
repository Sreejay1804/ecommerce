package com.example.vendor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {"com.example.vendor"})
@EntityScan("com.example.vendor.model")
@EnableJpaRepositories("com.example.vendor.repository")
public class VendorApplication {
    public static void main(String[] args) {
        SpringApplication.run(VendorApplication.class, args);
    }
}