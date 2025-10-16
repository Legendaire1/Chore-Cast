package com.chorecast.controller;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ChoreCastApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChoreCastApplication.class, args);
    }
}
