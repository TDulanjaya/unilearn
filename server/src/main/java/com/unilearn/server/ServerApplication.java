package com.unilearn.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ServerApplication {

	public static void main(String[] args) {
		// exam and event times are local times, so run the server on local time too
		String zone = System.getenv().getOrDefault("APP_TIMEZONE", "Asia/Colombo");
		java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone(zone));
		SpringApplication.run(ServerApplication.class, args);
	}

}
