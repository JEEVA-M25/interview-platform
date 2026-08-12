package AIINterview.CareerVerse.AI;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CareerVerseAiApplication {
	public static void main(String[] args) {
		SpringApplication.run(CareerVerseAiApplication.class, args);
	}
}